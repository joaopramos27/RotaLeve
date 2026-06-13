begin;

create or replace function public.save_client_with_products(
  p_usuario_id uuid,
  p_nome text,
  p_cliente_id uuid default null,
  p_telefone text default null,
  p_cidade text default null,
  p_endereco text default null,
  p_regiao_id uuid default null,
  p_observacoes text default '',
  p_product_ids uuid[] default array[]::uuid[]
)
returns public.clientes
language plpgsql
as $$
declare
  v_client public.clientes;
begin
  if p_cliente_id is null then
    insert into public.clientes (
      usuario_id,
      nome,
      telefone,
      cidade,
      endereco,
      regiao_id,
      observacoes
    )
    values (
      p_usuario_id,
      p_nome,
      p_telefone,
      p_cidade,
      p_endereco,
      p_regiao_id,
      coalesce(p_observacoes, '')
    )
    returning * into v_client;
  else
    update public.clientes
    set
      nome = p_nome,
      telefone = p_telefone,
      cidade = p_cidade,
      endereco = p_endereco,
      regiao_id = p_regiao_id,
      observacoes = coalesce(p_observacoes, '')
    where id = p_cliente_id
      and usuario_id = p_usuario_id
    returning * into v_client;

    if not found then
      raise exception 'Cliente nao encontrado.';
    end if;
  end if;

  delete from public.cliente_produtos
  where cliente_id = v_client.id;

  insert into public.cliente_produtos (cliente_id, produto_id)
  select v_client.id, selected_products.produto_id
  from (
    select distinct unnest(coalesce(p_product_ids, array[]::uuid[])) as produto_id
  ) as selected_products;

  return v_client;
end;
$$;

grant execute on function public.save_client_with_products(uuid, text, uuid, text, text, text, uuid, text, uuid[]) to authenticated;
grant execute on function public.save_client_with_products(uuid, text, uuid, text, text, text, uuid, text, uuid[]) to service_role;

commit;
