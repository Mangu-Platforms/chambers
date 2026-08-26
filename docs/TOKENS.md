# Chambers tokens

Source of truth: [`tokens/tokens.json`](../tokens/tokens.json) (DTCG-style).
Compiled targets: [`tokens/tokens.css`](../tokens/tokens.css) (CSS custom properties, prefix `--ch-`)
and [`tokens/tailwind.preset.cjs`](../tokens/tailwind.preset.cjs) (Tailwind preset).
Visual reference: [`design/drops/tokens-gallery`](../design/drops/tokens-gallery/index.html) — every
token, zero JS.

## Color

| Token | Value | Use |
|---|---|---|
| `vermilion.500` | `#FF4D00` | The accent. Hairlines, selection, kickers on dark. Never body text on white. |
| `vermilion.600` (Ember) | `#C63A00` | Orange **text** on white — AA contrast. Kickers, section labels. |
| `ink` | `#1D1D1F` | Body text on light. |
| `night` | `#0B0B0F` | Dark surfaces (marketing footer, hero). |
| `fog` | `#F5F5F7` | App background, quiet sections. |
| `cream` | `#FFFAF6` | Warm alternate background. |
| `paper` | `#FFFFFF` | The sheet. Cards. |
| `muted` | `#6E6E73` | Secondary text. |
| `line` | `rgba(255,77,0,.32)` | THE hairline. 1px, everywhere. |
| `line.strong` | `rgba(255,77,0,.72)` | Focus rings only. |
| `story` | `#FFC24B → #FF5A1F → #E9308F → #8A3FFC` | 135° gradient. Rare. Pulse moments only. |

## Rules that make it Chambers

1. **One hairline.** Every border is `1px rgba(255,77,0,.32)`. The only thicker line in the
   system is the selected state: `1.5px` solid Ember (the 3:1 non-text contrast line).
2. **Ember for orange text.** `#FF4D00` fails AA on white; `#C63A00` passes. Text is Ember,
   surfaces and lines are Vermilion.
3. **Zero webfonts.** SF Pro / system stack (`-apple-system, BlinkMacSystemFont, Segoe UI…`).
   Weights 400 / 510 / 590 / 700.
4. **Locked type scale.** 11 / 12 / 15 / 17 / 22 / 34 / 56. Nothing between. Display tracking
   `-0.035em`, body `-0.011em`, body leading `1.47`.
5. **44px hit targets.** Buttons and fields are 44px tall. Chips 28px. CTAs are pills.
6. **Soft shadow only.** `0 8px 24px rgba(29,29,31,.06)` — or flat with a hairline. Nothing else.
7. **Calm motion.** 240ms, `cubic-bezier(.25,.1,.25,1)`; collapses to 1ms under
   `prefers-reduced-motion`.
8. **Letter is 816px.** `--ch-page-resume: 816px` = US letter width at 96dpi. The sheet component
   and the print CSS agree on this number.

## Consuming

- **Static drop:** `<link rel="stylesheet" href="../../../tokens/tokens.css" />` — done.
- **Next.js / Tailwind app:** `presets: [require('../../tokens/tailwind.preset.cjs')]` in the
  Tailwind config, plus import `tokens.css` once in the root layout. `apps/studio` does both.
- Full instructions: [`docs/CONSUME.md`](CONSUME.md).

Do not fork values into app code. If a value needs to change, change `tokens.json`, recompile the
CSS by hand (it is 70 lines), and update the gallery drop.
