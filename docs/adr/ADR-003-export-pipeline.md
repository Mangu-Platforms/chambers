# ADR-003: Export pipeline — print CSS for PDF, client-built TXT/DOCX

Date: 2026-08-25 · Status: Accepted

## Context

The PRD's kill criterion: "If PDF export is broken, we fail." Server-side PDF renderers (headless
Chromium on a function, LaTeX, pdfkit) add cold starts, drift risk between preview and output, and
infrastructure cost. ATS formats (TXT, DOCX) must be first-class, not afterthoughts.

## Decision

1. **PDF = the browser's print path.** `@media print` strips app chrome and prints the very same
   `ResumeSheet` DOM the user is previewing, sized to `--ch-page-resume` (816px = US letter). The
   preview cannot drift from the PDF because they are one render. Verified in CI-adjacent tooling
   via Playwright's `page.pdf()` producing a clean, text-layered letter page.
2. **TXT and DOCX are built client-side from `ResumeData`** (`lib/export/text.ts`,
   `lib/export/docx.ts`) — deterministic, unit-tested, ATS-shaped (single column, real headings,
   standard bullets, no tables/text boxes). The `docx` library is dynamically imported so it never
   weighs on the editor bundle.
3. Every export records a `document.export` audit event (Supabase mode) with format only — never
   content.

## Consequences

- Pro: zero export infrastructure; parity by construction; works in demo mode and offline.
- Con: PDF metadata/filename depends on the browser dialog. Acceptable for MVP; a server PDF can
  be added later behind the same export page without changing the sheet.
- Con: exact pixel output varies slightly by browser print engine; the letter width and margins are
  fixed via `@page`, which keeps the layout stable where it matters.
