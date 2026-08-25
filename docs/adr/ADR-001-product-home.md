# ADR-001: Chambers Studio lives in `chambers/apps/studio`

Date: 2026-08-25 · Status: Accepted

## Context

The PRD names two canonical repos: `Mangu-Platforms/chambers` (design system) and
`Mangu-Platforms/chambers-ai` (resume product surface), with the instruction: if `chambers-ai`
is empty, either create product code under `chambers/apps/studio` or initialize `chambers-ai`.

Inspection of `chambers-ai` (2026-08-25): three files — a README describing an aspirational
feature set, a `package.json` with no lockfile, and a single gradient landing `page.tsx` that does
not use Chambers tokens. No app scaffold, no CI, no schema. Effectively empty.

This build session is additionally mandated to develop and push only on
`chambers#claude/chambers-studio-resume-hyrh46`.

## Decision

Build the product as **`apps/studio` inside `chambers`**, a monorepo-lite layout:

- `tokens/` stays the single source of truth; the app consumes `tailwind.preset.cjs` and
  `tokens.css` by relative path — no publishing step, no version skew between design language
  and product.
- The live preview imports the same visual contract as `design/drops/resume-sheet`, which is only
  enforceable when both live in one repo and one PR can change both.
- One CI pipeline covers tokens, drops, and app.

`chambers-ai` remains untouched. If the owner later wants the product in its own repo, the
`apps/studio` directory extracts cleanly (it has its own `package.json`, lockfile, and CI job).

## Consequences

- Pro: atomic design-system + product changes; zero token-sync infrastructure; single review surface.
- Pro: honors the session's branch mandate without splitting work across repos.
- Con: repo is no longer "not an application" (README updated accordingly).
- Con: future extraction to `chambers-ai` requires a one-time history-less copy (acceptable).
