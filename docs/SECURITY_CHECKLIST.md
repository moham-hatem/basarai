# Security Checklist

## Secrets

- Never expose AI provider keys to the browser.
- Never use the Supabase service role key in client code.
- Store production BYOK credentials in Supabase Vault.
- Keep `.env.local` out of Git.
- Only `NEXT_PUBLIC_*` values may be read by browser code.

## Supabase

- Enable RLS on every tenant-owned table.
- Scope all tenant records by `brand_id`.
- Use membership checks in every RLS policy.
- Restrict credential management to owners and admins.
- Use signed URLs or policy-protected paths for Storage assets.

## AI

- Run OpenAI and Gemini calls server-side only.
- Log request metadata without logging provider keys or full secret payloads.
- Validate prompt input and selected Brand membership before generation.
- Store generation output under the requesting Brand.

## Application

- Use strict TypeScript.
- Keep feature boundaries clear.
- Treat route handlers and server actions as the trust boundary.
- Review generated content before any future publishing integration.
