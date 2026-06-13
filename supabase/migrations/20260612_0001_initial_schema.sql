begin;

create extension if not exists "pgcrypto";

-- =========================================================
-- Tables
-- =========================================================

create table if not exists public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null unique,
  data_criacao timestamptz not null default now()
);

create table if not exists public.regioes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  nome text not null,
  data_criacao timestamptz not null default now(),
  constraint regioes_usuario_nome_unique unique (usuario_id, nome)
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(12,2) not null default 0,
  imagem_url text,
  data_criacao timestamptz not null default now(),
  constraint produtos_preco_non_negative check (preco >= 0)
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  nome text not null,
  telefone text,
  cidade text,
  endereco text,
  regiao_id uuid references public.regioes (id) on delete set null,
  data_criacao timestamptz not null default now()
);

create table if not exists public.cliente_produtos (
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  produto_id uuid not null references public.produtos (id) on delete cascade,
  data_criacao timestamptz not null default now(),
  primary key (cliente_id, produto_id)
);

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  valor numeric(12,2) not null default 0,
  data_venda date not null default current_date,
  proxima_visita date,
  data_criacao timestamptz not null default now(),
  constraint vendas_valor_non_negative check (valor >= 0)
);

-- =========================================================
-- Indexes
-- =========================================================

create index if not exists idx_regioes_usuario_id
  on public.regioes (usuario_id);

create index if not exists idx_produtos_usuario_id
  on public.produtos (usuario_id);

create index if not exists idx_clientes_usuario_id
  on public.clientes (usuario_id);

create index if not exists idx_clientes_regiao_id
  on public.clientes (regiao_id);

create index if not exists idx_cliente_produtos_cliente_id
  on public.cliente_produtos (cliente_id);

create index if not exists idx_cliente_produtos_produto_id
  on public.cliente_produtos (produto_id);

create index if not exists idx_vendas_cliente_id
  on public.vendas (cliente_id);

create index if not exists idx_vendas_data_venda
  on public.vendas (data_venda);

-- =========================================================
-- Helpers
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email
  );

  return new;
end;
$$;

create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.usuarios
  set
    email = new.email,
    nome = coalesce(new.raw_user_meta_data->>'nome', nome)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.handle_user_email_update();

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.usuarios enable row level security;
alter table public.regioes enable row level security;
alter table public.produtos enable row level security;
alter table public.clientes enable row level security;
alter table public.cliente_produtos enable row level security;
alter table public.vendas enable row level security;

-- usuarios
drop policy if exists "usuarios_select_own" on public.usuarios;
create policy "usuarios_select_own"
on public.usuarios
for select
using (id = auth.uid());

drop policy if exists "usuarios_update_own" on public.usuarios;
create policy "usuarios_update_own"
on public.usuarios
for update
using (id = auth.uid())
with check (id = auth.uid());

-- regioes
drop policy if exists "regioes_select_own" on public.regioes;
create policy "regioes_select_own"
on public.regioes
for select
using (usuario_id = auth.uid());

drop policy if exists "regioes_insert_own" on public.regioes;
create policy "regioes_insert_own"
on public.regioes
for insert
with check (usuario_id = auth.uid());

drop policy if exists "regioes_update_own" on public.regioes;
create policy "regioes_update_own"
on public.regioes
for update
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

drop policy if exists "regioes_delete_own" on public.regioes;
create policy "regioes_delete_own"
on public.regioes
for delete
using (usuario_id = auth.uid());

-- produtos
drop policy if exists "produtos_select_own" on public.produtos;
create policy "produtos_select_own"
on public.produtos
for select
using (usuario_id = auth.uid());

drop policy if exists "produtos_insert_own" on public.produtos;
create policy "produtos_insert_own"
on public.produtos
for insert
with check (usuario_id = auth.uid());

drop policy if exists "produtos_update_own" on public.produtos;
create policy "produtos_update_own"
on public.produtos
for update
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

drop policy if exists "produtos_delete_own" on public.produtos;
create policy "produtos_delete_own"
on public.produtos
for delete
using (usuario_id = auth.uid());

-- clientes
drop policy if exists "clientes_select_own" on public.clientes;
create policy "clientes_select_own"
on public.clientes
for select
using (usuario_id = auth.uid());

drop policy if exists "clientes_insert_own" on public.clientes;
create policy "clientes_insert_own"
on public.clientes
for insert
with check (
  usuario_id = auth.uid()
  and (
    regiao_id is null
    or exists (
      select 1
      from public.regioes r
      where r.id = regiao_id
        and r.usuario_id = auth.uid()
    )
  )
);

drop policy if exists "clientes_update_own" on public.clientes;
create policy "clientes_update_own"
on public.clientes
for update
using (usuario_id = auth.uid())
with check (
  usuario_id = auth.uid()
  and (
    regiao_id is null
    or exists (
      select 1
      from public.regioes r
      where r.id = regiao_id
        and r.usuario_id = auth.uid()
    )
  )
);

drop policy if exists "clientes_delete_own" on public.clientes;
create policy "clientes_delete_own"
on public.clientes
for delete
using (usuario_id = auth.uid());

-- cliente_produtos
drop policy if exists "cliente_produtos_select_own" on public.cliente_produtos;
create policy "cliente_produtos_select_own"
on public.cliente_produtos
for select
using (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
  and exists (
    select 1
    from public.produtos p
    where p.id = produto_id
      and p.usuario_id = auth.uid()
  )
);

drop policy if exists "cliente_produtos_insert_own" on public.cliente_produtos;
create policy "cliente_produtos_insert_own"
on public.cliente_produtos
for insert
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
  and exists (
    select 1
    from public.produtos p
    where p.id = produto_id
      and p.usuario_id = auth.uid()
  )
);

drop policy if exists "cliente_produtos_delete_own" on public.cliente_produtos;
create policy "cliente_produtos_delete_own"
on public.cliente_produtos
for delete
using (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
  and exists (
    select 1
    from public.produtos p
    where p.id = produto_id
      and p.usuario_id = auth.uid()
  )
);

-- vendas
drop policy if exists "vendas_select_own" on public.vendas;
create policy "vendas_select_own"
on public.vendas
for select
using (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
);

drop policy if exists "vendas_insert_own" on public.vendas;
create policy "vendas_insert_own"
on public.vendas
for insert
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
);

drop policy if exists "vendas_update_own" on public.vendas;
create policy "vendas_update_own"
on public.vendas
for update
using (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
);

drop policy if exists "vendas_delete_own" on public.vendas;
create policy "vendas_delete_own"
on public.vendas
for delete
using (
  exists (
    select 1
    from public.clientes c
    where c.id = cliente_id
      and c.usuario_id = auth.uid()
  )
);

-- =========================================================
-- Grants
-- =========================================================

revoke all on table public.usuarios from public;
revoke all on table public.regioes from public;
revoke all on table public.produtos from public;
revoke all on table public.clientes from public;
revoke all on table public.cliente_produtos from public;
revoke all on table public.vendas from public;

grant usage on schema public to authenticated;
grant usage on schema public to service_role;

grant select, update on table public.usuarios to authenticated;
grant select, insert, update, delete on table public.regioes to authenticated;
grant select, insert, update, delete on table public.produtos to authenticated;
grant select, insert, update, delete on table public.clientes to authenticated;
grant select, insert, delete on table public.cliente_produtos to authenticated;
grant select, insert, update, delete on table public.vendas to authenticated;

grant all privileges on table public.usuarios to service_role;
grant all privileges on table public.regioes to service_role;
grant all privileges on table public.produtos to service_role;
grant all privileges on table public.clientes to service_role;
grant all privileges on table public.cliente_produtos to service_role;
grant all privileges on table public.vendas to service_role;

commit;
