# Database Schema

## Tables

### profiles

- `id uuid primary key references auth.users(id)`
- `full_name text`
- `avatar_url text`
- `created_at timestamptz not null default now()`

### brands

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text not null unique`
- `default_locale text not null check (default_locale in ('en', 'ar'))`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`

### brand_memberships

- `brand_id uuid not null references brands(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role text not null check (role in ('owner', 'admin', 'editor', 'viewer'))`
- `created_at timestamptz not null default now()`
- Primary key: `(brand_id, user_id)`

### brand_profiles

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `locale text not null check (locale in ('en', 'ar'))`
- `voice text`
- `audience text`
- `value_props text`
- `banned_terms text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### ai_provider_credentials

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `provider text not null check (provider in ('openai', 'gemini'))`
- `vault_secret_id text not null`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- Unique key: `(brand_id, provider)`

### generations

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `created_by uuid not null references auth.users(id)`
- `provider text not null check (provider in ('openai', 'gemini'))`
- `locale text not null check (locale in ('en', 'ar'))`
- `channel text not null`
- `prompt text not null`
- `result jsonb not null`
- `created_at timestamptz not null default now()`

### brand_assets

- `id uuid primary key default gen_random_uuid()`
- `brand_id uuid not null references brands(id) on delete cascade`
- `storage_path text not null`
- `label text`
- `mime_type text`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`

## RLS Rules

- Enable RLS on every tenant-owned table.
- Users can read Brand rows only when they have a matching membership.
- Owners and admins can manage memberships and provider credentials.
- Editors can manage brand profiles, assets, and generations.
- Viewers can read brand profiles, assets, and generations.
- Service role access is allowed only in server-side trusted code and never in client bundles.
