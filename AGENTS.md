<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Basarai Agent Guide

Basarai is a brand-based multi-tenant SaaS social media generator. Brand is the tenant boundary, and all tenant-owned records must be scoped by `brand_id`.

## Hard Rules

- Never expose AI provider keys to the browser.
- Never use Supabase service role keys in client code.
- All OpenAI and Gemini generation must happen server-side.
- Use Supabase RLS for tenant isolation.
- Store production BYOK credentials in Supabase Vault.
- Keep strict TypeScript enabled.

## MVP Boundaries

- No Stripe in MVP.
- No direct social publishing in MVP.
- Support Arabic and English generation workflows.

## Code Organization

- Put route-level code in `src/app`.
- Put auth and membership code in `src/features/auth`.
- Put Brand tenant code in `src/features/brands`.
- Put AI generation code in `src/features/content-generation`.
- Put shared configuration, clients, and environment helpers in `src/lib`.

## Verification

Run these before handing off meaningful changes:

```bash
npm run typecheck
npm run lint
npm run build
```
