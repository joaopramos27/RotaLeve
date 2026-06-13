begin;

alter table public.clientes
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists geocode_provider text,
add column if not exists geocode_address text,
add column if not exists geocode_at timestamptz;

alter table public.clientes
drop constraint if exists clientes_latitude_range;

alter table public.clientes
add constraint clientes_latitude_range
check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.clientes
drop constraint if exists clientes_longitude_range;

alter table public.clientes
add constraint clientes_longitude_range
check (longitude is null or (longitude >= -180 and longitude <= 180));

create index if not exists idx_clientes_geocode_at
on public.clientes (geocode_at);

commit;
