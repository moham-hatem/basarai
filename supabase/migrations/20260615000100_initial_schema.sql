create extension if not exists "pgcrypto";

create type public.app_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.ai_provider as enum ('openai', 'gemini');
create type public.social_platform as enum ('linkedin', 'instagram', 'facebook', 'x');
create type public.output_language as enum ('ar', 'en', 'ar_en');
create type public.generation_status as enum ('pending', 'completed', 'failed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  default_language public.output_language not null default 'en',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_slug_unique unique (slug),
  constraint brands_name_not_blank check (length(btrim(name)) > 0),
  constraint brands_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.brand_members (
  brand_id uuid not null references public.brands(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'viewer',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (brand_id, user_id)
);

create table public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  voice text,
  audience text,
  value_props text,
  banned_terms text,
  guidelines jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_kits_brand_id_unique unique (brand_id),
  constraint brand_kits_guidelines_object check (jsonb_typeof(guidelines) = 'object')
);

create table public.brand_provider_keys (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  provider public.ai_provider not null,
  vault_secret_id text not null,
  masked_key text not null,
  is_active boolean not null default true,
  last_tested_at timestamptz,
  last_test_status text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_provider_keys_brand_provider_unique unique (brand_id, provider),
  constraint brand_provider_keys_vault_secret_id_not_blank check (length(btrim(vault_secret_id)) > 0),
  constraint brand_provider_keys_masked_key_not_blank check (length(btrim(masked_key)) > 0),
  constraint brand_provider_keys_last_test_status check (
    last_test_status is null or last_test_status in ('untested', 'success', 'failed')
  )
);

create table public.generation_history (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  provider public.ai_provider not null,
  model text not null,
  platform public.social_platform not null,
  language public.output_language not null,
  status public.generation_status not null default 'pending',
  prompt_snapshot jsonb not null default '{}'::jsonb,
  input_payload jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  tokens integer not null default 0,
  latency_ms integer,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint generation_history_model_not_blank check (length(btrim(model)) > 0),
  constraint generation_history_prompt_snapshot_object check (jsonb_typeof(prompt_snapshot) = 'object'),
  constraint generation_history_input_payload_object check (jsonb_typeof(input_payload) = 'object'),
  constraint generation_history_output_object check (jsonb_typeof(output) = 'object'),
  constraint generation_history_tokens_non_negative check (tokens >= 0),
  constraint generation_history_latency_non_negative check (latency_ms is null or latency_ms >= 0)
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  generation_id uuid references public.generation_history(id) on delete set null,
  event_type text not null,
  provider public.ai_provider,
  model text,
  platform public.social_platform,
  language public.output_language,
  tokens integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint usage_events_event_type_not_blank check (length(btrim(event_type)) > 0),
  constraint usage_events_tokens_non_negative check (tokens >= 0),
  constraint usage_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_logs_action_not_blank check (length(btrim(action)) > 0),
  constraint admin_audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index profiles_created_at_idx on public.profiles (created_at desc);

create index brands_created_by_idx on public.brands (created_by);
create index brands_created_at_idx on public.brands (created_at desc);

create index brand_members_user_id_idx on public.brand_members (user_id);
create index brand_members_role_idx on public.brand_members (role);

create index brand_kits_brand_id_idx on public.brand_kits (brand_id);

create index brand_provider_keys_brand_id_idx on public.brand_provider_keys (brand_id);
create index brand_provider_keys_active_idx on public.brand_provider_keys (brand_id, provider) where is_active;

create index generation_history_brand_created_at_idx on public.generation_history (brand_id, created_at desc);
create index generation_history_created_by_idx on public.generation_history (created_by);
create index generation_history_status_idx on public.generation_history (status);
create index generation_history_platform_idx on public.generation_history (platform);

create index usage_events_brand_created_at_idx on public.usage_events (brand_id, created_at desc);
create index usage_events_user_created_at_idx on public.usage_events (user_id, created_at desc);
create index usage_events_generation_id_idx on public.usage_events (generation_id);

create index admin_audit_logs_actor_created_at_idx on public.admin_audit_logs (actor_user_id, created_at desc);
create index admin_audit_logs_brand_created_at_idx on public.admin_audit_logs (brand_id, created_at desc);
create index admin_audit_logs_action_idx on public.admin_audit_logs (action);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

create trigger set_brand_kits_updated_at
before update on public.brand_kits
for each row execute function public.set_updated_at();

create trigger set_brand_provider_keys_updated_at
before update on public.brand_provider_keys
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.brand_members enable row level security;
alter table public.brand_kits enable row level security;
alter table public.brand_provider_keys enable row level security;
alter table public.generation_history enable row level security;
alter table public.usage_events enable row level security;
alter table public.admin_audit_logs enable row level security;
