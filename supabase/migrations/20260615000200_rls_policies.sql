create index profiles_super_admin_idx on public.profiles (id) where is_super_admin;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_super_admin = true
  );
$$;

create or replace function public.get_brand_role(target_brand_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select bm.role
  from public.brand_members as bm
  where bm.brand_id = target_brand_id
    and bm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_brand_member(target_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_brand_role(target_brand_id) is not null;
$$;

create or replace function public.has_brand_role(
  target_brand_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_brand_role(target_brand_id) = any(allowed_roles);
$$;

create or replace function public.can_bootstrap_brand_owner(
  target_brand_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_user_id
    and exists (
      select 1
      from public.brands as b
      where b.id = target_brand_id
        and b.created_by = target_user_id
    )
    and not exists (
      select 1
      from public.brand_members as bm
      where bm.brand_id = target_brand_id
    );
$$;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_select_super_admin"
on public.profiles
for select
to authenticated
using (public.is_super_admin());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and is_super_admin = false);

create policy "profiles_update_own_non_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() and is_super_admin = false)
with check (id = auth.uid() and is_super_admin = false);

create policy "profiles_super_admin_manage"
on public.profiles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "brands_select_members"
on public.brands
for select
to authenticated
using (public.is_brand_member(id));

create policy "brands_select_creator"
on public.brands
for select
to authenticated
using (created_by = auth.uid());

create policy "brands_select_super_admin"
on public.brands
for select
to authenticated
using (public.is_super_admin());

create policy "brands_insert_authenticated"
on public.brands
for insert
to authenticated
with check (created_by = auth.uid());

create policy "brands_update_owner_admin"
on public.brands
for update
to authenticated
using (public.has_brand_role(id, array['owner', 'admin']::public.app_role[]))
with check (public.has_brand_role(id, array['owner', 'admin']::public.app_role[]));

create policy "brands_delete_owner"
on public.brands
for delete
to authenticated
using (public.has_brand_role(id, array['owner']::public.app_role[]));

create policy "brands_super_admin_manage"
on public.brands
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "brand_members_select_brand_members"
on public.brand_members
for select
to authenticated
using (public.is_brand_member(brand_id));

create policy "brand_members_insert_owner_admin"
on public.brand_members
for insert
to authenticated
with check (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_members_update_owner_admin"
on public.brand_members
for update
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]))
with check (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_members_delete_owner_admin"
on public.brand_members
for delete
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_members_bootstrap_owner"
on public.brand_members
for insert
to authenticated
with check (
  role = 'owner'
  and user_id = auth.uid()
  and public.can_bootstrap_brand_owner(brand_id, user_id)
);

create policy "brand_members_super_admin_manage"
on public.brand_members
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "brand_kits_select_members"
on public.brand_kits
for select
to authenticated
using (public.is_brand_member(brand_id));

create policy "brand_kits_insert_owner_admin_editor"
on public.brand_kits
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[])
);

create policy "brand_kits_update_owner_admin_editor"
on public.brand_kits
for update
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[]))
with check (public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[]));

create policy "brand_kits_delete_owner_admin"
on public.brand_kits
for delete
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_kits_super_admin_manage"
on public.brand_kits
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "brand_provider_keys_select_owner_admin"
on public.brand_provider_keys
for select
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_provider_keys_insert_owner_admin"
on public.brand_provider_keys
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[])
);

create policy "brand_provider_keys_update_owner_admin"
on public.brand_provider_keys
for update
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]))
with check (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_provider_keys_delete_owner_admin"
on public.brand_provider_keys
for delete
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "brand_provider_keys_super_admin_manage"
on public.brand_provider_keys
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "generation_history_select_members"
on public.generation_history
for select
to authenticated
using (public.is_brand_member(brand_id));

create policy "generation_history_insert_generators"
on public.generation_history
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[])
);

create policy "generation_history_update_own_generators"
on public.generation_history
for update
to authenticated
using (
  user_id = auth.uid()
  and public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[])
)
with check (
  user_id = auth.uid()
  and public.has_brand_role(brand_id, array['owner', 'admin', 'editor']::public.app_role[])
);

create policy "generation_history_delete_owner_admin"
on public.generation_history
for delete
to authenticated
using (public.has_brand_role(brand_id, array['owner', 'admin']::public.app_role[]));

create policy "generation_history_super_admin_manage"
on public.generation_history
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "usage_events_select_super_admin"
on public.usage_events
for select
to authenticated
using (public.is_super_admin());

create policy "usage_events_insert_brand_members"
on public.usage_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_brand_member(brand_id)
);

create policy "admin_audit_logs_select_super_admin"
on public.admin_audit_logs
for select
to authenticated
using (public.is_super_admin());

create policy "admin_audit_logs_insert_super_admin"
on public.admin_audit_logs
for insert
to authenticated
with check (
  public.is_super_admin()
  and actor_user_id = auth.uid()
);
