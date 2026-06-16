alter table public.profiles
add column if not exists email text;

update public.profiles as p
set email = lower(nullif(btrim(u.email), ''))
from auth.users as u
where p.id = u.id
  and p.email is null
  and u.email is not null;

create unique index if not exists profiles_email_lower_unique_idx
on public.profiles (lower(email))
where email is not null;

alter table public.profiles
drop constraint if exists profiles_email_lowercase;

alter table public.profiles
add constraint profiles_email_lowercase
check (email is null or email = lower(email));

create or replace function public.prevent_profile_email_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.email is distinct from new.email then
    raise exception 'profile email cannot be updated directly';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profiles_email_update on public.profiles;

create trigger prevent_profiles_email_update
before update on public.profiles
for each row execute function public.prevent_profile_email_update();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    locale,
    is_super_admin
  )
  values (
    new.id,
    lower(nullif(btrim(new.email), '')),
    nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data->>'avatar_url'), ''),
    'en',
    false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create policy "profiles_select_same_brand_members"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.brand_members as current_member
    join public.brand_members as target_member
      on target_member.brand_id = current_member.brand_id
    where current_member.user_id = auth.uid()
      and target_member.user_id = profiles.id
  )
);

create or replace function public.find_profile_id_by_email_for_brand_admin(
  target_brand_id uuid,
  target_email text
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles as p
  where p.email = lower(nullif(btrim(target_email), ''))
    and public.has_brand_role(
      target_brand_id,
      array['owner', 'admin']::public.app_role[]
    )
  limit 1;
$$;
