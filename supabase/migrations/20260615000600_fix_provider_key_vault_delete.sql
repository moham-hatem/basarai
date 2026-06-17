create or replace function public.delete_brand_provider_vault_secret(
  target_brand_id uuid,
  target_provider public.ai_provider
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_secret_id text;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  if not public.has_brand_role(target_brand_id, array['owner', 'admin']::public.app_role[]) then
    raise exception 'insufficient permissions';
  end if;

  select vault_secret_id
  into existing_secret_id
  from public.brand_provider_keys
  where brand_id = target_brand_id
    and provider = target_provider;

  if existing_secret_id is not null then
    delete from vault.secrets
    where id = existing_secret_id::uuid;
  end if;

  delete from public.brand_provider_keys
  where brand_id = target_brand_id
    and provider = target_provider;
end;
$$;

revoke all on function public.delete_brand_provider_vault_secret(
  uuid,
  public.ai_provider
) from public;

grant execute on function public.delete_brand_provider_vault_secret(
  uuid,
  public.ai_provider
) to authenticated;
