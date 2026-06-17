-- Allow authorized brand generators to retrieve an active provider secret for server-side generation.
-- The raw secret is returned only by this security definer helper and must only be used from server actions.

create or replace function public.get_generation_provider_key_secret(
  target_brand_id uuid,
  target_provider public.ai_provider
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  provider_secret text;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  if not public.has_brand_role(
    target_brand_id,
    array['owner', 'admin', 'editor']::public.app_role[]
  ) then
    raise exception 'insufficient permissions';
  end if;

  select decrypted.decrypted_secret
  into provider_secret
  from public.brand_provider_keys provider_keys
  join vault.decrypted_secrets decrypted
    on decrypted.id = provider_keys.vault_secret_id::uuid
  where provider_keys.brand_id = target_brand_id
    and provider_keys.provider = target_provider
    and provider_keys.is_active = true
  limit 1;

  if provider_secret is null or length(btrim(provider_secret)) = 0 then
    raise exception 'provider key not found';
  end if;

  return provider_secret;
end;
$$;

revoke all on function public.get_generation_provider_key_secret(uuid, public.ai_provider) from public;
grant execute on function public.get_generation_provider_key_secret(uuid, public.ai_provider) to authenticated;
