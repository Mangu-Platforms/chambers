# Chambers

Letter-width resume and cover letter studio for [Mangu Platforms](https://github.com/Mangu-Platforms).

Paste what you have. Put it on paper. Tailor it to one posting. Never invent a fact.

> Apple calm × one vermilion hairline. Free on the device. No account. No watermark.

## Product

| Surface | What it does |
|---|---|
| Start | Paste, `.txt`, or a finished sample |
| Studio | Live letter-width sheet + editor + ATS check |
| Tailor | Instant local reorder. Notes. Compare original |
| Letter | Same voice, dated letterhead, print |
| Paper | Six templates: Letter, Compact, Executive, Editorial, Sidebar, Classic |
| Tools | ATS score, bullet variants, summary, keywords |

Everything persists in `localStorage` (`chambers-studio`). Local tailor / parse / letter / ATS work with no API key.

## Run

```bash
npm install
npm run dev
```

Then open the printed URL. `npm run build` for production.

## House language

Design tokens still live in [`tokens/`](tokens/tokens.json) and the original HTML drops in [`design/`](design/drops/). The studio consumes the same palette: vermilion `#FF4D00`, ember `#D93F00`, ink, fog, cream, 816px letter width.

## Honesty rule

The tailor may reorder and rephrase. It must not invent employers, dates, degrees, tools, or metrics. Missing posting phrases stay listed.

## Docs

- [Studio](docs/STUDIO.md)
- [PRD](docs/PRD.md)
- [Inventory](docs/INVENTORY.md)
- [Competitors](docs/COMPETITORS.md)
- [Consume tokens](docs/CONSUME.md)
