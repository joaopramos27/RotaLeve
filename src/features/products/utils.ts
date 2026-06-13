import type { Product, ProductFormErrors, ProductFormValues } from './types';
import { ACCEPTED_PRODUCT_IMAGE_TYPES, MAX_PRODUCT_IMAGE_SIZE_BYTES } from './constants';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatProductDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function createEmptyProductFormValues(): ProductFormValues {
  return {
    nome: '',
    descricao: '',
    preco: '',
    imagemFile: null,
    imagemUrl: '',
  };
}

export function mapProductToFormValues(product: Product): ProductFormValues {
  return {
    nome: product.nome,
    descricao: product.descricao ?? '',
    preco: String(product.preco),
    imagemFile: null,
    imagemUrl: product.imagem_url ?? '',
  };
}

export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const nome = values.nome.trim();
  const descricao = values.descricao.trim();
  const preco = Number(values.preco);

  if (!nome) {
    errors.nome = 'Informe o nome do produto.';
  } else if (nome.length < 2) {
    errors.nome = 'O nome precisa ter pelo menos 2 caracteres.';
  }

  if (descricao.length > 1000) {
    errors.descricao = 'A descricao deve ter no maximo 1000 caracteres.';
  }

  if (!values.preco.trim()) {
    errors.preco = 'Informe o preco do produto.';
  } else if (Number.isNaN(preco) || preco < 0) {
    errors.preco = 'Informe um preco valido.';
  }

  if (values.imagemFile) {
    if (!ACCEPTED_PRODUCT_IMAGE_TYPES.includes(values.imagemFile.type)) {
      errors.imagemFile = 'A imagem deve ser JPG, PNG ou WEBP.';
    } else if (values.imagemFile.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
      errors.imagemFile = 'A imagem deve ter no maximo 5 MB.';
    }
  }

  return errors;
}
