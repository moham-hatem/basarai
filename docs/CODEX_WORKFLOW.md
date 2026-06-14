# Codex Workflow

## Working Principles

- Read existing files before editing.
- Keep feature code grouped by domain under `src/features`.
- Keep shared clients and environment helpers in `src/lib`.
- Prefer server actions or route handlers for operations that touch Supabase service role, Vault, or AI providers.
- Keep client components free of provider secrets and service role credentials.

## Local Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Definition of Done

- TypeScript passes.
- Lint passes.
- App runs locally.
- New tenant-owned data access is RLS-compatible.
- New AI features execute server-side only.
- Documentation is updated when architecture or workflow changes.

## Branching

Use focused branches for each feature. Keep unrelated formatting and refactors out of feature changes unless they are required for the task.
