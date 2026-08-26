# Compiled questions for the owner

Collected during the 2026-08-25/26 build session. None of these blocked the build — decisions
were taken and documented (see `docs/adr/` and `.plan/execution-state.md`); flag anything you want
changed.

## Needs your action to go live

1. **Supabase project.** The full schema + RLS is in `apps/studio/supabase/migrations/0001_init.sql`.
   Create (or point me at) a Supabase project and set the four env vars from
   `apps/studio/.env.example`, and auth/persistence switch on automatically. Until then every
   deployment runs in demo mode (browser-local documents) — intentional, so previews work with
   zero secrets. Want me to provision the project via the Supabase integration next session?
2. **Vercel.** No Vercel project exists for this repo in the session's scope. Import the repo in
   Vercel with root directory `apps/studio` (build: `pnpm build`) — or tell me to create it via the
   Vercel integration, and whether staging should be a separate branch (`staging`) or just Vercel
   previews on PRs.
3. **`chambers-ai` repo.** Product code went into `chambers/apps/studio` (ADR-001) because
   `chambers-ai` is a 3-file stub and this session could only push to `chambers`. Keep it that way,
   or should the app be extracted to `chambers-ai` later?

## Decisions you may want to review

4. **Existing workflow `.github/workflows/main.yml`** is a scheduled "aider swarm" that expects an
   `OPENAI_API_KEY` secret and force-opens PRs nightly. It is unrelated to Chambers Studio and will
   fail silently without that secret. Delete it? (Left untouched.)
5. **Error tracking.** PRD says "Sentry or similar". I shipped structured, PII-redacted logging and
   error boundaries, but no third-party Sentry DSN since that needs an account decision. Want
   Sentry, or Vercel's built-in error reporting?
6. **AI assist** (bullet rewrite, user-initiated) is speced as optional in the PRD. It needs an LLM
   API key server-side and a rate-limit store. Include it, and with which provider/budget?
7. **Watermark on free exports** (PROSPERITY.md) is documented but not enforced in code — there are
   no plans/entitlements yet. OK to defer until real pricing exists?
8. **Real CV data.** Per the mandate, the sample stays fictional ("Avery Lang"). When you want your
   real fall CV loaded, share `cv-fall2026` contents (or paste), and it becomes a document — never
   invented.

## Small confirmations

9. Marketing copy tone ("One page. Perfectly set.") — keep or rewrite?
10. Should public share pages (`/s/[slug]`) be indexable? Currently `noindex` for privacy.

11. **Ember deepened for AA.** Automated accessibility testing (axe) showed the PRD's Ember
    `#D93F00` is only 4.15:1 on white — it fails WCAG AA (4.5:1) at the 11–12px sizes we use for
    kickers and section labels, and white button text on it fails too. Ember is now `#C63A00`
    (5.2:1, passes at every size, white-on-Ember passes) across tokens, drops, app and DOCX
    export. Visually ~5% deeper. Veto if you want the brighter value back at the cost of AA.
