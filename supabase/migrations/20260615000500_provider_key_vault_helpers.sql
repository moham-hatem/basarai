create extension if not exists supabase_vault with schema vault;

create or replace function public.upsert_brand_provider_vault_secret(
  target_brand_id uuid,
  target_provider public.ai_provider,
  raw_provider_key text,
  masked_provider_key text,
  key_label text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  secret_id uuid;
  secret_name text;
  secret_description text;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  if not public.has_brand_role(target_brand_id, array['owner', 'admin']::public.app_role[]) then
    raise exception 'insufficient permissions';
  end if;

  if raw_provider_key is null or length(btrim(raw_provider_key)) < 8 then
    raise exception 'invalid provider key';
  end if;

  if masked_provider_key is null or length(btrim(masked_provider_key)) = 0 then
    raise exception 'invalid provider key metadata';
  end if;

  select vault_secret_id::uuid
  into secret_id
  from public.brand_provider_keys
  where brand_id = target_brand_id
    and provider = target_provider;

  secret_name := concat(
    'basarai/',
    target_brand_id::text,
    '/',
    target_provider::text
  );
  secret_description := concat(
    'Basarai BYOK provider key',
    case
      when key_label is null or btrim(key_label) = '' then ''
      else concat(': ', left(btrim(key_label), 80))
    end
  );

  if secret_id is not null then
    perform vault.update_secret(
      secret_id,
      raw_provider_key,
      secret_name,
      secret_description
    );
  else
    secret_id := vault.create_secret(
      raw_provider_key,
      secret_name,
      secret_description
    );
  end if;

  insert into public.brand_provider_keys (
    brand_id,
    provider,
    vault_secret_id,
    masked_key,
    is_active,
    last_tested_at,
    last_test_status,
    created_by
  )
  values (
    target_brand_id,
    target_provider,
    secret_id::text,
    masked_provider_key,
    true,
    null,
    'untested',
    actor_id
  )
  on conflict (brand_id, provider)
  do update set
    vault_secret_id = excluded.vault_secret_id,
    masked_key = excluded.masked_key,
    is_active = true,
    last_tested_at = null,
    last_test_status = 'untested',
    updated_at = now();
end;
$$;

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
    perform vault.delete_secret(existing_secret_id::uuid);
  end if;

  delete from public.brand_provider_keys
  where brand_id = target_brand_id
    and provider = target_provider;
end;
$$;

revoke all on function public.upsert_brand_provider_vault_secret(
  uuid,
  public.ai_provider,
  text,
  text,
  text
) from public;
revoke all on function public.delete_brand_provider_vault_secret(
  uuid,
  public.ai_provider
) from public;

grant execute on function public.upsert_brand_provider_vault_secret(
  uuid,
  public.ai_provider,
  text,
  text,
  text
) to authenticated;
grant execute on function public.delete_brand_provider_vault_secret(
  uuid,
  public.ai_provider
) to authenticated;
