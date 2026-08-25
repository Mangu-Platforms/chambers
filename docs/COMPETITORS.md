# Chambers competitor matrix

Chambers does not compete as a canvas. Score each row on time-to-first-meaningful-paint for a design artifact.

| Tool | What it is | Typical first view | Copy? |
|---|---|---|---|
| **Chambers HTML drop** | Static HTML + CSS, system fonts | ~50–150ms FMP local (template ~4KB + tokens.css ~2KB) | — |
| Figma | Multiplayer vector | App shell seconds | No — cannot beat multiplayer vector |
| FigJam | Whiteboard | Heavy web app | No |
| Penpot | Open canvas, native tokens | Large files 400–800ms page ops vs Figma <200ms on dense files | Tokens/export ideas only |
| Framer / Webflow | Site builders | Marketing JS | No |
| Notion | Docs | Heavy client | No — messy brand kits live here |
| Zeroheight | DS docs SaaS | Doc site | No — we need files in git |
| Storybook | Component workshop | Cold start often 1–8s; Ladle ~1.2s | No for brand drops |
| Supernova / Specify / UXPin | Platforms | SaaS / infra | Specify maybe later |
| Adobe XD / Canva | Design / layout | Installed or heavy web | No |
| Linear / Arc / Zen | Taste bars | n/a | Feel only |
| Apple HIG | Reference | Instant | Yes — SF, 44px, fog |
| Playbook / Lona / Diez | Token lineage | Build step | Ideas |
| Style Dictionary | Token compiler | CLI | Optional when iOS/Android appear |
| Tokens Studio | Figma plugin | Inside Figma | Only if we design in Figma |

## Token tooling (2026)

Industry line: Tokens Studio (define) → DTCG JSON → Style Dictionary (build). Chambers starts at JSON + CSS. No Figma tax.

## Paint budget

HTML < 20KB. tokens.css < 4KB. Zero webfonts. Zero JS. That beats Notion kits and Storybook docs on Lane A.
