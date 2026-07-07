# Keepsake — Engineering Audit (post-wave state, 2026-07)

*Six-agent audit & competitive session, July 2026. See 00-synthesis.md.*

Scope: full read of `src/` (41 files, ~6,500 LOC), configs, seed/repository/lib layers, then compared against `docs/review-2026-07/02-architecture.md`. Verdict up front: the original review's top actions genuinely landed. What remains is a small set of real correctness bugs, second-generation debt the waves introduced, and zero tests guarding any of it.

---

## 1. Code quality

### High

- **C1. Repository re-instantiated on every render.** `store.tsx:119` — `useRef(createRepository())` evaluates its argument on *every* render of `StoreProvider`, so every mutation opens a fresh `indexedDB.open('keepsake')` connection that is immediately discarded and never closed. Only the first-render instance is kept, so behavior is correct, but this is unbounded connection churn on the hot path. Fix: `useState(() => createRepository())` or lazy ref init.

### Medium

- **C2. `AppraisalStatus` is a parallel, partially-dead state machine.** `'requested'` is never set by any code path — only seed data. Status and `valuations` can drift: nothing reconciles them; no way to cancel/re-request once status leaves `'none'`; three overlapping enums describe the same concept (`AppraisalStatus`, `AppraisalTier`, `ValuationSource`) with near-matching but unequal literals. Status should be derived, or collapsed to one enum with a reconcile function in `lib/appraise.ts`.
- **C3. `confirm()` vs designed dialogs — pattern split.** Native `window.confirm` in five places while the appraisal preflight got a designed card. One `ConfirmCard`/`useConfirm` in `components/ui.tsx` retires all five.
- **C4. Legacy visual fields survive migration.** `Item.emoji`/`Room.emoji` deprecated and `image` vs `photo` dual field remains; `migrate()` strips `estValue/appraisedValue` but carries `emoji` through. The migration is the natural place to drop them.
- **C5. Duplication that crept in across waves:** "stories told" derivation ×3 (Home, Summary, prepare); heir-select markup ×3 (AddItem, ItemDetail, Family); per-heir grouping + showValues + disclaimer duplicated between Summary and PrintBinder; person/room lookups re-implemented per print page; mailto body building ×2; value-source labels twice with an untyped Record in PrintInventory that won't fail compilation if `ValuationSource` changes.
- **C6. `store.tsx` shape.** 401 lines mixing four concerns. **Recommendation: extract pure updaters into `lib/binder.ts` as `(state, action) → state` functions.** Halves the file, makes the store unit-testable, leaves a later context split optional. Move `money` to `lib/format.ts` (12 files import a formatting util from the data layer).

### Low

- **C7. Dead code:** `SectionTitle` has zero call sites; `icons.tsx` re-exports `Info`, `Phone`, `Star`, `X`, `ImageIcon` with zero consumers; `ExecutorAccess.protocol: 'owner-release'` never constructed; the `'lighting'` icon key maps a category not in `CATEGORIES`.
- **C8. Pattern consistency, minor:** `Home.tsx` still reads/writes localStorage directly for view mode; `location.state` casts are ad-hoc inline types — a shared `NavState` type would prevent drift.
- **C9. Lib layer coherence is otherwise good** — `value.ts` as the single value-read path is respected everywhere; `prepare/appraise/market` follow the same "rules out of pages" shape. The codebase's strongest layer.

---

## 2. Correctness risks (severity order)

- **R1. Save pipeline ordering is safe *by accident of IndexedDB semantics*.** Write-through effect fires a `save()` per state change with no queue. IDB readwrite transactions from one connection execute in creation order — but (a) C1's per-render connections would break this if the ref ever re-initialized; (b) the `.then(() => setSaveError(null))` can clear an error raised by a later failed save under the localStorage fallback; (c) **no flush on `beforeunload`/`visibilitychange`** — a save in flight when the tab closes is lost silently. Add a monotonic save-sequence guard and a pagehide flush.
- **R2. `completeStep` outside the Guide defeats the "no celebration barrage" rule.** OfferCheck/Summary/PrintBinder call `completeStep()` which lazily creates preparedness with `celebrated: []` and `startedAt: now`. A fresh user whose first act is checking an offer has now "started the path" — later opening the Guide, `startPath` skips the credit-life pre-celebration and `pendingCelebration` fires for every step life already completed. Fix: pre-credit `celebrated` wherever preparedness is lazily created, or only celebrate steps completed after `startedAt`.
- **R3. Migration passthrough will crash on partial `preparedness`.** `migrate()` casts blindly; a stored binder with `preparedness` missing `celebrated` breaks `markCelebrated`. Same class: `migrateItem` never defaults `documents` — `item.documents.length` throws on pre-v2 items. Needs a defaults pass and a versioned envelope (`{v: 3, state}`) instead of shape-sniffing.
- **R4. `Start.tsx` demo sentinel can wipe a real user's binder.** `isDemo = ownerName === 'Margaret'` suppresses the replace-confirm — a real user named Margaret (this product's exact demographic) loses everything without warning. Use an explicit `isDemo` flag on `BinderState` set only by seed.
- **R5. Whole-blob persistence with embedded photos is the real scale bug.** Every mutation structured-clones the entire binder including every ~200–400KB photo data URL into IDB. At 50 photographed items that's ~15MB cloned per audit-line write. Photos must become separate IDB records (id-referenced) before any pilot. (Derived-completion per-render perf is a non-issue by comparison.)
- **R6. Two tabs silently clobber each other.** Whole-binder last-writer-wins; no `storage` event/`BroadcastChannel`/version check. Shared iPad + helper's laptop is not exotic. Minimum: version stamp on save, refuse + reload prompt on mismatch.
- **R7. Audit-trail gaps vs. the privacy promise.** `updateEmergency`/`deleteEmergency` write no audit line while `addEmergency` does — quiet edits to "where my papers are" are precisely what the audit exists to blunt.
- **R8. `purgeTrash` only on load** — an always-open tab never purges; state the guarantee as "at least 30 days" or purge on visibilitychange.
- **R9. HashRouter + `location.state`:** `fromGuide` doesn't survive reload; AddItem's dirty-guard only covers its own Cancel buttons — sidebar navigation discards a typed story silently.
- **R10. `ItemVisual` has no `onError` fallback** for dead/offline Unsplash seed URLs — offline demo shows broken images instead of the category tile.

---

## 3. Testing

Zero unit tests; verification is the (excellent, manual) Playwright recipe in `.claude/skills/verify/SKILL.md`. The lib extraction means high-value tests are cheap today.

**Setup: Vitest, node environment, no jsdom.** Do the C6 extraction first. **The 10 tests, in value order:**
1. `migrate()` v2 scalar fold — idempotent, legacy keys stripped.
2. `migrate()` rejection + defaults — garbage → null; missing arrays default.
3. `currentValuation()` precedence — in-person beats newer owner estimate; latest date within source.
4. `routeAppraisal()` matrix — touch categories always in-person; <500 → none-needed; >5000 → in-person; else photo.
5. `prepareProgress()` skip rotation — different chapter next; heavy skip → light offer; skipped to back of queue.
6. `prepareProgress()` completion accounting — coreDone excludes ongoing; derived vs attested.
7. `pendingCelebration()` — null before startedAt; once per step; **regression for R2**.
8. `marketSnapshot()` determinism — same id → identical output; round5 floors; trend-word boundaries.
9. Store transitions (post-extraction): `removePerson` clears beneficiaryId on items AND trash AND executorAccess; audit cap; purgeTrash boundary.
10. `emptyBinder()`/gift path — gifter as collaborator + audit line.

**Playwright: check it in** as `e2e/journey.spec.ts` (demo journey + fresh journey + guide rotation), `@playwright/test` devDependency, console/pageerror assertions. Keep SKILL.md as the human runbook pointing at the script.

---

## 4. Production-readiness delta (to a real pilot)

- **Data durability is the gap, not auth.** (a) Call `navigator.storage.persist()` at boot — **without it iOS/Safari evicts IndexedDB after ~7 days of disuse**, and this product's cadence is one Sunday a month; (b) **no export exists** — JSON export/import is both the truth-rule fix (Plan page promises it) and the only backup story a device-local app has; (c) R6 multi-tab guard.
- **Backend via the seam:** the `BinderRepository` contract is already async/fallible — a remote adapter slots in. Before writing it: add a monotonic `rev` to `save()` for optimistic concurrency, and pull photos out of the blob (they become storage keys server-side anyway). Person/membership split remains the schema work item.
- **Error telemetry:** `ErrorBoundary` swallows errors with no logging hook; no `window.onerror` capture. Even a pilot needs a local ring buffer exported with the JSON backup, scrubbed of story text.
- **Bundle:** 112KB gzip JS single chunk — healthy. Cheap win: `React.lazy` the three print routes and Guide.
- **PWA:** no manifest/service worker; "lives on this device" wants Add-to-Home-Screen (also hardens iOS eviction). `vite-plugin-pwa` is a small add.
- **iOS Safari:** Web Speech fires `onend` after short pauses in continuous mode — an elder's storytelling cadence will cut recordings off mid-thought; add auto-restart-while-listening.

---

## 5. Top 5 engineering actions (ordered)

1. **(S) Fix the correctness cluster in one pass:** C1 repo-per-render, R2 celebration barrage, R4 Margaret sentinel, R7 emergency-edit audit lines, R1 pagehide flush + save-sequence guard. Nothing exceeds a day total.
2. **(M) Extract pure store updaters to `lib/binder.ts`, stand up Vitest with the 10 tests, check in the Playwright journeys as `e2e/`.**
3. **(M) Pilot durability: `navigator.storage.persist()` + JSON export/import + multi-tab version guard + harden `migrate()`** ("the binder cannot be silently lost").
4. **(M) Pull photos out of the binder blob into separate IDB records** — prerequisite for real usage volume and the future upload pipeline.
5. **(M–L) Ship-shape: lazy-load print/guide routes, PWA manifest, ErrorBoundary telemetry hook, `AppraisalStatus` reconciliation** — then the backend adapter per the seam.

**Divergence from 02-architecture.md:** its steps 1–2 are done and done well. Disagreements: TanStack Query is not needed yet; derived-completion perf is a non-issue compared to whole-blob photo serialization, which the compression fix solved only the *quota* half of.
