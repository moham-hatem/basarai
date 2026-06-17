alter table public.brand_provider_keys
drop constraint if exists brand_provider_keys_last_test_status;

update public.brand_provider_keys
set last_test_status = 'valid'
where last_test_status = 'success';

alter table public.brand_provider_keys
add constraint brand_provider_keys_last_test_status check (
  last_test_status is null or last_test_status in ('untested', 'valid', 'invalid', 'failed')
);

create or replace function public.get_brand_provider_key_secret(
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

  if not public.has_brand_role(target_brand_id, array['owner', 'admin']::public.app_role[]) then
    raise exception 'insufficient permissions';
  end if;

  select decrypted.decrypted_secret
  into provider_secret
  from public.brand_provider_keys provider_keys
  join vault.decrypted_secrets decrypted
    on decrypted.id = provider_keys.vault_secret_id::uuid
  where provider_keys.brand_id = target_brand_id
    and provider_keys.provider = target_provider
    and provider_keys.is_active;

  if provider_secret is null or length(btrim(provider_secret)) = 0 then
    raise exception 'provider key not found';
  end if;

  return provider_secret;
end;
$$;

revoke all on function public.get_brand_provider_key_secret(
  uuid,
  public.ai_provider
) from public;

grant execute on function public.get_brand_provider_key_secret(
  uuid,
  public.ai_provider
) to authenticated;
