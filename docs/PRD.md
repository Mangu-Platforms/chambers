# Chambers PRD — system, not Figma

**Date:** 2026-08-25
**Lane:** A — design system + instant HTML drops

## One sentence

Chambers is the house visual language as files: tokens every app can import, and HTML drops that paint in under 200ms.

## What success looks like

1. Open `design/drops/resume-sheet/index.html` and know it is Mangu in three seconds (hairline + SF stack + cream/fog).
2. `my_publishing`, `lettersPCity`, `madcaptees`, `cv-fall2026`, and `chambers-ai` import `tokens/tokens.css` or the Tailwind preset — no forked hex codes.
3. First meaningful paint of a drop estimated **< 200ms** on a cheap laptop (HTML + CSS only, system fonts, no client JS).

## Non-goals

- Multiplayer vector canvas (Figma / Penpot).
- Storybook as the brand kit.
- Selling a design-tool subscription.
- Shipping the resume SaaS here (`chambers-ai`).

## MVP (this pass)

Extracted tokens, CSS + JSON + Tailwind preset, drop template, resume sheet, competitor + prosperity docs.

## Next 14 days

1. Wire tokens into one live app (`madcaptees` or `lettersPCity`).
2. Tokens gallery drop still with zero JS.
3. Optional GitHub Pages from `/design/drops`.

## Rendering bar

Resume and letter surfaces: letter width 816px, tight display tracking, vermilion section labels, print stylesheet. That is how Chambers beats generic Tailwind dashboards without becoming a canvas app.
