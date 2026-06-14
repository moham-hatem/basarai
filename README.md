# Basarai

Basarai is a brand-based multi-tenant SaaS social media generator. The MVP uses Next.js 16 App Router, strict TypeScript, Tailwind CSS, Supabase Auth/Postgres/RLS/Vault/Storage, and server-side BYOK AI generation for OpenAI and Gemini.

## MVP Boundaries

- Brand is the tenant boundary.
- Arabic and English are first-class content workflows.
- AI provider credentials are never exposed to the browser.
- Supabase service role credentials are never used in client code.
- All AI generation happens server-side.
- Stripe billing is not included in the MVP.
- Direct social publishing is not included in the MVP.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run build
```

## Project Structure

- `src/app`: App Router routes and layouts.
- `src/features/auth`: Auth and membership domain code.
- `src/features/brands`: Brand tenant domain code.
- `src/features/content-generation`: AI generation domain code.
- `src/lib`: Shared configuration and low-level helpers.
- `docs`: Product, architecture, database, workflow, and security documentation.

## Environment

Copy `.env.example` to `.env.local` and fill in the values needed for local development. Keep service role, Vault, OpenAI, and Gemini values server-only.

## Documentation

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Codex Workflow](docs/CODEX_WORKFLOW.md)
- [Security Checklist](docs/SECURITY_CHECKLIST.md)
