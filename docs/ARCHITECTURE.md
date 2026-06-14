# Architecture

## Stack

- Next.js 16 App Router
- TypeScript with strict mode
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with Row Level Security
- Supabase Vault for encrypted BYOK provider credentials
- Supabase Storage for brand assets
- Server-side OpenAI and Gemini integrations

## Tenant Model

Brand is the tenant boundary. Every tenant-owned table must include `brand_id`, and every query must be scoped to the active Brand membership. RLS policies enforce membership-based access in Postgres.

## Application Layers

- `src/app`: routes, layouts, server actions, and route handlers.
- `src/features/auth`: session and membership types and feature code.
- `src/features/brands`: Brand tenant domain logic.
- `src/features/content-generation`: server-side generation domain logic.
- `src/lib`: shared configuration, environment helpers, and low-level clients.
- `docs`: product, architecture, schema, workflow, and security references.

## AI Generation

All AI generation happens on the server through route handlers or server actions. Client components may submit prompts and display results, but they must never receive provider credentials or Supabase service role credentials.

## BYOK Providers

Owners can configure OpenAI and Gemini credentials per Brand. Production credentials are encrypted with Supabase Vault and referenced from tenant-scoped records. Local development may use `.env.local` values, but those values remain server-only.

## Internationalization

The MVP supports English and Arabic content workflows. Data models store locale metadata so prompts, brand context, and generations can be filtered by language. UI routing can add locale segments later without changing the tenant model.

## Storage

Supabase Storage stores brand assets such as logos, product images, and reference files. Storage paths must include the Brand id, and access must be mediated by RLS-aware policies or short-lived signed URLs.

## MVP Boundaries

- Billing is intentionally deferred.
- Social network publishing is intentionally deferred.
- Generated content is reviewed and copied by users instead of posted directly.
