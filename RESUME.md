# Resume here

Dev server should stay on `:8080` via `startup.sh`. Production smoke already passed this session.

## Just finished

Tones, blank/JSON start, keyword optimizer, ATS extras + copy notes, editor chips/hints/reorder/tidy, versions duplicate+diff, markdown + JSON Resume export, paper min-height, 37 tests, production build smoke.

## Do next

1. `npm run test:resume` then `npx tsc --noEmit` after type changes.
2. Deeper a11y pass if still open in FEATURES.md.
3. Do not add PDF parser, auth, or a job tracker.
4. If git exists outside this sandbox, commit from FEATURES.md’s completed slice.

## Source of truth

- FEATURES.md
- PROGRESS.md
- Store persist key `chambers-studio`
- Tests: `src/lib/resume/resume.test.ts`

## Do not

- Kill the `:8080` dev server.
- Invent facts in tailor / letter / keyword promote.
