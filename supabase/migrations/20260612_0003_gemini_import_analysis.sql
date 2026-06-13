begin;

create table if not exists public.gemini_import_rate_limits (
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  janela_inicio timestamptz not null,
  tentativas integer not null default 0,
  data_atualizacao timestamptz not null default now(),
  primary key (usuario_id, janela_inicio)
);

alter table public.gemini_import_rate_limits enable row level security;

revoke all on table public.gemini_import_rate_limits from public;

grant select, insert, update, delete on table public.gemini_import_rate_limits to service_role;

drop policy if exists "gemini_import_rate_limits_service_role" on public.gemini_import_rate_limits;
create policy "gemini_import_rate_limits_service_role"
on public.gemini_import_rate_limits
for all
to service_role
using (true)
with check (true);

create or replace function public.consume_gemini_import_quota(
  p_user_id uuid,
  p_limit integer default 6,
  p_window_minutes integer default 15
)
returns jsonb
language plpgsql
as $$
declare
  v_window_minutes integer := greatest(coalesce(p_window_minutes, 15), 1);
  v_limit integer := greatest(coalesce(p_limit, 6), 1);
  v_window_seconds integer := v_window_minutes * 60;
  v_window_start timestamptz := to_timestamp(floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds);
  v_request_count integer;
begin
  insert into public.gemini_import_rate_limits (usuario_id, janela_inicio, tentativas, data_atualizacao)
  values (p_user_id, v_window_start, 1, now())
  on conflict (usuario_id, janela_inicio)
  do update set
    tentativas = public.gemini_import_rate_limits.tentativas + 1,
    data_atualizacao = now()
  returning tentativas into v_request_count;

  return jsonb_build_object(
    'allowed',
    v_request_count <= v_limit,
    'request_count',
    v_request_count,
    'window_start',
    v_window_start
  );
end;
$$;

grant execute on function public.consume_gemini_import_quota(uuid, integer, integer) to service_role;

commit;
