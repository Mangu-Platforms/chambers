# Chambers inventory — 2026-08-25 (rev 2: studio build session)

## What was already on disk

| Path | Role |
|---|---|
| `README.md` | Workspace intro |
| `design/migration-mockups/README.md` | Drop notes + token table |
| `design/migration-mockups/chambers-migration-mockups.html` | Five-screen self-contained deck |
| `design/migration-mockups/exports/*.png` | Static captures |
| `.github/workflows/main.yml` | Existing CI |

Source: `Migration_Planning.docx` resume-builder screens rebuilt as Chambers / Voice City (Apple calm × Instagram pulse, vermilion hairline).

## Added this pass

| Path | Role |
|---|---|
| `tokens/tokens.json` | DTCG-ish source of truth |
| `tokens/tokens.css` | CSS custom properties |
| `tokens/tailwind.preset.cjs` | Preset for Next/Vite apps |
| `design/drops/_template/` | Empty drop starter, no JS |
| `design/drops/resume-sheet/` | Enhancv-class letter sheet, no JS |
| `docs/PRD.md` | Chambers-as-system |
| `docs/COMPETITORS.md` | Matrix + paint times |
| `docs/PROSPERITY.md` | Cash honesty |
| `docs/CONSUME.md` | How apps import tokens |

## Added this session (studio build)

| Path | Role |
|---|---|
| `design/drops/tokens-gallery/` | Every token on one page, no JS |
| `docs/TOKENS.md` | Token reference + usage rules |
| `docs/adr/ADR-001-product-home.md` | Product lives in `apps/studio` |
| `apps/studio/` | Chambers Studio — Next.js 15 resume product |
| `CLAUDE.md` / `.plan/` | Execution charter + state for long runs |

## Findings

- `chambers-ai` inspected 2026-08-25: three-file stub (README, bare package.json, one landing
  page without Chambers tokens). Product built here instead — see ADR-001.
- `.github/workflows/main.yml` is a scheduled aider "swarm" workflow requiring an
  `OPENAI_API_KEY` secret; unrelated to this build. Left in place — flagged in `docs/QUESTIONS.md`.

## Not this repo

- Figma multiplayer canvas. Out of lane.
- `cv-fall2026` — owner's real CV facts. Loaded into the product only when the owner provides it;
  sample data stays clearly fake ("Avery Lang").
