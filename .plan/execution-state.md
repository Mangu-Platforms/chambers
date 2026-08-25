# Execution state — Chambers Studio build

Deadline: 2026-08-26 13:00 (owner's local; treat as ~hard stop).
Branch: `claude/chambers-studio-resume-hyrh46` → PR to `main` (draft).

## Mission

Full PRD execution: finish Phase 1 (tokens-gallery drop, TOKENS.md), build Phase 2 product
(`apps/studio`: auth, dashboard, editor + live preview, export), Phase 3 quality, Phase 4 CI/ops,
Phase 5 docs. See `CLAUDE.md` for gates.

## Decisions

- DEC-001: Product code in `chambers/apps/studio`. `chambers-ai` is a 3-file stub and this session
  can only push to `chambers`. → ADR-001.
- DEC-002: Demo mode — when Supabase env vars are absent, the app runs fully client-side against
  localStorage so CI builds, previews and local dev work without credentials. Supabase is the
  production path (migrations + RLS shipped in `supabase/`).
- DEC-003: pnpm as package manager (fast, on disk already).

## Task queue (harness task IDs)

1. ✅→ #1 tokens-gallery drop + docs/TOKENS.md
2. #2 ADR-001 + INVENTORY refresh
3. #3 scaffold apps/studio
4. #4 domain model + sanitize + sample
5. #5 sheet component + 3 templates
6. #6 supabase layer + migrations + RLS
7. #7 routes (marketing, login, app, editor, export, share)
8. #8 export pipeline (print/txt/docx)
9. #9 tests
10. #10 CI + health + error boundaries + logging
11. #11 docs
12. #12 push/PR/checkpoint loop until deadline

## Checkpoint ledger

- C-000 (start): repo inventoried. Tokens + 2 drops + docs exist from prior commits. chambers-ai
  cloned read-only at /home/user/mangu-platforms/chambers-ai (stub). Node 22, pnpm 10, npm registry OK.

## Next action

Task #1: write design/drops/tokens-gallery/index.html + docs/TOKENS.md, commit.

- C-001: Studio scaffold complete. typecheck+lint+build green; 25/25 vitest pass. CI workflow
  (studio-ci.yml: app checks + drops budget), docs (QUESTIONS, READMEs, competitor matrix,
  monetization) done. Next: push, draft PR, then runtime smoke test via dev server.
