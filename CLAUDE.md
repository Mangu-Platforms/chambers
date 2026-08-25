# Chambers — execution charter

Chambers is the Mangu Platforms design workspace (tokens + zero-JS HTML drops) **and** the home of
**Chambers Studio**, the resume product, under `apps/studio`.

## Mission

Ship an enterprise-grade resume platform: Chambers tokens + live product UI + export pipeline + ops.
Quality bar: calmer than Apple, faster than Enhancv, ATS-first export. See `docs/PRD.md`.

## Immutable constraints

- One vermilion hairline. Tokens only — no ad-hoc colors, no random `text-sm`.
- Zero webfonts. System font stack. Drops stay 0 JS, < 20 KB HTML, print-ready.
- The live preview and the `design/drops/resume-sheet` drop must render the same sheet.
- Never invent biography. Sample document is "Avery Lang" (clearly fake).
- No PII in logs. Sanitize all user input before storage and rendering.
- Product code lives in `apps/studio` (ADR-001). `chambers-ai` repo is not written to.

## Repository map

- `tokens/` — tokens.json (source of truth), tokens.css, tailwind.preset.cjs
- `design/drops/` — zero-JS HTML drops (`_template`, `resume-sheet`, `tokens-gallery`)
- `design/migration-mockups/` — original five-screen deck + exports
- `apps/studio/` — Next.js 15 App Router product (Chambers Studio)
- `docs/` — PRD, INVENTORY, TOKENS, COMPETITORS, CONSUME, PROSPERITY, QUESTIONS, adr/
- `.plan/` — execution state for long autonomous runs

## Commands (apps/studio)

```bash
pnpm install          # from apps/studio
pnpm dev              # local dev
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm test             # vitest unit tests
pnpm build            # next build (works without Supabase env — demo mode)
```

## Authorization boundaries

- Commit and push allowed on branch `claude/chambers-studio-resume-hyrh46` only.
- Draft PR to `main` is expected. No merges without human sign-off.
- No production deploys, no external migrations against live Supabase without explicit owner ask.

## Completion gates

1. Drops render without JS; tokens complete on disk.
2. `/app/[id]` shows a live Chambers sheet from editable data; auth works (or demo mode when env absent).
3. Export: print PDF path + plain-text + DOCX.
4. CI (typecheck, lint, build, test) green on the PR.
5. Docs current: README, TOKENS, COMPETITORS, PROSPERITY, ADRs, QUESTIONS.
