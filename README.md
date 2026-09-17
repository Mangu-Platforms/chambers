# Chambers

Letter-width resume and cover letter studio. Paste what you have. Put it on paper. Tailor it to one posting. Never invent a fact.

Apple calm × one vermilion hairline. Free on the device. No account. No watermark.

Live: [chambers-app.vercel.app](https://chambers-app.vercel.app)

Repo: [github.com/Mangu-Productivity-tools/chambers](https://github.com/Mangu-Productivity-tools/chambers)

## Product

| Surface | What it does |
|---|---|
| Start | Paste, `.txt`, `.json` (Chambers pack or JSON Resume), blank sheet, or a sample |
| Studio | Live 816px sheet + editor + ATS check + keyword highlight |
| Tailor | Instant local reorder. Notes. Compare original. Save a version |
| Letter | Same voice, Measured / Short / Human tones, print |
| Paper | Letter, Compact, Executive, Editorial, Sidebar, Classic |
| Versions | Up to 20 named snapshots on this device |
| Export | Print / PDF, Word `.docx`, Markdown, JSON Resume, Chambers pack |
| Tools | ATS score, bullet variants, summary, keyword fit |

Everything persists in `localStorage` (`chambers-studio`). Local parse / tailor / letter / ATS work with no API key.

## Honesty rule

The tailor may reorder and rephrase. It must not invent employers, dates, degrees, tools, or metrics. Missing posting phrases stay listed. Keyword fit will only add a phrase to skills if it is already evidenced on the sheet.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Tests

```bash
npm run test:resume
npm run typecheck
```

## Deploy

Vercel production: https://chambers-app.vercel.app

Linked to this repo (`Mangu-Productivity-tools/chambers`, branch `main`). `npm run build` emits the Nitro Vercel output. Optional `XAI_API_KEY` in the project environment for assistant refine (user-initiated only). Leave auth off.

## Docs

- [FEATURES.md](FEATURES.md) — checklist
- [PROGRESS.md](PROGRESS.md) — session log
- [RESUME.md](RESUME.md) — product recap
