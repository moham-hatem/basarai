# Database Schema

Task 04 introduces the initial Supabase migration for the MVP schema. Brand is the tenant boundary. Brand-owned tables include `brand_id`, and Task 05 will add RLS helper functions and policies.

## Enums

### app_role

- `owner`
- `admin`
- `editor`
- `viewer`

### ai_provider

- `openai`
- `gemini`

### social_platform

- `linkedin`
- `instagram`
- `facebook`
- `x`

### output_language

- `ar`
- `en`
- `ar_en`

### generation_status

- `pending`
- `completed`
- `failed`

## Tables

### profiles

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text`
- `avatar_url text`
- `is_super_admin boolean not null default false`
- `locale output_language not null default 'en'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### brands

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text not null unique`
- `industry text`
- `website_url text`
- `default_language output_language not null default 'en'`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### brand_members

- `brand_id uuid not null references brands(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role app_role not null default 'viewer'`
- `invited_by uuid references auth.users(id)`
- `created_at timestamptz not null default now()`
- Primary key: `(brand_id, user_id)`

### brand_kits

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `voice text`
- `audience text`
- `value_props text`
- `banned_terms text`
- `name text not null default 'Default Brand Kit'`
- `is_default boolean not null default true`
- `guidelines jsonb not null default '{}'::jsonb`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Unique key: `brand_id`

### brand_provider_keys

Stores provider key metadata only. Raw OpenAI and Gemini keys must never be stored in this table.

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `provider ai_provider not null`
- `vault_secret_id text not null`
- `masked_key text not null`
- `is_active boolean not null default true`
- `last_tested_at timestamptz`
- `last_test_status text`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- Unique key: `(brand_id, provider)`

### generation_history

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `user_id uuid not null references profiles(id)`
- `provider ai_provider not null`
- `model text not null`
- `platform social_platform not null`
- `language output_language not null`
- `status generation_status not null default 'pending'`
- `prompt_snapshot jsonb not null default '{}'::jsonb`
- `input_payload jsonb not null default '{}'::jsonb`
- `output jsonb not null default '{}'::jsonb`
- `tokens integer not null default 0`
- `latency_ms integer`
- `error_message text`
- `created_at timestamptz not null default now()`
- `completed_at timestamptz`

### usage_events

For analytics and future usage limits.

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `user_id uuid references auth.users(id)`
- `generation_id uuid references generation_history(id)`
- `event_type text not null`
- `provider ai_provider`
- `model text`
- `platform social_platform`
- `language output_language`
- `tokens integer not null default 0`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

### admin_audit_logs

For super admin audit trails.

- `id uuid primary key default gen_random_uuid()`
- `actor_user_id uuid references auth.users(id)`
- `brand_id uuid references brands(id)`
- `action text not null`
- `target_table text`
- `target_id uuid`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

## Triggers

- `public.set_updated_at()` updates `updated_at` before row updates.
- `profiles`, `brands`, `brand_kits`, and `brand_provider_keys` use the `updated_at` trigger.
- `auth.users` is managed by Supabase Auth.
- `public.handle_new_user()` creates a matching `public.profiles` row after a new `auth.users` row is inserted.
- Profile creation reads safe optional `full_name` and `avatar_url` metadata, defaults `locale` to `en`, and always sets `is_super_admin` to `false`.
- First super admin assignment still needs a controlled manual process later.
- Brand creation and onboarding are not part of the profile creation trigger.
- The initial schema includes first-brand onboarding fields for `brands.industry`, `brands.website_url`, `brand_kits.name`, and `brand_kits.is_default`.

## RLS

- RLS is enabled on every app table in the initial migration.
- Task 05 adds security-definer helper functions for super admin checks, Brand membership checks, Brand role checks, and first-owner onboarding.
- Task 05 adds policies for profile ownership, Brand membership, role-based tenant access, provider-key metadata access, generation history, usage event inserts, and super-admin audit access.
- `brand_provider_keys` stores metadata only. Raw provider keys must stay outside app tables.
- `generation_history.user_id` references `profiles(id)` from the initial schema so inserts can require `user_id = auth.uid()`.
- No permissive authenticated `using (true)` policies are used.
- Service role access remains server-side only and must never be used in client bundles.
