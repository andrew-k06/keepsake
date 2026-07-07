# Keepsake — Fresh Product/UX Audit (July 2026 build)

*Six-agent audit & competitive session, July 2026. See 00-synthesis.md.*

Audited every page, component, lib, and the seed/store from scratch; walked the first-timer and adult-child-gift journeys mentally; only then checked the prior review docs. Everything in §2 is either new or an incompleteness the new waves introduced; items the prior reviews already fixed (truth sweep, photo bomb, print styles, valuation history, guide skeleton) are confirmed done and credited in §1.

---

## 1. What's strong now

- **The truth discipline actually holds.** Insurance is owner-attested everywhere including print (`PrintInventory.tsx` "Yes (owner-stated)"), wishes are never bequests, simulated things carry `DemoTag`, the no-photo path never says "looking at your photo", and the appraisal router argues against Keepsake's own take-rate ("you likely don't need to pay anyone for this one", `lib/appraise.ts:47-53`). This is rare and it's the product's moat.
- **The Getting Ready layer is genuinely well-architected.** Derived completion (`lib/prepare.ts:219-222`), skip logic that changes chapter and avoids heavy-after-heavy, one-time celebrations with a pre-celebration guard against first-visit barrages, no percentages/streaks. The together-mode scripts ("you're the asker and the scribe; Margaret makes every decision") are the best copy in the app.
- **Offer Check is a real product.** Four-way verdict including the overpay-scam case, the face-saving doorstep script, and one-tap "Mention it to Sarah" that writes an audit line. This demos brilliantly.
- **The printed binder is a designed document**: cover → TOC with dotted leaders → one sheet per person → still-being-decided → emergency guide → "if a page disagrees with the binder, the binder is newer" → wishes-not-a-will running footer on every page. The memo's state-law honesty is exactly right.
- **Value provenance is a single seam** (`lib/value.ts` precedence; inventory prints "(owner estimate, 2026)") and the kind-decline trend pattern is faithfully encoded.
- **Failure states are humane**: save errors surface and never vanish, soft-delete with 30-day restore, dirty-form confirms, inline `aria-live` errors, warm 404/missing-item pages.
- **Voice capture behaves correctly**: appends rather than erases, live large-type transcript, plain fallback copy when unsupported.
- **Margaret's seed is excellent demo material** — "one broke in 1974 and we never replaced it, on purpose" and David's watch memory are the emotional proof; the seed places her mid-path so the demo shows chapter 4 next.

---

## 2. New findings (severity-ranked)

### High

**H1. "I'll add a photo later" is a promise the app can't keep — and items are otherwise uneditable.**
`AddItem.tsx` offers "I'll add a photo later," but `ItemDetail.tsx` has no add/change-photo affordance anywhere. Same for the rest of the item: only the story is editable; name, category, room, acquired, condition, serial can never be corrected. Since AddItem never captures acquired/condition/serial, every user-created item shows a Facts grid of four permanent "—". Documents: "No documents attached yet" with no way to ever attach one. Accepting a wrong AI category also becomes permanent — which silently mis-routes appraisals forever (`lib/appraise.ts:13`). This is the largest dead-end cluster in the core object of the app.

**H2. Offer Check dead end: check a not-in-binder item without a value and nothing happens.**
"It isn't in my binder" + name + offer, but no "your sense of its value": `subject` is truthy so the button enables, but `marketSnapshot` returns null without a valuation, so no verdict card ever renders — a silent no-op click, the exact failure class the app's own `InlineError` doc-comment forbids. Worse, `completeStep('offer-check-try')` and the audit line still fire, crediting a check that never showed a result.

**H3. The demo binder is unrecoverable, and "See an example — Margaret's" lies after first use.**
Welcome's second door just navigates to `/binder`. Once anyone taps "Start your own binder," that button forever opens *their* binder under an "example" label. `resetDemo` exists in the store but no UI calls it; the README's reset instructions are wrong. A live demo that goes off-script cannot get Margaret back without DevTools. Directly hurts demo-readiness.

**H4. Rooms cannot be created or renamed anywhere — but the paid tier advertises "Unlimited items and rooms."**
`Plan.tsx:62` promises it; no page has room management. A fresh binder gets only Living Room + Bedroom — no Kitchen, no Safe, no Garage. For an inventory app organized *by room*, this both breaks the real-user journey and violates the app's no-untrue-claims rule.

**H5. Mobile navigation orphans Plan and (eventually) the Guide.**
Plan is reachable only via the desktop sidebar footer; on mobile the paths are the starter-limit wall and the TrendCard upsell — a monetization page with no nav route on the platform seniors actually use. The Guide is `desktopOnly` and its one mobile door — Home's next-step card — disappears when `coreDone`, stranding celebrations, together mode, and the ongoing chapter on phones/iPads-in-portrait.

### Medium

**M1. The guide's return loop is one-third wired.** `NextStepCard` passes `fromGuide` router state, but only AddItem, Family, and Emergency render `GuideReturnPill`. Steps routed to `/binder` (wish-three), `/summary` (share-summary), and `/check` (offer-check-try) land with no pill and no scaffolding — for wish-three a senior lands on Home with zero indication they should open an item and scroll to the wish dropdown. And AddItem navigates to `/item/:id` on save, dropping the state, so the path back is lost exactly at the moment of success.

**M2. Copy still promises "export" that doesn't exist.** "Your binder — every photo and story — can always be printed **or exported**, on any plan" (`Plan.tsx`, also README). There is no export of any kind. Small, but it's precisely the class of untruth the app defines itself against — and data export is table stakes for the trust story.

**M3. Two competing "trusted contact" concepts on the same page.** The per-person role dropdown offers "Trusted contact (emergency access)" independent of the actual `executorAccess` designation card below. You can mark David's *role* as Trusted contact while Sarah is the *designated* trusted contact; nothing reconciles them. For the audience most sensitive to "who can get in," this is a real confusion and a coercion-surface.

**M4. TrendCard points at a section that often isn't there.** "…before selling or insuring, see the appraisal recommendation below" — but the appraisal block renders only when `appraisalStatus === 'none'`. Four of Margaret's six items dangle this pointer in the demo itself.

**M5. Attested steps complete on intent, not act.** "Share by email" marks `share-summary` done before the mailto even opens; PrintBinder marks it on button-press, print dialog cancellable. The guide's own rule is "the guide observes work, it never asks users to claim what the app can verify" — here it credits unverified work.

**M6. The gift flow doesn't deliver its stated together-mode.** `Start.tsx` comments the gifted binder opens "in together mode, with the script in hand," but nothing sets `togetherWithId` — Sarah lands on the Guide with "Just me" selected. One line in `startFresh`/`startPath` fixes the intended magic moment.

**M7. Derived-step regexes are demo-fit, not user-fit.** `note-first-call` matches `/…|attorney|call sarah|call my/i` — a hardcoded demo name in product logic, and a real user adding only "My attorney" gets "Who to call first" falsely credited. Also `Start.tsx`'s `isDemo = ownerName === 'Margaret'` means a real user named Margaret gets her binder replaced without the confirm dialog.

**M8. Seed images are remote Unsplash URLs** — the demo binder (and its *printed* binder) breaks offline or on flaky conference Wi-Fi, and sits oddly beside "Nothing is sent anywhere". Bundling six local images removes a live-demo risk.

**M9. Fresh-binder Appraisals page is a dead room.** Three empty sections + "why this matters" and no way to start an appraisal from here (appraisals begin only on ItemDetail).

**M10. No search, no all-items view.** Home shows 4–6 recent; everything else requires knowing the room. Fine at 6 seed items; fails at the 40+ items the product hopes for, and "Wishes decided 3 of 6" isn't clickable to see *which* three are undecided anywhere except the Summary page.

### Low

- Starter limit has no approach warning — first notice is the hard wall at 15.
- Audit dates omit the year and cap display at 8 with no "see more" despite storing 200.
- Seed audit wording ("You decided…") doesn't match live wording ("You changed who…").
- Cards show `bestAmount` midpoint as a precise single figure with no source label, slightly diluting "a range, never a number".
- Mobile short label "Offers" for Before You Sell reads like deals, not scam-shield.
- Plan has no downgrade path once "activated" in preview.
- ItemDetail doesn't cross-link to Offer Check even though "What it sells for today" is exactly where a sell impulse forms.

---

## 3. What to build next (10, ordered)

1. **Item editing + add/change photo** — closes the app's biggest dead-end cluster (H1). **(M)**
2. **Fix Offer Check's no-value path** — require a rough value or return an honest "we can't judge this without one" card. **(S)**
3. **Separate the example from the user's binder** — read-only example mode or a visible "Restore the example binder". **(S)**
4. **Complete the guide loop** — persist the active step in `preparedness` instead of router state; pill on Summary/OfferCheck/Home; post-save return path on ItemDetail. **(S)**
5. **Mobile reachability for Plan and Guide.** **(S)**
6. **Room management** (add/rename). **(S)**
7. **Data export** — "Download everything (JSON)". **(S)**
8. **Merge the two trusted-contact concepts.** **(S)**
9. **Search + "All items" view** with undecided-wishes and no-story filters. **(M)**
10. **Documents & multi-photo capture** — store the AI's follow-up shots as documents. **(M/L)**

## 4. Top 5 actions

1. **Ship item editing + photo-later** — the core object must be correctable before any real user touches it.
2. **Fix the Offer Check silent no-op** — a one-state bug in the feature you'll demo most.
3. **Make the demo recoverable and honest** (+ bundle seed images locally).
4. **Finish the guide return loop + mobile Guide/Plan access.**
5. **Run a small truth-sweep on the new features' copy** — export claim, unlimited-rooms claim, TrendCard's dangling pointer, gift-flow together-mode, intent-vs-act step completion.
