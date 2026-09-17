# Progress

Session continued 2026-09-16 ~18:15–now EDT. Autonomous 9-hour loop, first checkpoint.

## Completed this slice

- Letter tones (Measured / Short / Human) wired into generate + Tailor.
- Blank sheet start; JSON pack + JSON Resume ingest on Start and Export.
- Keyword fit: promote evidenced phrases only; generic unigrams filtered.
- ATS checks: dates, education, posting phrases; copy notes as text.
- Skill chips, bullet hints, education/extras reorder, Tidy empty lines.
- Versions: named save, duplicate, diff vs current, save-after-tailor.
- Export: Markdown, JSON Resume, Word, ready-to-send checklist.
- Empty paper fills a letter page (min-height 1056).
- LinkedIn-ish parse; certifications extras; URL strip; email hint.
- Production build + 8081 smoke matches dev baseline (then stopped).
- 37 resume unit tests passing. Typecheck clean. Dev still on preview.

## Tests / commands

- `npm run test:resume` — 37 pass
- `npx tsc --noEmit` — clean
- `npm run build` — client + SSR + nitro OK
- Browser smoke landing desktop+mobile: 200, no console errors
- Production smoke: `divergesFromBaseline: false`
- agent-browser: blank start, letter tones, versions, export, 404, tailor keyword fit, promote “hiring loops” onto Studio skills, Avery restored

## Browser

- Landing: vermilion on paper, six thumbs, no overflow
- Studio: live letter sheet, Regular/Tight, Tidy
- Tailor: posting + match ring + keyword chips
- Letter: Measured / Short / Human
- 404: “That page isn’t on this paper.”

## Blockers / risks

- PDF binary import skipped (no parser).
- Drag-and-drop reorder skipped (keyboard covers it).
- This sandbox has no `.git` — cannot commit here.
- Auth/DB stay OFF.

## Next 3

1. Deeper a11y (focus order on editor cards, live regions).
2. Optional one-page trim suggestions (honest: drop extras, not invent).
3. If a git remote is mounted, commit this slice.

## Decisions

- Honesty: `promoteSkill` no-ops unless the term is already in resume text.
- Paper stage always measures at least one US Letter so empty sheets are paper, not a hairline.
- Production preview on 8081 was smoked then stopped; leave 8080 up.
