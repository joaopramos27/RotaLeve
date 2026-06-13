begin;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
on storage.objects
for select
using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_own" on storage.objects;
create policy "product_images_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "product_images_update_own" on storage.objects;
create policy "product_images_update_own"
on storage.objects
for update
using (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and name like auth.uid()::text || '/%'
);

drop policy if exists "product_images_delete_own" on storage.objects;
create policy "product_images_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and name like auth.uid()::text || '/%'
);

commit;
