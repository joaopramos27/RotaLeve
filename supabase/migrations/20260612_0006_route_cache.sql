begin;

create table if not exists public.route_cache (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  cache_key text not null,
  selected_client_ids uuid[] not null default '{}'::uuid[],
  selected_snapshot jsonb not null default '[]'::jsonb,
  origin_label text not null,
  destination_label text not null,
  result_json jsonb not null,
  expires_at timestamptz not null,
  data_criacao timestamptz not null default now(),
  data_atualizacao timestamptz not null default now(),
  constraint route_cache_usuario_cache_key_unique unique (usuario_id, cache_key)
);

create table if not exists public.route_generation_requests (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  cache_key text not null,
  data_criacao timestamptz not null default now()
);

create index if not exists idx_route_cache_usuario_cache_key
  on public.route_cache (usuario_id, cache_key);

create index if not exists idx_route_cache_expires_at
  on public.route_cache (expires_at);

create index if not exists idx_route_generation_requests_usuario_created_at
  on public.route_generation_requests (usuario_id, data_criacao desc);

alter table public.route_cache enable row level security;
alter table public.route_generation_requests enable row level security;

revoke all on table public.route_cache from public;
revoke all on table public.route_generation_requests from public;

grant all privileges on table public.route_cache to service_role;
grant all privileges on table public.route_generation_requests to service_role;

commit;

