# ADR-002: Demo mode — the app must run with zero secrets

Date: 2026-08-25 · Status: Accepted

## Context

CI, Vercel preview deployments, and a fresh `git clone` have no Supabase credentials. An app that
white-screens without env vars cannot honor "deploy previews on every PR" or be evaluated by a
reviewer in one command.

## Decision

All persistence goes through one interface, `DocumentStore` (`lib/store/types.ts`), with two
implementations selected at runtime by env presence:

- `SupabaseDocumentStore` — auth, Postgres with RLS, version snapshots, audit trail.
- `LocalDocumentStore` — localStorage, no accounts, no network.

UI code never imports a concrete store. `/login` explains demo mode instead of erroring; `/s/[slug]`
404s (sharing genuinely requires a server); `/api/health` reports which mode is active.

## Consequences

- Pro: `pnpm build && pnpm e2e` passes with no secrets — CI runs the real product, not mocks.
- Pro: "try before signup" falls out for free (marketing links straight into the studio).
- Con: two code paths to keep honest — mitigated by the shared interface and the same zod
  validation on both sides.
- Con: demo documents are per-browser; the UI labels this explicitly (Demo badge, login copy).
