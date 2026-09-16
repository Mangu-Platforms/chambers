# Chambers studio

The running product in this repo.

## Flow

1. **Start** — paste a resume, upload `.txt`, or load Avery / Maya.
2. **Studio** — edit identity, roles, bullets; pick a sheet; print / PDF.
3. **Tailor** — paste a posting. Local tailor applies immediately. Compare Tailored / Original.
4. **Letter** — generate from the same facts. Print beside the sheet.
5. **Tools** — ATS score, bullet rewrite, summary, keyword extract.

## Templates

| Id | Look | ATS |
|---|---|---|
| `letter` | House default, vermilion labels | high |
| `compact` | Dense single column | high |
| `executive` | Night header | medium |
| `editorial` | Serif name on cream | high |
| `sidebar` | Cream rail | medium |
| `classic` | Centered, double rule | high |

## Persistence

Zustand + `localStorage` key `chambers-studio`. Debounced 400ms on typing. Structural writes (template, tailor, reset, letter) flush immediately.

## AI

`src/lib/ai/resume-ai.ts` is a stub that returns “not available.” Every caller already falls back to:

- `parseResumeText`
- `tailorLocal`
- `writeLetterLocal`
- `writeSummaryLocal`
- `localVariants`

To wire grok-4.5, put a **server** proxy in front of `https://api.x.ai/v1/chat/completions`. Do not ship an `XAI_API_KEY` in a `VITE_` variable.
