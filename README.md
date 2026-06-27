# Keepsake — interactive prototype

A warm, senior-first **digital heirloom binder**: aging homeowners photograph and archive their
valuables, capture the *story* behind each one, assign them to loved ones, get them appraised/insured,
and leave a calm "in an emergency" guide — a gift to pass on to their family.

This is a **clickable demo** for walkthroughs. It runs entirely in the browser; data is saved in your
browser's `localStorage` (no server, no account). It's built as a real React app so it's a foundation
to keep building on.

## Run it

```bash
cd keepsake
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

`npm run build` makes a production bundle; `npm run preview` serves it.

## Walkthrough script (for a demo)

1. **Welcome** (`/`) — the warm pitch. Click **Open Margaret's Binder**.
2. **My Binder** — value totals, rooms, recently kept items.
3. **Add an item** (＋) — take/choose a real photo → watch the simulated **AI auto-fill** → add the
   **story** → assign **who it goes to** → Save. The new item persists.
4. **Item detail** — the story, value, beneficiary picker, documents, "Get it appraised" / "insurance".
5. **Appraisals** — photo-triage vs. items routed to an **in-person** certified appraiser.
6. **Family** — invite children with view / edit / executor roles; privacy reassurance.
7. **In an Emergency** — the "when I'm gone" practical guide.
8. **For My Family** — an auto-compiled, printable summary grouped by who inherits what.

To reset the demo to the seeded sample, clear the site's local storage (or call `resetDemo()` — wired
in `src/store.tsx`).

## How it's built (where to extend)

- **`src/types.ts`** — the domain model (Item, Room, Person, etc.).
- **`src/data/seed.ts`** — the sample "Margaret's Binder" content. Edit to change the demo data.
- **`src/store.tsx`** — single source of truth (React context + localStorage). Swap this for a real
  API/database later without touching the pages.
- **`src/pages/`** — one file per screen. **`src/components/`** — shared UI + layout.
- **`src/index.css`** — the warm design tokens (colors, fonts) used everywhere.

### What's simulated (and the real version)

- **AI photo identification** in *Add an item* picks from a sample list. Real version: send the photo
  to a vision model (Claude) to identify the item, draft the description, and estimate a value range.
- **Appraisal completion** and **insurance** are buttons that update state. Real version: connect a
  vetted appraiser marketplace and insurance referral partners.
