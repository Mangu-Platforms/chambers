# Chambers — feature checklist

Master list. `[ ]` not started · `[~]` in progress · `[x]` done + tested + browser-verified.

## Core product

- [x] Landing — paper preview, six thumbs, import / studio CTAs
- [x] Start — paste, `.txt` / `.json` upload, clipboard, blank, Avery / Maya samples
- [x] Studio — live 816px sheet, editor, ATS check, print
- [x] Tailor — paste posting, local reorder, notes, original / tailored
- [x] Letter — local draft, same paper, print, tones
- [x] Paper library — six templates, filter, select + use
- [x] Tools — ATS, bullet variants, summary, keyword fit
- [x] Persistence — `localStorage` `chambers-studio`, 400ms debounce
- [x] Honesty rule — tailor never invents employers, dates, degrees, metrics
- [x] Private by default — no account, no database

## Import

- [x] Paste messy resume text
- [x] Upload `.txt` / `.md` / `.json`
- [x] Clipboard paste
- [x] Sample resumes (editorial + engineer)
- [x] JSON Chambers pack (`.json`) import
- [x] JSON Resume schema import
- [x] Blank sheet start
- [x] LinkedIn-ish paste (Company · Full-time, dated roles)
- [x] Certifications / languages as extras
- [ ] PDF text extract (blocked without a PDF parser; paste still works)

## Editor

- [x] Identity, summary, skills
- [x] Experience add / remove / duplicate / reorder
- [x] Bullet add / remove / reorder
- [x] Bullet quality hints (verb, metric, length)
- [x] Education add / remove / reorder
- [x] Extra sections add / remove / reorder
- [x] Skill chips with add / remove
- [x] Tidy empty lines (no invention)
- [x] Word count on summary
- [x] Density: regular / tight
- [x] Email format hint
- [x] Website / LinkedIn protocol strip
- [ ] Drag-and-drop reorder (keyboard reorder covers this)

## Paper

- [x] Letter, Compact, Executive, Editorial, Sidebar, Classic
- [x] Fit / 100% stage
- [x] Page-2 overflow hairline
- [x] Print CSS `@page letter`
- [x] Keyword highlight against posting
- [x] Copy / download plaintext
- [x] Empty sheet still fills a letter page (min-height)

## Tailor / ATS

- [x] Instant local tailor (reorder + tighten weak verbs)
- [x] Infer company / role from posting
- [x] Sample postings (editorial + engineering)
- [x] Paste posting from clipboard
- [x] ATS score + checks + missing phrases
- [x] Copy ATS notes as text
- [x] Checks: contact, summary, verbs, metrics, length, skills, dates, education, keywords
- [x] What changed notes
- [x] Undo last tailor
- [x] Compare current vs original sheet
- [x] Bullet-level diff list
- [x] Keyword fit: promote evidenced phrases to skills (never invent)
- [x] Save this version after a tailor

## Cover letter

- [x] Local letter from facts
- [x] Greeting / body / closing editable
- [x] Tones: calm (Measured), direct (Short), warm (Human)
- [x] Word count
- [x] Print / copy / .txt
- [x] Draft from Tailor uses selected tone

## Versions

- [x] Save named version (resume + paper + posting + letter)
- [x] Named save field on Versions page
- [x] Load / rename / delete / duplicate
- [x] Diff vs current sheet
- [x] Cap 20, stored locally
- [x] Versions page
- [x] ⌘S / Ctrl+S from Studio

## Export

- [x] Browser Print / PDF
- [x] Plain text `.txt` (resume + letter)
- [x] Markdown `.md`
- [x] JSON Resume
- [x] Chambers JSON pack (includes tone + density)
- [x] Word `.docx` (resume + letter)
- [x] Export page
- [x] Ready-to-send checklist

## AI (user-initiated, server-only)

- [x] Parse / tailor / letter / bullet / summary via grok-4.5 when key present
- [x] Local fallback when AI is unavailable
- [x] 12s timeout, no keystroke calls

## Quality

- [x] Loading skeletons
- [x] Empty letter / empty ATS states
- [x] Error boundary
- [x] 404 page
- [x] Skip link + 44px tap targets
- [x] Mobile studio tabs
- [x] Keyboard: save version, undo tailor, open export
- [x] Reduced-motion
- [x] Unit tests for parse, ATS, tailor, infer, letter, export, keywords, ingest
- [~] Dedicated a11y audit pass (aria-pressed on tones/density; skip link; labels)
- [x] Production build + preview smoke this session

## Non-goals (do not add)

- Accounts, cloud sync, job tracker
- Inventing facts
- Subscription / watermark
