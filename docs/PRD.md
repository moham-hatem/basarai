# Basarai PRD

## Summary

Basarai is a brand-based multi-tenant SaaS social media generator. Teams create a Brand tenant, store reusable brand context, and generate Arabic or English social media copy through server-side AI workflows.

## MVP Goals

- Supabase Auth for sign up, sign in, and session management.
- Brand tenants with role-based membership.
- Brand profiles containing voice, audience, offers, banned terms, and language preferences.
- BYOK AI provider setup for OpenAI and Gemini.
- Server-side social copy generation for Arabic and English.
- Saved generation history scoped to the active Brand.
- Supabase Postgres with RLS as the source of truth.
- Supabase Storage for brand assets.
- Supabase Vault for encrypted provider credentials.

## Non-Goals

- No Stripe or paid billing flows in MVP.
- No direct publishing to social networks in MVP.
- No browser access to provider API keys.
- No client-side AI generation.

## Primary Users

- Brand owner: owns workspace setup, membership, and provider keys.
- Brand editor: manages brand context and generates content.
- Brand viewer: reviews saved generations and assets.

## Core Flows

1. User authenticates with Supabase Auth.
2. User creates or joins a Brand tenant.
3. Owner configures encrypted provider credentials through a server action or route handler.
4. Editor adds brand context and chooses Arabic or English.
5. Editor requests platform-specific content.
6. Server loads tenant-scoped context, decrypts provider credentials through Vault, calls the selected AI provider, and stores the result.

## Acceptance Criteria

- Local app runs with `npm run dev`.
- TypeScript passes with `npm run typecheck`.
- Lint passes with `npm run lint`.
- Feature code has clear boundaries for auth, brands, and content generation.
- Documentation explains MVP scope, architecture, schema, workflow, and security constraints.
