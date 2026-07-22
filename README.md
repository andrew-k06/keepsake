# Keepsake — interactive prototype

A warm, senior-first **digital heirloom binder**: aging homeowners photograph and archive their
valuables, capture the *stories* behind the ones that have them, record who they'd like each piece to go to, get
appraisal guidance, and leave a practical "in an emergency" guide — a gift to pass on to their family.

This is a **clickable preview** for walkthroughs. It runs entirely in the browser; data is saved
on-device (IndexedDB with photos in their own store; localStorage fallback — no server, no
account), with a download-everything JSON backup/restore on the Plan page. Margaret's example
binder lives in its own storage slot, so walkthroughs never touch (and can never lose) a real
user's data. It's built as a real React app with a repository seam so a backend can slot in
without touching the pages.

**A rule the whole app obeys:** it never asserts what isn't true. Simulated steps are labeled
"Preview", insurance status is always owner-attested, wishes are never called bequests, and privacy
copy describes what the code actually does.

## Run it

```bash
cd keepsake
npm install      # first time only
npm run dev      # then open http://localhost:5173/keepsake/
```

`npm run build` makes a production bundle; `npm run preview` serves it.
`npm test` runs the unit suite (Vitest); `npm run test:e2e` drives the six
Playwright journeys against an auto-started dev server. The app is an
installable PWA (Add to Home Screen) and requests persistent storage.

## Walkthrough script (for a demo)

1. **Welcome** (`/`) — two honest doors: **Start your own binder** (real onboarding — both paths
   open on Getting Ready, the guide that orients before the first item) or **See an example —
   Margaret's** (its own storage slot; always pristine).
2. **My Binder** — stories-first stats, rooms, recently added, 30-day "Recently removed" restore.
3. **Add an item** (＋) — photo (compressed on-device, location metadata stripped) → details with
   **voice capture**: press, talk, and the story writes itself (real Web Speech API). The
   **explainable suggestion card** (evidence sentence, confidence in words, an equal-weight "No —
   I'll tell you what it is") demos **only inside Margaret's example binder** — a real photo never
   receives a fabricated guess; real identification arrives with the vision model, and saying so
   out loud is part of the pitch.
4. **Item detail** — the story (editable, by voice too), family memories, facts, **"What it sells
   for today"** (sold-price range with receipts, trend in words, the kind-decline pattern),
   owner-attested insurance, and the **appraisal preflight** (why this tier, what it costs, who
   sees the photos — including "you likely don't need to pay anyone for this one").
5. **Appraisals** — photo-review vs. in-person triage and the **accredited appraiser directory**
   (ISA/ASA/AAA, USPAP, insured, never buys what they appraise; item-scoped).
6. **Before You Sell** (`/check`) — the scam shield: pick the item, enter the offer, get a plain
   verdict against comps plus a face-saving doorstep script, and mention it to family in one tap.
7. **Family** — add people with plain-language roles, the **trusted-contact protocol** (dormant
   until verified documents + waiting period + read-only), and the activity record of every
   important change.
8. **In an Emergency** — guided prompt chips, editable notes, and honest access copy.
9. **For My Family** — story-first printable summary (values hidden unless toggled), share by
   email, plus two professional exports: a **personal property memorandum** for the attorney and a
   **clean inventory** for estate/insurance professionals. Print styles included.
10. **Plan** (`/plan`) — free Starter (15 items), $129 buy-once Binder, child-paid Family Plan;
    preview checkout, no dark patterns.

To reset to the seeded sample, use **Start your own binder**, or clear the site's storage.

## How it's built (where to extend)

- **`src/types.ts`** — the domain model. Values are a *history* of ranged valuations with sources;
  items carry memories and timestamps; the binder carries a plan, an audit record, and the
  executor-access designation.
- **`src/data/repository.ts`** — the persistence seam (async, fallible). IndexedDB today; point it
  at an API tomorrow without touching pages. Includes v2→v3 migration.
- **`src/data/seed.ts`** — Margaret's sample binder. **`src/data/appraisers.ts`** — example directory.
- **`src/store.tsx`** — single source of truth; mutations write plain-language audit lines.
- **`src/lib/`** — the business rules, out of the pages: `value.ts` (value precedence),
  `market.ts` (trend profiles + kind-decline copy), `appraise.ts` (routing tiers),
  `identify.ts` (explainable suggestions), `photo.ts` (compression + EXIF stripping).
- **`src/pages/`** — one file per screen. **`src/components/`** — shared UI, `VoiceCapture`,
  `TrendCard`, layout. **`src/index.css`** — warm senior-first tokens + print styles.

### What's simulated (and the real version)

- **Photo identification** and **market comps** are labeled example data. Real version: Claude
  vision behind a server endpoint returning `lib/identify.ts`'s shape, and a sold-comps service
  behind `lib/market.ts`'s shape.
- **Checkout, appraiser booking, and invitations** are labeled previews. Real version: Stripe, a
  credentialed marketplace, and account-backed sharing via the repository seam.
- **Voice capture is real** (browser Web Speech API), as are printing, the memorandum/inventory
  exports, mailto sharing, soft-delete/restore, and on-device persistence.

Full seven-lens review and roadmap: `docs/review-2026-07/`.
