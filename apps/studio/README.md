# Chambers Studio

The calm resume studio. Next.js 15 App Router + TypeScript + Tailwind, speaking the Chambers
design language from `../../tokens`.

## Run it

```bash
cd apps/studio
pnpm install
pnpm dev          # http://localhost:3000
```

With no environment variables the app runs in **demo mode**: no accounts, documents persist in
the browser's localStorage, and everything else — editor, live preview, PDF/TXT/DOCX export —
works. This is what CI and preview deployments run.

## Supabase mode (production)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`). It creates
   `profiles`, `documents`, `document_versions`, `audit_events`, indexes, triggers
   (auto-profile on signup, `updated_at`, version snapshots) and strict RLS.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Restart. Auth (email/password), per-user documents, share links, and the audit trail switch on.

## Commands

| Command | What |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config, next presets) |
| `pnpm test` | Vitest unit tests (schema, sanitizers, exports, slugs) |
| `pnpm build` | Production build — must pass with no env |

## Map

```
app/                 Routes: / (static marketing), /login, /app, /app/[id], /app/[id]/export,
                     /s/[slug] (public share), /api/health
components/sheet/    ResumeSheet + sheet.css — THE sheet, same contract as design/drops/resume-sheet
components/editor/   Edit column
components/ui/       Button, Field — the only primitives
lib/resume/          zod schema, sanitizers, sample (fictional), slugs
lib/store/           DocumentStore interface + localStorage & Supabase implementations
lib/export/          Plain-text and DOCX builders (unit-tested), download helpers
lib/supabase/        Browser/server clients; middleware handles session refresh + /app gating
supabase/migrations/ Schema + RLS
tests/               Vitest suites
```

## Design rules (enforced by review)

- Every visual value comes from the tokens (Tailwind preset or `--ch-*` vars). No ad-hoc hex, no
  off-scale font sizes.
- The preview must match the printed PDF. If you change `sheet.css`, print a page and compare
  against `design/drops/resume-sheet`.
- 44px minimum hit targets; focus rings use the strong hairline; one primary (vermilion) action
  per view.
- Sample data stays clearly fictional. Never commit real personal data.
