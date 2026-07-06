# Keepsake — Seven-Lens Review: Synthesis & Readiness Plan

*July 2026. Seven parallel reviews: security, architecture, compliance, sales, marketing, UI design, senior usability/product. Full reports in this directory (01–07). This file is the consolidated, prioritized plan.*

---

## Overall verdict

The prototype's bones are genuinely good — every lens said so independently. The senior-first UI foundation (18px body, big targets, labels above inputs, no gestures, no vanishing toasts), the warm copy voice ("when you're ready"), and Margaret's seed stories are real assets to keep. The two things standing between this and "ready":

1. **The truthfulness problem (the #1 cross-lens theme).** Five different lenses independently flagged the same class of defect: *the app asserts things that are not true.* For a scam-wary 75-year-old, one caught lie ends the relationship — and today the app contains at least ten:
   - "Look into insurance" flips a green **Insured** badge with no policy (`ItemDetail.tsx:181-193`) — also FTC §5 exposure
   - "This will pass to {heir}" — declarative testamentary language with zero legal force (`ItemDetail.tsx:142`)
   - "Skip photo" triggers "Looking at your photo…" with no photo, then fabricates an identification (`AddItem.tsx:70-72`)
   - "Send invitation" sends nothing; "Invitation sent" pill appears (`Family.tsx:105`)
   - "You'll always be able to see who has looked at your binder" — no audit log exists (`Family.tsx:124-128`)
   - "Only the people you invite can **ever** see your binder" — data is plaintext localStorage on a shared origin (`Welcome.tsx:81`)
   - "Take a tour" and "Start your own binder" both open Margaret's demo binder (`Welcome.tsx:42-47`)
   - "Certified appraiser" — a credential that doesn't exist for personal property (`Appraisals.tsx:20-22`)
   - "Makes sure your children never sell for a fraction of its worth" — an outcome warranty (`Appraisals.tsx:60-63`)
   - "Share it automatically with your executor" — a death-trigger promise with no RUFADAA machinery behind it (`Emergency.tsx:84-85`)

2. **The photo/storage bomb (the #1 technical defect).** Security and architecture both found it: one real phone photo (3–8 MB, +33% as base64) exceeds the ~5 MB localStorage quota; `setItem` has no try/catch and there's no error boundary, so the flagship flow — photograph your valuables — silently stops persisting or white-screens after 1–2 real photos. An heirloom record the user believes is saved vanishes on reload.

**The strategic frame that emerged:** the dataset is a *burglary target map* (photos + values + "The Safe" + "key taped under the jewelry drawer" + who inherits what) held by the highest-fraud-target demographic — so security, compliance, and trust-marketing are the same workstream, not three. And the money is with the **adult child (45–60)**, not the senior: sales and marketing converged on a "gift it to Mom" motion, one-time $129 purchase for the senior (never a subscription), $79/yr family plan billed to the child, plus appraisal take-rate and flat-fee insurance referrals.

---

## Cross-lens convergences (the priority signal)

Findings multiple lenses hit independently — fix these first:

| Theme | Flagged by | Core fix |
|---|---|---|
| App asserts falsehoods (insurance badge, fake AI run, dead invite, unbacked privacy promises) | Security, Compliance, Marketing, UI, Usability | One "truth sweep" PR: no state the app can't verify, no promise the code can't keep |
| Photos + localStorage quota = silent data loss | Security, Architecture | Client-side compression (canvas → ~2048px JPEG), IndexedDB, try/catch + visible error, error boundary |
| Printed binder is the product's key artifact, and printing is broken | UI, Usability, Marketing, Sales | `@media print` stylesheet; story-first layout; values demoted to appendix; disclaimer footer on every page |
| Per-heir dollar tallies = sibling-fairness scoreboard | Marketing, Usability, Compliance | Lead with stories; "hide values" print option; "Not yet decided" → conversation prompt |
| Executor role must be dormant-until-verified | Security, Compliance, Usability, Marketing | RUFADAA online-tool designation; death-certificate/letters verification; multi-party confirmation + delay; read-only access; "automatically" → "after we verify" |
| Free-text `category` breaks appraisal triage | Architecture, Usability | Category enum + curated picker; triage logic out of the page, with a visible per-item "why" |
| Value scalars can't support trends | Architecture, Usability | `valuations` history table (source, amount, confidence, date) — trends become a query |
| Audit log makes three promises true at once | Security, Compliance, Usability | Immutable log of views/beneficiary/role changes + trusted-contact notifications (anti-coercion) |
| Silent form failures (`if (!name) return`) | UI, Usability | Inline errors + `aria-live`; never a no-op button |
| "When I'm gone" morbidity drift | Marketing, Usability | Reframe to competence: "so your family always knows what to do" |
| Seed data coaches unsafe entries ("key taped under the jewelry drawer") | Security, Compliance | Revise seed copy before any public demo |

---

## The two requested features (designed)

### Value trends — "is this item trending up or down"
- **Data:** replace `estValue`/`appraisedValue` scalars with a `valuations` history (`source: owner|ai|photo_appraisal|in_person_appraisal|market`, amount, confidence, date). Comps from eBay sold listings / auction records.
- **Presentation:** always a **sold-price range with receipts** ("Based on 14 completed sales in the last 12 months; a set like yours sold for $240 in March"), never a bare number. Words, not stock-ticker charts: "gently down," "holding steady," "up quite a bit" in the app's clay/sage palette.
- **The kind-decline pattern** (truth + dignity + agency): lead with today's fact, blame the market not their taste ("fewer people set formal tables now"), immediately separate market price from family meaning (the story is right there on the same card), then offer agency ("want me to watch it?").
- **Compliance guardrails:** informational ranges, never "appraisal" (USPAP term of art), never investment framing, AI-labeled. FTC treats elder-targeted deception as aggravated.

### Appraisal routing — when is AI enough?
Four explainable tiers replacing the hardcoded category list:
1. **AI estimate only** — high comp confidence, < $500, low-stakes category → "a paid appraisal would cost more than it adds"
2. **Photo review (~$30)** — $500–$5,000, or low AI confidence, or user disputes the range
3. **In-person accredited (USPAP/ISA/ASA)** — > $5,000, or authenticity-by-touch categories (gems, coins, watches, art), or any insurance/estate-tax/distribution purpose
4. **Escalate regardless of value** — active buyer, contested item, museum-grade provenance
Always show the **why** and the **cost-benefit** — and let the AI say "you don't need to pay anyone for this one." That sentence against Keepsake's own take-rate is what earns the trust. Related: the **scam-shield** button ("Someone wants to buy something") — instant comps verdict + a face-saving script for the door ("My family keeps a record of everything, so I never decide on the spot").

---

## Roadmap

### Wave 0 — Truth & polish sweep (prototype-level, days)
1. **Truth sweep:** kill the insurance auto-badge ("Learn about insuring this," user-attested "You marked this insured"), no-photo AI run → straight to blank details, remove/soften unbacked privacy and executor promises, differentiate the three Welcome CTAs, "certified" → "accredited," delete outcome warranties, "This will pass to" → "Your wish: this goes to… a wish, not a will."
2. **Photo bomb defused:** canvas compression, IndexedDB, quota try/catch with visible error, error boundary, `crypto.randomUUID()`.
3. **UI mechanical fixes** (full 22-item list in 06): text tokens 13/15px → 14/16px, clay-dark for small text, chevrons to ink-soft, placeholder contrast, ≥44px tap targets on links, dedupe "Family" nav labels, `prefers-reduced-motion`, `aria-live` on identify.
4. **Form honesty:** inline validation, dirty-state confirm on AddItem Cancel (protect the typed story), edit/delete for emergency notes, editable stories, soft-delete with 30-day undo.
5. **Print stylesheet** + story-first summary + hide-values option + printed disclaimer footer.
6. **Copy sweep:** de-morbid ("when I'm gone" → competence framing), trim the "gentle" tic, "Recently kept" → "Recently added," revise seed's key-location coaching.

### Wave 1 — Foundation (the real product substrate)
- Async `BinderRepository` seam (TanStack Query + IndexedDB outbox) behind the existing `useStore` facade; business rules out of pages.
- Data model migration: memberships (access) split from people (beneficiaries), `valuations` history, photos table, timestamps, `binder_id`, category enum.
- Backend: Supabase/Postgres + RLS mapping the role model; magic-link/OTP auth (passkeys as they mature); local-binder import on first login; EXIF stripping client-side; field-level encryption for emergency notes/locations/values; immutable audit log + trusted-contact notifications.
- Stripe checkout: free tier (15 items) / $129 one-time binder / $79-yr family plan billed to the adult child; child-initiated **gift flow**.

### Wave 2 — The AI bridge (the differentiators)
- **Voice-first story capture** (flagship): press-and-talk, live large-type transcription, their words lightly cleaned, follow-up questions one at a time, raw audio kept — Grandma's voice is the heirloom.
- **Explainable photo ID** (Claude vision, server-side, structured output): evidence sentence, word-confidence, disambiguation photo requests, equal-weight "No, let me tell you what it is."
- **Value trends + scam shield** as designed above.
- **Appraisal routing engine** with per-item why and cost-benefit.

### Wave 3 — Revenue & network
- Accredited appraiser marketplace (credential verification, E&O minimums, item-scoped access — no address pre-booking, no binder totals ever, in-app messaging only; `appraisedValue` only from uploaded reports).
- Insurance referrals **after** the state-licensing counsel memo (flat non-contingent fee or licensed-partner handoff).
- Executor activation protocol (RUFADAA designation, verified release, multi-party confirmation, read-only).
- Tangible-personal-property **memorandum export** (~30 UPC states) — "give this to the attorney who holds your will."
- Family collaboration (heirs add memories, respectful item requests), assisted fair-market selling, estate-professional export.

### Parallel tracks (not gated on code)
- **Legal:** counsel-drafted ToS + privacy policy (not-a-law-firm, RUFADAA consent, AI disclaimers, CCPA notice); insurance-licensing memo; appraiser credentialing program; WCAG 2.1 AA audit.
- **GTM:** trust kit (real phone number, physical address, founder-signed plain-language privacy promise, no dark patterns, paper-fallback promise); positioning locked as "the story of your things, preserved as a gift"; 3–5 pilot estate attorneys + one appraiser partner in one metro; "The Talk" landing page + $2–3k Meta test to adult children; Margaret-grade story content series; senior-center workshop-in-a-box.
- **Day-90 gate:** 1,000 active binders, ≥40% with a family invite, ≥25% gift activation, one institutional partner, 10 named testimonial families.

---

## Positioning (locked)

> **Keepsake — every treasure in your home has a story. Save both, for the people you love.**

Pillars: *The story is the treasure* / *No surprises, no squabbles* / *Yours, private, and in plain English.* The enemy is procrastination, so the CTA is never "organize your estate" — it's "save one story today." Buyer: the adult child ("a gift she'll love; peace of mind you'll pay for"). The senior never sees a subscription bill.
