# Chambers

Design workspace **and product home** for **Mangu Platforms** — tokens, zero-JS HTML drops, and
**Chambers Studio**, the calm resume platform.

> Apple calm × Instagram pulse. One thin vermilion hairline through everything.

## Open now

| Artifact | Open |
|---|---|
| **Chambers Studio (the product)** | [`apps/studio`](apps/studio) — `cd apps/studio && pnpm install && pnpm dev` |
| Token source | [`tokens/tokens.json`](tokens/tokens.json) |
| CSS variables | [`tokens/tokens.css`](tokens/tokens.css) |
| Tailwind preset | [`tokens/tailwind.preset.cjs`](tokens/tailwind.preset.cjs) |
| Tokens gallery (every swatch) | [`design/drops/tokens-gallery/index.html`](design/drops/tokens-gallery/index.html) |
| Drop template | [`design/drops/_template/index.html`](design/drops/_template/index.html) |
| Resume sheet (Enhancv-class paper) | [`design/drops/resume-sheet/index.html`](design/drops/resume-sheet/index.html) |
| Original five-screen deck | [`design/migration-mockups/chambers-migration-mockups.html`](design/migration-mockups/chambers-migration-mockups.html) |

Drops: no build, no JavaScript, system fonts only — open the HTML file, print it, done.
Studio: Next.js 15 + Supabase (or zero-secret demo mode), consuming these tokens directly.

## Tokens (quick)

| Token | Value |
|---|---|
| Vermilion 500 | `#FF4D00` |
| Ember 600 | `#D93F00` (AA on white) |
| Ink / Night | `#1D1D1F` / `#0B0B0F` |
| Fog / Cream | `#F5F5F7` / `#FFFAF6` |
| Hairline | `1px rgba(255,77,0,.32)` |
| Selected | `1.5px` vermilion — the only thicker line |
| Story | `#FFC24B → #FF5A1F → #E9308F → #8A3FFC` |

## Docs

- [Inventory](docs/INVENTORY.md)
- [PRD](docs/PRD.md)
- [Tokens reference](docs/TOKENS.md)
- [Competitors](docs/COMPETITORS.md) — design tools + resume platforms
- [Consume in apps](docs/CONSUME.md)
- [Prosperity](docs/PROSPERITY.md)
- [Open questions for the owner](docs/QUESTIONS.md)
- [ADRs](docs/adr/)

The resume product lives here as [`apps/studio`](apps/studio) — see
[ADR-001](docs/adr/ADR-001-product-home.md).
