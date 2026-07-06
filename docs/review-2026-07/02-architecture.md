# Keepsake — Architecture Review

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

Scope: full read of package.json, tsconfig*, vite.config.ts, and all of src/ (~2,500 LOC, React 19 + Vite 8 + Tailwind 4 + react-router 7, HashRouter, localStorage persistence).

---

## 1. Code-quality findings

### State management & persistence

| # | Finding | Location | Severity |
|---|---|---|---|
| 1.1 | **Unhandled `QuotaExceededError` on every save.** `localStorage.setItem(STORAGE_KEY, JSON.stringify(state))` runs in a `useEffect` with no try/catch. Combined with 1.2 this is a live crash path: one large photo and every subsequent save throws inside the effect (no error boundary anywhere — `src/main.tsx` renders bare), so the app white-screens or silently stops persisting. | `src/store.tsx:45-47` | **High** |
| 1.2 | **Photos stored as full-resolution base64 data URLs in localStorage.** `AddItem` does `reader.readAsDataURL(file)` with no downscaling or compression (`src/pages/AddItem.tsx:50-54`), and the entire binder — photos included — is re-serialized as one JSON string on every state change (`src/store.tsx:46`). A single modern phone JPEG (3–8 MB → +33% as base64) exceeds the typical ~5 MB localStorage quota by itself. This is the prototype's most serious defect: the flagship flow ("photograph your valuables") breaks after 1–2 real photos. | `src/pages/AddItem.tsx:50-54`, `src/store.tsx:46` | **High** |
| 1.3 | **`photo` field is dead; contract violated at the only write site.** `types.ts` documents `image` = hosted URL (seed) and `photo` = user data URL, and `ItemVisual` resolves `item.photo ?? item.image` (`src/components/ItemVisual.tsx:26`). But `AddItem.save()` writes the data URL into `image` (`src/pages/AddItem.tsx:94`, also the preview at `:81`). `Item.photo` is never written anywhere — the documented distinction (and ItemVisual's resolution order) is dead code, and user data URLs are indistinguishable from CDN URLs, which will bite any future migration that needs to tell them apart. | `src/pages/AddItem.tsx:81,94`, `src/types.ts:33-34` | **Medium** |
| 1.4 | No validation/migration on load: `JSON.parse(raw) as BinderState` is a blind cast (`src/store.tsx:26-33`). The key is named `keepsake.binder.v2` implying versioning, but there is no v1→v2 migration or shape check; corrupted/stale data surfaces as runtime errors deep in pages. | `src/store.tsx:22,26-33` | Medium |
| 1.5 | Store API object is rebuilt via `useMemo(..., [state])`, so every consumer re-renders on any mutation, and all selectors close over the whole state. Fine at 6 items; wrong shape for growth (no memoized selectors, no context splitting). | `src/store.tsx:49-79` | Low |
| 1.6 | Homegrown ID generator using `performance.now()*1000` + a 1e6-modulo random (with a hardcoded `1` fallback). `crypto.randomUUID()` is available in every target browser. Weak entropy matters once IDs become server keys. | `src/store.tsx:35-40` | Low |
| 1.7 | `money()` (a presentation/formatting util) is exported from the store module — pages import UI formatting from the data layer. | `src/store.tsx:86-87` | Low |

### Type model (`src/types.ts`)

| # | Finding | Location | Severity |
|---|---|---|---|
| 1.8 | `category: string` is free text, but business logic string-matches it: appraisal triage checks `['Jewelry','Watches','Collectibles'].includes(item.category)` case-sensitively (`src/pages/ItemDetail.tsx:44-48`), and the icon map keys on normalized strings (`src/components/icons.tsx:118-131`). A user typing "jewelry" silently bypasses in-person triage. Should be a union/enum with a curated list + "Other". | `src/types.ts:31`, `src/pages/ItemDetail.tsx:44` | **Medium** |
| 1.9 | `Person` conflates three concepts: identity, beneficiary, and access role. `role: 'owner'|'collaborator'|'viewer'|'executor'` lives on the same record used as an inheritance target, and `relationship: 'Me'` is a magic sentinel checked in UI (`src/pages/Family.tsx:103`). A beneficiary need not have an account; an executor need not inherit. This is the single most important type to split before real sharing. | `src/types.ts:12-20` | **Medium** |
| 1.10 | No timestamps anywhere. "Recently kept" is implemented by `addItem` prepending (`src/store.tsx:53`) and `Home` slicing the front (`src/pages/Home.tsx:52`) — ordering is an accident of array position and won't survive a database. | `src/types.ts:26-45` | Medium |
| 1.11 | Value modeling is two scalars (`estValue: number \| null`, `appraisedValue?: number`) with `appraisedValue ?? estValue` fallback repeated in 3 pages (`ItemDetail.tsx:87`, `Summary.tsx:9,52`, `Home.tsx` ItemRow). No provenance, no history — incompatible with the roadmap's market-value trend tracking. Also mixed null/undefined optionality conventions. | `src/types.ts:37,43` | Medium |
| 1.12 | `ItemDocument` has `type` and `label` but no payload (no url/blob/key) — documents are display-only fiction; fine for a demo, but the type reserves no room for the real thing. Deprecated `emoji?` fields kept on Item and Room with no migration that strips them. | `src/types.ts:22-25,32,50` | Low |
| 1.13 | `BinderState` is a hard singleton (one owner, one binder, people embedded) — no `Binder` entity, no user concept. Every roadmap feature (accounts, sharing) needs a `binder_id` foreign key that doesn't exist yet. | `src/types.ts:59-66` | Medium (by design for demo) |

### Components, routing, duplication, dead code

| # | Finding | Location | Severity |
|---|---|---|---|
| 1.14 | `roomIcon()` duplicated verbatim (13 lines) in two pages. | `src/pages/Home.tsx:28-36`, `src/pages/Room.tsx:16-24` | Low |
| 1.15 | The `input` Tailwind class string is copy-pasted in 3 pages (`AddItem.tsx:268`, `Family.tsx:134`, `Emergency.tsx:91`) plus inlined on the `ItemDetail` select (`:127`); `Field`/`Labeled` wrapper components duplicated (`AddItem.tsx:271-278`, `Family.tsx:136-143`). Belongs in `components/ui.tsx` next to Button/Card. | above | Low |
| 1.16 | Dead code: `void personById` — destructured but unused, suppressed to satisfy `noUnusedLocals` (`src/pages/Summary.tsx:99`); unused assets `src/assets/hero.png`, `react.svg`, `vite.svg` (zero references); `skipPhoto` is a pointless one-line wrapper (`AddItem.tsx:70-72`); `Appraisals` Section types its props as `ReturnType<typeof useStore>['state']['items']` instead of `Item[]` (`Appraisals.tsx:81-85`). Also `dist/` is checked into the tree. | above | Low |
| 1.17 | Routing: no catch-all `path="*"` route — unknown URLs render an empty layout shell (`src/App.tsx:16-27`). Not-found states for item/room are bare `<p>` tags (`ItemDetail.tsx:35`, `Room.tsx:33`). HashRouter + `base:'/keepsake/'` is correct for GitHub Pages but must flip to BrowserRouter for a real deploy. | `src/App.tsx` | Low |
| 1.18 | Error handling gaps: `alert()`/`confirm()` for real UX moments (`Appraisals.tsx:46`, `Summary.tsx:33`, `ItemDetail.tsx:186`); `AddItem` assumes `state.rooms[0]` exists (`AddItem.tsx:44` — crashes on an empty-rooms binder); seed images hotlink Unsplash with no `onError` fallback in `ItemVisual` (`ItemVisual.tsx:28-36`), so an offline demo or dead CDN URL shows a broken image instead of the category tile. FileReader has no `onerror`. | above | Low–Medium |
| 1.19 | The simulated AI picks a suggestion by `Date.now()` modulo and shows a hardcoded 1600 ms delay (`AddItem.tsx:60-68`) — fine, but note the "identify" step commits `name/category/estValue` regardless of the actual photo; acceptable demo fiction, must be behind a service interface (see §2). | `AddItem.tsx:60-68` | Info |

Tooling is in good shape: strict-ish TS (`noUnusedLocals/Parameters`, `verbatimModuleSyntax`), oxlint, clean project-references split. No tests exist at all — fine for a clickable demo, but the store is the one unit worth testing before any swap.

---

## 2. Verifying the claim: "swap `store.tsx` for a real API without touching pages"

**Verdict: structurally half-true, semantically false.** The import discipline is genuinely good — pages import only `useStore` and `money` from `./store`, nothing reads `localStorage.getItem(STORAGE_KEY)` directly, and all mutations go through the five store methods. If "swap" means "replace localStorage with another *synchronous local* store," the claim holds. For a **real API/database**, it does not, for five specific reasons:

1. **The contract is synchronous and infallible.** `addItem` returns the new id immediately and `AddItem` navigates to `/item/${id}` on the next line (`src/pages/AddItem.tsx:91-105`); `updateItem`/`deleteItem` are fire-and-forget; selectors return values, never promises; `state` is fully populated at first render. No page has any loading, empty-while-fetching, retry, or failure state. An async backend behind this exact signature forces either (a) an optimistic local-cache + background-sync layer inside the store — a legitimate design, but that's *building a sync engine*, not "swapping" — or (b) changing every call site. The README's claim silently assumes (a) without the store having any of the machinery (dirty tracking, retry queue, conflict handling) that (a) requires.

2. **Pages encode the storage format.** `AddItem` produces a base64 data URL via FileReader and writes it into `Item.image` (`AddItem.tsx:50-54,94`). The data URL *is* the localStorage implementation detail leaked into the page and the type. A real photo pipeline (upload → storage key → CDN URL) rewrites this page's capture flow, not just the store.

3. **Business rules live in pages, and a backend swap must move them.** Appraisal triage (which categories need in-person) is in `ItemDetail.tsx:42-49`; appraisal completion pricing (`estValue * 1.1`) is in `Appraisals.tsx:32`; AI identification is in `AddItem.tsx:22-68`. These are exactly the things the roadmap makes server-side (marketplace, Claude vision), so "without touching pages" is false for the three pages that matter most.

4. **A second, un-abstracted persistence path exists.** `Home.tsx:41-45` reads/writes `localStorage` directly for the view-mode preference (`keepsake.recentView`) — a page touching the storage medium the claim says pages don't know about. Trivial, but it's a counterexample in the codebase today.

5. **Client-generated IDs and full-dataset materialization** (`store.tsx:35-40`; every page filter/reduces over `state.items`) are assumptions a backend must honor: either accept client UUIDs and always ship the whole binder to the client, or touch pages. (For this domain — hundreds of items, not millions — "whole binder as client cache" is actually the *right* call; it just needs to be a stated contract, not an accident.)

**Bottom line:** the seam exists and is worth keeping, but it's an interface boundary drawn around the wrong contract (sync, infallible, storage-format-leaking). Fix the contract first (make it async/optimistic and move the three business rules behind it), and *then* the claim becomes true.

---

## 3. Scale-up architecture (v1 for the real roadmap)

Roadmap: accounts, server photos, Claude vision ID, appraiser marketplace, insurance referrals, family sharing (view/edit/executor), market-value trends. Users: seniors on spotty connections and old iPads — offline tolerance and forgiving UX are requirements, not nice-to-haves.

### Stack (pragmatic, small-team)

- **Frontend:** keep React + Vite + Tailwind + react-router (switch HashRouter → BrowserRouter). Add **TanStack Query** as the async cache layer with **IndexedDB persistence** (`persistQueryClient` + idb) so the binder renders instantly from cache and survives offline.
- **Backend:** **Postgres behind a thin typed API**. Fastest credible path: **Supabase** (Postgres + Row-Level Security + Auth + Storage + edge functions) — RLS maps 1:1 onto the view/edit/executor model and you skip building auth. Equivalent DIY: Node (Hono/Fastify) + Drizzle + Postgres + S3. Avoid anything exotic; this domain is a CRUD app with a photo pipeline and a workflow engine bolted on.
- **Auth (senior-first):** email magic links + phone OTP; family invitations as emailed tokens that create a membership on acceptance. No passwords if you can avoid them.
- **AI:** server-side endpoint that forwards a resized photo to Claude vision with a structured-output schema (`name, category, era, condition, value_low, value_high, confidence`). Never in the browser (key exposure), never blocking save.

### Data model changes (the core migration)

```
users            (id, email, phone, ...)
binders          (id, owner_user_id, name, created_at)
memberships      (binder_id, user_id, role: viewer|editor|executor, invited_email, accepted_at)
people           (id, binder_id, name, relationship, linked_user_id?)   -- beneficiaries; account optional
rooms            (id, binder_id, name, sort)
items            (id UUID client-generatable, binder_id, room_id, name, category ENUM,
                  story, acquired, serial, condition, beneficiary_person_id?, created_at, updated_at)
photos           (id, item_id, storage_key, width, height, taken_at, is_primary)
documents        (id, item_id, type, label, storage_key)
valuations       (id, item_id, source: owner|ai|photo_appraisal|in_person_appraisal|market,
                  amount, currency, confidence?, appraiser_id?, created_at)   -- history, not scalars
appraisal_requests (id, item_id, status: requested|triaged_photo|triaged_in_person|scheduled|complete,
                  appraiser_id?, result_valuation_id?)
appraisers       (id, name, certifications, service_area, ...)               -- marketplace
referrals        (id, binder_id, kind: insurance|appraisal, partner, status)
emergency_entries(id, binder_id, label, detail, visibility: family|executor_only)
audit_log        (binder_id, user_id, action, at)   -- backs the "see who viewed" privacy promise
```

Key shifts from `types.ts`: `Person.role` splits into `memberships` (access) vs `people` (beneficiaries); `estValue`/`appraisedValue` collapse into a `valuations` history (current value = latest per precedence — this is what makes market-trend tracking a query instead of a schema change); `image`/`photo` strings become a `photos` table of storage keys; everything gets `binder_id` + timestamps. Enforce roles with Postgres RLS: viewers select; editors mutate items/rooms/photos; executor-only rows (emergency `executor_only`, full summary) unlock via a deliberate, audited "activation" flow — never a silent flag.

### Sync strategy (offline-tolerant, not full CRDT)

This domain is single-writer-mostly (the owner edits; family mostly reads), so skip Replicache/ElectricSQL-class machinery in v1:

1. **Reads:** whole binder fetched as one payload (it's small — hundreds of items), cached in IndexedDB via TanStack Query persistence. App opens instantly offline with last-known data.
2. **Writes:** optimistic mutations + a durable **outbox queue in IndexedDB**; client-generated UUIDs (which the current `addItem`-returns-id flow already anticipates — keep that); flush on reconnect with idempotency keys; last-write-wins per field with `updated_at`, surfaced gently ("Sarah also edited this") rather than blocked.
3. **Photos offline:** captured blob goes into IndexedDB, item saves immediately with a local object-URL; background upload with retry when online; swap to CDN URL on success. The user never waits on a spinner for the network.

### Photo pipeline

Client: `createImageBitmap` → canvas downscale to ~2048px, JPEG/WebP q≈0.8 (a 6 MB HEIC becomes ~300 KB — also fixes finding 1.1/1.2 *today*) → presigned direct-to-storage upload (S3/Supabase Storage) → server records `storage_key`, generates thumbnail variants (or use an image-transform CDN); serve signed URLs, since these images are private estate data. The same resized image feeds the Claude vision endpoint; AI results land as a `valuations(source:'ai')` row + prefilled draft fields, editable before save — the current `capture → identify → details` UX flow maps onto this perfectly and should be kept as-is.

### Keep vs rewrite

- **Keep:** all pages and the design system (`components/ui.tsx`, `icons.tsx`, `ItemVisual`, `Layout`, `index.css`) — the senior-first UI is the prototype's real asset; `types.ts` as the seed of the client model; the AddItem 3-step flow; the routing map.
- **Rewrite:** `store.tsx` entirely (this was always its destiny — replace with TanStack Query hooks behind the same `useStore()`-shaped facade, now async-aware); `AddItem` photo capture (compression + outbox); ID generation (`crypto.randomUUID()`); the three in-page business rules (triage, appraisal pricing, AI mock) move behind API calls.
- **Add:** error boundary + catch-all route, loading/error affordances (large, calm, senior-friendly), auth shell, store unit tests before the swap.

### Migration path (incremental, each step ships)

1. **Now, still local:** compress photos, move persistence localStorage → IndexedDB, add quota/error handling, `randomUUID`, error boundary. (Fixes the crash class with zero backend.)
2. **Reshape the seam:** introduce an async `BinderRepository` interface + TanStack Query behind the existing hook shape, still backed by IndexedDB; move triage/pricing/identify behind it. Pages now genuinely won't change later.
3. **Backend + auth:** Supabase/Postgres with the schema above; repository's remote implementation + outbox; on first login, **import the existing local binder** (the localStorage JSON maps cleanly — this is the payoff of step 2).
4. **Photos + Claude vision** endpoints.
5. **Sharing/roles via RLS + invites + audit log; then marketplace/referrals/valuation trends** as workflow tables on top.

---

## 4. Top 5 architecture actions (ordered)

1. **Defuse the photo/storage bomb:** client-side image compression before store, persistence to IndexedDB, try/catch + user-visible failure on quota, error boundary in `main.tsx`. (`src/pages/AddItem.tsx:50-54`, `src/store.tsx:45-47`) — the flagship flow currently breaks on real photos.
2. **Redraw the store seam as an async repository** (TanStack Query + optimistic writes + IndexedDB outbox) while keeping the `useStore` facade — this converts the README's claim from aspiration to fact and is the prerequisite for every backend step.
3. **Fix the data model before it fossilizes:** split membership-role from beneficiary Person, replace `estValue/appraisedValue` with a valuations history, unify `image/photo` into a photos collection, add timestamps + `binder_id`, make `category` an enum. (`src/types.ts:12-20,31-45`)
4. **Stand up the boring backend:** Postgres + RLS + Storage + magic-link auth (Supabase is the pragmatic pick), client UUIDs, whole-binder read model, local-binder import on first login.
5. **Evict business logic from pages** — appraisal triage (`ItemDetail.tsx:42-49`), appraisal pricing (`Appraisals.tsx:32`), AI identify (`AddItem.tsx:22-68`) — into the repository/API layer, and clean the small stuff behind it (dup `roomIcon`/`input`/`Field`, `void personById`, catch-all route, unused assets).
