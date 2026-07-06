# Keepsake — UI Design Review (Senior-First Lens, users 65–85)

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

Codebase reviewed in full: `src/index.css`, all of `src/components/`, all 8 pages. Contrast ratios below were computed from the actual hex tokens (including alpha-composited pill backgrounds).

---

## 1. Senior-Vision Audit

### 1a. Foundation — strong

- `src/index.css:61-62` — body `font-size: 18px; line-height: 1.55`. Meets the 18px-preferred bar. Headings serif at 1.18 line-height (`index.css:79`) is fine for display sizes.
- `src/index.css:68-72` — global 3px sage focus ring, offset 2px. Ring contrast: **4.41:1 on cream, 4.79:1 on white** — passes the 3:1 non-text minimum. Genuinely good.
- Labels are placed **above** inputs everywhere (`AddItem.tsx:271-278`, `Family.tsx:136-143`) — correct for this audience.
- No thin font weights anywhere; `font-semibold` is the workhorse. Good.
- `src/index.css:19` — `'Inter'` is declared but **never loaded** (no `@import`/link in `index.html`). The app silently renders in system-ui. Either load it or remove it from the token.

### 1b. Font-size findings (tokens: `--text-xs: 13px`, `--text-sm: 15px`, `index.css:32-33`)

Both tokens are below the 16px floor, and they are used **20 times** (18× `text-sm`, 2× `text-xs`) — largely on *meaning-bearing* text:

| Location | Text | Size |
|---|---|---|
| `Layout.tsx:69` | Mobile bottom-nav labels | 13px |
| `ui.tsx:118`, `ui.tsx:144`, `ui.tsx:187` | AppraisalBadge / Pill / InsuredBadge labels ("Needs in-person visit", "Executor"…) | 15px |
| `ItemCard.tsx:31` | "For {heir name}" — the inheritance assignment, the core promise of the product | 15px |
| `ItemDetail.tsx:99,120,150,216` | Section headers ("Its story", "Who this is for", "Documents") and Fact labels — uppercase + 15px is a double legibility penalty | 15px |
| `AddItem.tsx:132` | "Your photo stays private in your binder." (privacy reassurance) | 15px |
| `AddItem.tsx:234` | Voice-input tip | 15px |
| `Family.tsx:102` | Member email addresses | 15px |
| `Welcome.tsx:79` | Privacy promise line | 15px |

**Fix at the token**: `--text-xs: 0.875rem (14px)`, `--text-sm: 1rem (16px)`. One-line change lifts all 20 sites.

### 1c. Contrast (computed)

**Passing (worth noting because warm palettes usually fail here):**
- ink on white/cream/cream-deep: **14.9 / 13.8 / 12.6** — excellent
- ink-soft (#6b6157) on white/cream/cream-deep: **6.05 / 5.57 / 5.10** — secondary text passes AA everywhere
- sage-deep on sage/15 pill: **5.82**; clay-dark on clay/15: **4.78**; #8a5e12 on amber/20: **4.83** — all badge pairs pass at their sizes
- white on sage (InsuredBadge): **4.79** — passes even at 15px

**Failing:**
1. **White on clay (#c2603d) = 4.17:1.** Fine on 20px-semibold buttons (large-text 3:1), but the same pair is used at small sizes where 4.5:1 is required: `AddItem.tsx:292-294` StepDots numerals (15px bold on clay), `Home.tsx:191` active ViewToggle. And **clay-as-text on white = 4.17** at small sizes: `Layout.tsx:70` active bottom-nav label (13px), `ItemCard.tsx:32` heir name (15px), `Home.tsx:221` heir name. Cheapest global fix: darken `--color-clay` to ~#b2532f (≥4.5 on white) or use `clay-dark` (#a44c2d, **5.75**) for all sub-18px clay text/fills.
2. **`line-strong` chevrons on white = 1.60:1** (`Home.tsx:96-100`, `Home.tsx:232`). These are the "this is tappable" cue; at 1.6:1 many older eyes won't see them at all (they brighten only on hover — invisible on touch). → `text-ink-soft` (6.05).
3. **Placeholder text ≈ 3.06:1** (Tailwind v4 preflight: `currentColor` at 50%). Placeholders carry real content: `Family.tsx:65` "Daughter, Son, Friend…", `AddItem.tsx:232` "Where did it come from?…", `Emergency.tsx:47`. Add `::placeholder { color: var(--color-ink-soft); opacity: 1 }` in `index.css` (5.57–6.05).
4. **Disabled primary/secondary buttons at `opacity-40` ≈ 1.70:1** (`ui.tsx:35`). WCAG exempts disabled controls, but `ItemDetail.tsx:190-192` uses a disabled button to *convey state* ("Insured") — a senior can't read their own insurance status. Render state as the (passing) InsuredBadge instead, or use `opacity-70` + `cursor-not-allowed`.
5. **Category fallback icon `text-clay/70` on cream-deep = 2.34:1** (`ItemVisual.tsx:41`) — it's a meaningful graphic (`role="img"`), needs 3:1. → `text-clay` (3.52) or `text-clay-dark`.
6. **"Start your own binder" clay on cream = 3.84:1 at 18px semibold** (`Welcome.tsx:84-90`) — just under the 18.66px-bold large-text threshold, so 4.5 applies. → `text-clay-dark` or bump to `text-lg`.
7. Decorative but noted: `text-line` em-dash separators in StepDots at 1.25:1 (`AddItem.tsx:303`), clay/40 quote marks at 1.64 (`ItemDetail.tsx:104-106`) — acceptable as ornament.

### 1d. Tap targets

- **Good**: Buttons `py-4/py-5` ≈ 62–70px tall (`ui.tsx:36-39`); inputs/selects `py-3` ≈ 52px; mobile bottom-nav items ≈ 56px tall, `flex-1` wide; desktop NavItems ≈ 55px.
- `AddItem.tsx:107-113` — top "Cancel" is a bare text link ≈ **28px** tall. Same pattern: `ItemDetail.tsx:53-59`, `Room.tsx:38-44` back links, `AddItem.tsx:143-149` "I'll add a photo later", `Welcome.tsx:84` "Start your own binder". Add `py-2.5 -my-2.5` (or `min-h-11 items-center inline-flex`) to reach 44–48px.
- `Home.tsx:183-197` ViewToggle — `py-2` ≈ **36px** tall, and below the `sm` breakpoint the text label is hidden (`Home.tsx:195`), making it an **icon-only button whose `title` tooltip is hover-only** — the exact anti-pattern for this audience. Keep labels visible at all sizes; `py-3`.
- `AddItem.tsx:292` StepDots `h-8 w-8` — non-interactive, acceptable, but numerals are 15px on a 4.17 background (see 1c.1).

---

## 2. Interaction Patterns

**Genuinely good for seniors:** no swipe/long-press gestures anywhere; no vanishing toasts; no hamburger menu; persistent labeled bottom nav; blocking native `confirm()`/`alert()` dialogs (crude, but they don't time out and can't be missed).

**Findings, ordered by severity:**

1. **AddItem "skip photo" fabricates an identification** — `AddItem.tsx:70-72`: `skipPhoto()` calls `runIdentify()`, which shows "Looking at your photo…" (`AddItem.tsx:164`) *when no photo exists*, then pre-fills a random fake item ("Diamond Ring", $4,500) into the form. A 75-year-old who tapped "I'll add a photo later" now sees the app confidently mis-describe their belonging and must notice-and-delete three prefilled fields. Skip should go straight to a blank `details` step.
2. **Silent form failure** — `Emergency.tsx:13` and `Family.tsx:24`: `if (!label) return` / `if (!name) return`. The Save/Send button does *nothing*, with no message. For seniors this reads as "the app is broken" or worse, "it saved." Highest-priority error-state fix: inline message + `aria-live`, and keep the form open.
3. **No error/validation states exist anywhere.** AddItem will save an empty form as "Untitled item" (`AddItem.tsx:91`). Email in Family invite is unvalidated free text. There is not a single error style in the design system.
4. **Data-loss without warning** — `AddItem.tsx:108` top "Cancel" (`navigate(-1)`) and `AddItem.tsx:257` bottom Cancel both discard all typed story text instantly. The story field is the emotional core; losing a hand-typed paragraph is catastrophic trust damage. Confirm before discarding when fields are dirty.
5. **No way back within the wizard** — from `details` you cannot return to retake the photo; StepDots are not clickable. Add a "Back" secondary button per step.
6. **Delete is confirm-only, no undo** (`ItemDetail.tsx:196-202`). `confirm()` is acceptable for a prototype, but for the real app, use an in-app dialog with explicit "Keep it / Remove it" buttons; native confirm's OK/Cancel maps poorly for this audience.
7. **Identify step has no `aria-live`** (`AddItem.tsx:160-183`) — the 1.6s state change from "Looking…" to "Here's what we found" is invisible to screen readers, and `animate-pulse` (`AddItem.tsx:168`) plus all `hover:-translate-y` lifts run with **no `prefers-reduced-motion` guard** anywhere in `index.css`.
8. **Hover-dependent affordances**: card lift/scale (`ItemCard.tsx:13,16`), chevron color reveal (`Home.tsx:97`), ViewToggle tooltips. On touch (the likely device), the resting state must carry the affordance — see contrast fix 1c.2.
9. **Duplicate nav labels** — `Layout.tsx:23,26`: both `/family` ("Family") and `/summary` (short label "Family") render as **"Family" twice in the mobile bottom nav**. Two identical labels for different destinations is disorienting for everyone; rename `/summary`'s short label to "Legacy" or "Summary".
10. Scroll depth is reasonable: Home is long but chunked with 28px serif section headings; ItemDetail's right column stacks ~6 sections on mobile — acceptable, though destructive "Remove" landing in the same flex row as "Get it appraised" deserves more separation (`ItemDetail.tsx:175-206`).

---

## 3. Visual System

- **Token discipline is good**: radii, shadows, and the palette live in `@theme`; warm-tinted shadows (`index.css:28-29`) avoid the muddy-grey problem. Leaks: `text-[#8a5e12]` hardcoded twice (`ui.tsx:103,140`), avatar color array hardcoded in `Family.tsx:21` duplicating palette hexes — promote both to tokens (`--color-amber-ink`, etc.). `roomIcon()` is copy-pasted in `Home.tsx:28` and `Room.tsx:16`.
- **Spacing rhythm** is consistent (mt-6/8/12 cadence, p-5/6/8 cards); no findings.
- **Warmth vs readability**: the cream/ink pairing is the rare warm palette that *passes* (12.6–14.9:1). The failures are concentrated in clay-as-small-text and decorative-tint overuse — fixable without cooling the brand.
- **Photography treatment is strong**: consistent 4:3 card crops, square detail crop, `object-cover`, lazy loading, and a canonical fallback component (`ItemVisual.tsx`) with a real `aria-label` — better than most production apps.
- **Dark mode absence**: `color-scheme: light` locked (`index.css:44`). For 65–85 users a single, high-contrast warm light theme is a defensible and arguably *correct* choice (dark UIs worsen legibility for aging eyes with lens scatter). Not a finding. What *is* missing is a **print stylesheet**: `Summary.tsx:26` offers "Print this binder" — a killer feature for this audience — but there is no `@media print` in `index.css`, so the printout includes nav chrome, shadows, and the cream gradient background.
- Global focus style forces `border-radius: 8px` on every focused element (`index.css:71`) — visually mismatched on `rounded-full` pills/avatars; drop the radius override and let `outline-offset` do the work.

---

## 4. Concrete Fix List (mechanical order)

1. `src/index.css:32` — `--text-xs: 0.8125rem` → `0.875rem`
2. `src/index.css:33` — `--text-sm: 0.9375rem` → `1rem`
3. `src/index.css:10` — `--color-clay: #c2603d` → `#b2532f` (white-on-clay 4.17 → ≥4.5; keeps hue) — or leave token and apply fixes 4–6
4. `src/components/ItemCard.tsx:32` & `src/pages/Home.tsx:221` — `text-clay` → `text-clay-dark` (heir names, 4.17 → 5.75)
5. `src/components/Layout.tsx:70` — active mobile nav `text-clay` → `text-clay-dark`
6. `src/pages/AddItem.tsx:292-294` — StepDots `text-sm` → `text-base`; active bg `bg-clay` → `bg-clay-dark`
7. `src/pages/Home.tsx:97` & `Home.tsx:233` — chevron `text-line-strong` → `text-ink-soft` (1.60 → 6.05)
8. `src/index.css` — add `::placeholder { color: var(--color-ink-soft); opacity: 1; }`
9. `src/components/ItemVisual.tsx:41` — `text-clay/70` → `text-clay-dark/80` (2.34 → ≥3:1)
10. `src/components/ui.tsx:35` — `disabled:opacity-40` → `disabled:opacity-70 disabled:cursor-not-allowed`; `src/pages/ItemDetail.tsx:190-192` — replace disabled "Insured" Button with `<InsuredBadge />`
11. `src/pages/Welcome.tsx:86` — `text-clay` → `text-clay-dark` on "Start your own binder"
12. `src/pages/AddItem.tsx:70-72` — `skipPhoto` → `setStep('details')` directly; never show "Looking at your photo…" without a photo
13. `src/pages/Emergency.tsx:13` & `src/pages/Family.tsx:24` — replace silent `return` with visible inline error (`text-clay-dark` message + `aria-live="polite"`, red-tinted `border-clay` on the offending input)
14. `src/pages/AddItem.tsx:107-113`, `ItemDetail.tsx:53-59`, `Room.tsx:38-44` — back/cancel links: add `py-2.5 -my-1` (≥44px target); AddItem Cancel: confirm when form is dirty
15. `src/pages/Home.tsx:190-196` — ViewToggle: remove `hidden sm:inline` on label (always show text), `py-2` → `py-3`
16. `src/components/Layout.tsx:26` — `short: 'Family'` → `short: 'Summary'` (duplicate bottom-nav label)
17. `src/index.css` — add `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`
18. `src/pages/AddItem.tsx:160` — add `aria-live="polite"` to the identify status container
19. `src/index.css:71` — remove `border-radius: 8px` from `*:focus-visible`
20. `src/index.css` — add `@media print` (hide nav/aside/buttons, drop shadows, force white bg) to make Summary's "Print this binder" produce a clean document
21. `index.html` — load Inter (or delete it from `--font-sans` at `index.css:19`)
22. `src/components/ui.tsx:103,140` — replace `text-[#8a5e12]` with a new `--color-amber-deep` token; move Family avatar colors (`Family.tsx:21`) to tokens

## 5. Top 5 Design Actions

1. **Raise the small-text floor and fix clay-at-small-sizes** (fixes 1–6): two token edits plus four class swaps eliminate every text-contrast/size failure for the audience that most needs it.
2. **Make forms fail loudly, never silently** (fixes 12–13 plus AddItem validation): the Emergency/Family silent `return` and the fabricated "we looked at your photo" flow are the two moments most likely to destroy a senior's trust in the product.
3. **Protect the story** (fix 14): dirty-state confirmation on AddItem's two Cancel paths — losing a hand-typed heirloom story is the worst possible outcome of the highest-stakes flow.
4. **Make tappability visible at rest** (fixes 7, 9, 15): darken chevrons, fix the fallback-icon tint, and un-hide the ViewToggle labels — the touch experience must not depend on hover reveals or tooltips.
5. **Ship the print stylesheet** (fix 20): for 65–85-year-olds, a clean printed binder is not an edge case, it's the deliverable — the button already exists; the CSS doesn't.
