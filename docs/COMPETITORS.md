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

---

# Resume-platform tear-down (Chambers Studio)

Scored 2026-08. Pricing is the advertised monthly tier at time of writing; verify before quoting.

| Platform | Pricing | Strengths | Weaknesses | Chambers answer |
|---|---|---|---|---|
| Enhancv | ~$25/mo (Pro) | Polished templates, content suggestions | Cluttered editor, slow preview, upsell pressure everywhere | Instant same-sheet preview, zero upsell chrome |
| Teal | Free + ~$29/mo | Job tracker + resume in one | Resume quality secondary to tracking CRM | One purpose: the sheet itself |
| Rezi | ~$29/mo or lifetime | ATS scoring, AI-first | Dated UI, AI writes generic prose | Apple-grade type; AI only rewrites on request, never auto |
| Novoresume | ~$20/mo | Guided content | Feature maze, slow export | Edit → Preview → Export, three clicks |
| Canva | Free + $13/mo | Beautiful freeform design | Not ATS-safe: text boxes, columns, graphics choke parsers | ATS text/DOCX are first-class exports |
| FlowCV | Free + ~$8/mo | Generous free tier | Bloated option panels | Locked type scale — nothing to fiddle, nothing to break |
| Standard Resume | ~$8/mo | Minimal, tasteful | Two templates, thin export options | Same calm + three templates + DOCX/TXT/PDF |
| Reactive Resume | Free OSS | Self-hostable, capable | No design system; utilitarian output | A real design language and print parity |
| Google Docs | Free | Universal, familiar | Manual layout, fragile spacing, no ATS path | Structured data → every format stays consistent |

**The one real advantage:** the preview *is* the export. One sheet component renders the editor
preview, the public share page, and the print CSS that becomes the PDF — pixel-for-pixel, powered
by the same tokens as the zero-JS drop. No competitor renders screen and paper from one source.
