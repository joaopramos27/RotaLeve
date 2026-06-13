begin;

alter table public.clientes
add column if not exists observacoes text not null default '';

commit;
