---
name: verify
description: Build, launch, and drive the Keepsake SPA end-to-end (Vite + Playwright recipe that works in this repo)
---

# Verifying Keepsake

Client-only React/Vite SPA (HashRouter, base `/keepsake/`). Persistence is IndexedDB
(localStorage fallback) — state survives reloads within one browser context, and a fresh
Playwright context is a clean slate.

## The fast gate

```bash
npm test              # 22 Vitest unit tests (migrate, value, routing, guide rules)
npm run test:e2e      # 6 Playwright journeys — auto-starts the dev server itself
npm run build         # tsc -b && vite build (+ PWA sw) — must be clean
```

`e2e/journey.spec.ts` asserts zero console/page errors per test and covers:
demo journey, offer-check honest refusal, fresh binder (add/persist/edit/
rooms/search), example-binder recoverability, backup download, gift Together
mode. Extend it rather than writing throwaway drive scripts.

## Build & launch (manual driving)

```bash
npm run build                      # tsc -b && vite build — must be clean
npm run dev -- --port 5199         # serves http://localhost:5199/keepsake/
```

App URLs are hash routes: `http://localhost:5199/keepsake/#/binder`, `#/start`, `#/check`,
`#/plan`, `#/print/memo`, `#/print/inventory`.

## Drive (Playwright)

Install once into a scratch dir (not the repo): `npm i playwright && npx playwright install chromium`.
Collect `console`/`pageerror` events — the app should produce zero.

Flows worth driving every time:
- **Demo journey:** Welcome → "See an example — Margaret's" → item detail (trend card renders for
  the Family-plan demo; china shows the kind-decline copy) → clock → "Get it appraised" preflight →
  Appraisals directory → `#/check` (Silver Dollar Collection + offer 200 → "I'd say no thank you") →
  Family (trusted-contact card + activity) → Summary (values hidden until toggle) → both print docs.
- **Fresh journey:** `#/start` → create binder → upload a small PNG to `input[type=file]` (identify
  card appears after ~1.6s) → reject suggestion → save with empty name (inline error) → fill & save →
  `page.reload()` (IndexedDB persistence) → Remove + "Put it back" (accept the `confirm` dialog via
  `page.once('dialog', d => d.accept())`) → gift path from `#/start`.

## Gotchas

- Home "Recently added" shows only 4 items in tile view — reach the Grandfather Clock via the
  Living Room room card, not from Home.
- Curly apostrophes in UI copy ("It’s for me", "I’ll…") — match them exactly in selectors.
- Voice capture: headless Chromium reports Web Speech support, so the "Press and tell me about it"
  button renders and clicking shows the Listening state; actual transcription won't produce text.
- The truth rule is a test surface: grep rendered pages for unlabeled simulation — anything
  simulated must show the "Preview"/"Example data" tag.
- The example binder lives in its own storage slot: "See an example" always opens pristine
  Margaret with a leave-banner; the user's binder is in the 'main' slot, untouched.
- Photos live in a separate IndexedDB store ('photos'); items carry photoId. Backup export
  inlines them back; imports/boot externalize them again.
- Confirmations are the in-app ConfirmProvider dialog now, NOT window.confirm — drive them by
  clicking the dialog's verb buttons, not page.on('dialog').

## Getting Ready guide (`#/guide`)

- Margaret demo: chapters 1–3 derive as done (9 of 11 steps); next step is "Print or share the
  family summary". Stub `window.print` before clicking Print; returning to `#/guide` shows the
  one-time celebration, then "Have the conversation" completes via its own "Yes — we've talked"
  button → finish moment "Your family will never have to guess."
- Fresh binder: no celebration barrage on first open; "Not today" must rotate the next offer to a
  DIFFERENT chapter (skipping "first story" must never offer "five stories"); pages reached from
  the guide show the "back to Getting Ready" pill (`location.state.fromGuide`).
- Gift flow lands on `#/guide`; the Together select (`#together`) reveals the helper script panel
  ("For {name}…") and the "Before your next visit" briefing.
- Guide nav entry is desktop-sidebar only — mobile bottom nav stays at six items.
