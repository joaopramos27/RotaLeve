import { supabase } from '../../lib/supabase/client';
import { isDemoMode } from '../../lib/appMode';
import { addDemoProducts, createOrUpdateDemoProduct, deleteDemoProduct, listDemoProducts } from '../demo/demoStore';
import { PRODUCT_IMAGE_BUCKET, PRODUCT_IMAGE_FOLDER } from './constants';
import type { Product, ProductFormValues, ProductImportSaveRow } from './types';

function buildImagePath(userId: string, fileName: string) {
  const safeFileName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
  return `${userId}/${PRODUCT_IMAGE_FOLDER}/${crypto.randomUUID()}-${safeFileName}`;
}

function parsePrice(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  return Number(normalized);
}

function extractStoragePathFromPublicUrl(publicUrl: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return publicUrl.slice(index + marker.length);
}

async function uploadProductImage(userId: string, file: File) {
  if (isDemoMode) {
    return { path: buildImagePath(userId, file.name), publicUrl: URL.createObjectURL(file) };
  }

  const path = buildImagePath(userId, file.name);
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

async function removeStoredImage(publicUrl: string | null) {
  if (isDemoMode) {
    return;
  }

  const storagePath = publicUrl ? extractStoragePathFromPublicUrl(publicUrl) : null;
  if (!storagePath) {
    return;
  }

  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([storagePath]);
}

export async function listProducts(userId: string): Promise<Product[]> {
  if (isDemoMode) {
    return listDemoProducts();
  }

  const { data, error } = await supabase
    .from('produtos')
    .select('id, usuario_id, nome, descricao, preco, imagem_url, data_criacao')
    .eq('usuario_id', userId)
    .order('data_criacao', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Product[];
}

export async function createProduct(userId: string, values: ProductFormValues) {
  if (isDemoMode) {
    return createOrUpdateDemoProduct(userId, {
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      preco: parsePrice(values.preco),
      imagemUrl: values.imagemUrl || (values.imagemFile ? URL.createObjectURL(values.imagemFile) : null),
    });
  }

  const image = values.imagemFile ? await uploadProductImage(userId, values.imagemFile) : null;

  const { data, error } = await supabase
    .from('produtos')
    .insert({
      usuario_id: userId,
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      preco: parsePrice(values.preco),
      imagem_url: image?.publicUrl ?? null,
    })
    .select('id, usuario_id, nome, descricao, preco, imagem_url, data_criacao')
    .single();

  if (error) {
    if (image) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.path]);
    }
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  userId: string,
  productId: string,
  values: ProductFormValues,
  currentImageUrl: string | null,
) {
  if (isDemoMode) {
    return createOrUpdateDemoProduct(userId, {
      productId,
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      preco: parsePrice(values.preco),
      imagemUrl: values.imagemUrl || currentImageUrl,
    });
  }

  const nextImage = values.imagemFile ? await uploadProductImage(userId, values.imagemFile) : null;
  const nextImageUrl = nextImage?.publicUrl ?? currentImageUrl;

  const { data, error } = await supabase
    .from('produtos')
    .update({
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || null,
      preco: parsePrice(values.preco),
      imagem_url: nextImageUrl,
    })
    .eq('id', productId)
    .eq('usuario_id', userId)
    .select('id, usuario_id, nome, descricao, preco, imagem_url, data_criacao')
    .single();

  if (error) {
    if (nextImage) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([nextImage.path]);
    }
    throw error;
  }

  if (nextImage && currentImageUrl && currentImageUrl !== nextImageUrl) {
    await removeStoredImage(currentImageUrl);
  }

  return data as Product;
}

export async function deleteProduct(userId: string, productId: string, imageUrl: string | null) {
  if (isDemoMode) {
    deleteDemoProduct(productId);
    return;
  }

  const { error } = await supabase.from('produtos').delete().eq('id', productId).eq('usuario_id', userId);

  if (error) {
    throw error;
  }

  await removeStoredImage(imageUrl);
}

export async function importValidatedProducts(userId: string, rows: ProductImportSaveRow[]) {
  if (isDemoMode) {
    addDemoProducts(rows);
    return;
  }

  const payload = rows.map((item) => ({
    usuario_id: userId,
    nome: item.nome,
    descricao: item.descricao || null,
    preco: item.preco,
    imagem_url: null,
  }));

  const { error } = await supabase.from('produtos').insert(payload);

  if (error) {
    throw error;
  }
}

