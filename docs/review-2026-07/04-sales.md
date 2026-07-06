# Keepsake — Sales Strategy Report

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

*Grounded in the actual prototype: Welcome → "Margaret's Binder" (Home), AddItem with simulated AI auto-fill + value estimate, ItemDetail (story, beneficiary picker, "Get it appraised"/insurance), Appraisals (photo-triage vs. in-person certified appraiser routing), Family (view/edit/executor roles, invite flow), Emergency ("fireproof box… key taped under the jewelry drawer"), and Summary (printable "For My Family" grouped by inheritor).*

---

## 1. ICP & BUYER MAP

**Ranked segments (by revenue accessibility, not sentiment):**

| Rank | Segment | Role | Why this rank |
|---|---|---|---|
| 1 | **Adult children (45–60)** | Economic buyer, often not the user | They have the money, the anxiety, and the digital purchasing habit. They buy *for* Mom the way they buy Life360 and medical-alert plans. The Family page's invite flow is literally the wedge: the child buys, invites the parent — or vice versa. |
| 2 | **The senior (65–80, downsizing/estate-planning)** | Primary user, sometimes buyer | High motivation ("a gift to my family" — the app's exact framing), but slower to purchase online, distrusts subscriptions, price-sensitive on intangibles. Best converted via one-time purchase or gifted by segment 1. |
| 3 | **Estate attorneys & financial planners** | B2B2C channel, not buyer of record | An attorney like "James Porter" in the seed data is the natural referrer — every will meeting surfaces the "who gets the ring?" problem. They won't pay much themselves, but they deliver warm, high-trust leads at near-zero CAC. |
| 4 | **Senior living communities / move managers** | Bulk channel | Downsizing is *the* trigger event and communities orchestrate it. Slow enterprise-ish sales cycle, but one contract = hundreds of users. |
| 5 | **Insurers** | Monetization partner, not a channel | Scheduled-personal-property carriers want documented, appraised items — the Appraisals page output is underwriting-ready. Referral revenue, not distribution. |

**Deep dive — top segment (adult children, 45–60):**

- **Trigger events, in order of urgency:** (1) death of one parent → surviving parent starts "getting affairs in order" (note: Margaret is a widow in the seed data — the demo already tells this story); (2) parent downsizing/moving to senior living; (3) new or updated will; (4) a parent's health scare; (5) a sibling dispute they witnessed in another family; (6) homeowner's insurance renewal revealing unscheduled valuables.
- **Objections:** "Mom won't use an app" (answer: senior-first UI, big type, and the child can do the data entry via collaborator role); "Is this safe? It's her will-adjacent data" (privacy reassurance already on the Family page — lead with it); "We can just use a spreadsheet/photos" (spreadsheets don't capture stories, values, or beneficiary assignments, and nobody finds them later); "Feels morbid to bring up" (reframe as the app does: a gift, not a death plan).
- **Willingness to pay:** benchmarked against Everplans (~$75/yr), Trust & Will ($199–$499 one-time), a single professional appraisal ($150–$400/item). $99–$149 one-time reads as trivially cheap insurance against a five-figure family fight. WTP spikes 2–4x within 90 days of a trigger event.

---

## 2. PRICING & PACKAGING

**Model: freemium + one-time "Binder" purchase + take-rate services. Subscription only for the family plan, billed to the adult child — never to the senior.**

The senior-subscription distrust problem is real (fixed incomes, "another monthly bill," fear of forgotten auto-renewals). Solve it structurally, not with copy: the senior-facing offer is **buy-once, own forever** — which also matches the product metaphor (you buy a binder once; you don't rent it).

| Tier | Price | What's in it | Rationale |
|---|---|---|---|
| **Free — Starter Binder** | $0 | Up to 15 items, 1 room, stories, 1 family invite, Emergency guide | Emergency guide free is the trust hook; 15 items is enough to feel value, not enough to finish a house |
| **Keepsake Binder (one-time)** | **$129** one-time (launch at $99) | Unlimited items/rooms, AI identification + value estimates, all family roles, printable "For My Family" summary, PDF export | Anchored between Trust & Will and a single appraisal; "own it forever, no monthly fees" is the headline for the 65–80 buyer |
| **Family Plan (subscription, billed to adult child)** | **$79/yr** | Everything above + market-trend tracking per item ("is Mom's Omega trending up?"), value-change alerts, multi-binder (both parents, in-laws), priority appraisal booking | Trends/alerts are genuinely ongoing services — the only honest subscription surface. The child pays; the parent never sees a bill |
| **Appraisal marketplace** | **15–20% take rate** | Photo-triage review ($29–$49/item, keep ~$15) and in-person certified appraisals ($200–$350, keep ~$40–$60) | The Appraisals page already routes photo-review vs. in-person — this is the built-in transaction engine |
| **Insurance referrals** | **$25–$100/bound policy** | "Insure this item" hands a documented, appraised schedule to a partner carrier | Zero senior-facing cost; carriers pay for pre-underwritten leads |

**Blended target:** free → $129 binder conversion at 8–12% post-trigger; attach 1.5 appraisals/paying binder in year one. LTV without subscription: ~$180–$220. Family Plan is upside, not the base case.

---

## 3. GAP-SELLING PLAYBOOK

### Segment 1 — Adult children (45–60)

- **Current state:** Mom's house is full of things with invisible values and invisible promises. The will says "personal property to be divided equally" — the ring, the Omega, the china aren't named anywhere. You *think* Mom promised the ring to your sister, but your brother remembers differently.
- **Future-state pain (unaddressed):** Mom passes. Nobody knows the ring is worth $8,500 or that the diamond came from her grandmother. The estate-sale company prices the Wedgwood at $40. Siblings stop speaking over a watch. The stories die with her — the appraised value can be recovered; the "why" never can.
- **Future state (with Keepsake):** Every item photographed, valued, storied, and assigned in Mom's own words — plus a printable summary the executor and attorney can act on in one afternoon.
- **Discovery questions (rep or landing page):**
  - "If something happened to your mom tomorrow, could you name three things in her house worth over $1,000 — and who she wanted to have them?"
  - "Has anyone in your family ever fallen out over who got what?"
  - "Does her will name the individual items, or just say 'divide equally'?"
  - "Who would know where her will, deed, and insurance papers even are?" (the Emergency page is the demo answer)

### Segment 2 — The senior (65–80)

- **Current state:** "My kids don't know what half of this is worth, and I keep meaning to write it down." The stories live only in her head; the appraisal from 1998 is in a drawer somewhere.
- **Future-state pain:** Your family guesses. Things you treasured get sold for pennies or fought over. The story about the eleven dinner plates — and why you never replaced the twelfth — is gone forever.
- **Future state:** "The most loving thing you can leave isn't the ring — it's knowing why it mattered and who it was always meant for." Position as a legacy gift and an act of care, never as death prep.
- **Discovery questions:**
  - "Which thing in your home would your children argue over if you weren't here to explain?"
  - "Have you ever told anyone the story behind your wedding china? Is it written down anywhere?"
  - "If your family needed your papers in an emergency, would they know where to look?"
  - "When did you last have your jewelry appraised? Would your insurance actually cover it today?"

---

## 4. CHANNEL STRATEGY — top 3, each with a first play

1. **Estate attorneys & financial planners (highest trust, lowest CAC).**
   *First play — "Estate Attorney Co-Marketing Kit":* a branded one-pager ("Before we finalize your will, complete your Keepsake binder"), a client-gift code (attorney gifts the $129 binder, we discount to $79 wholesale), and a printable "For My Family" sample that plugs directly into their probate workflow. Pilot with 10 solo/small-firm estate attorneys in one metro; success metric = 5 activated binders per attorney per quarter. The seed data already models this relationship ("My attorney: James Porter — he has the original will").

2. **Adult children via digital, trigger-event targeting (scalable demand engine).**
   *First play — "The Talk" landing page + content wedge:* SEO/social content targeting "how to talk to aging parents about their stuff," "estate sale horror stories," "who gets grandma's ring." CTA: a free 5-minute "Family Inventory Risk Quiz" (the discovery questions above, gamified) ending in the free Starter Binder — set up *by the child*, gifted to the parent with a pre-written warm invitation. Meta/Facebook targeting: 45–60, interests in caregiving, recently engaged with senior-living or estate content.

3. **Senior living communities & senior move managers (bulk downsizing trigger).**
   *First play — "Workshop-in-a-Box":* a 60-minute "Tell the Story of Your Things" session kit for community activity directors — slide deck, printed worksheets (one item, one photo, one story), and free binders for attendees; Keepsake pays a $20/activation bounty or sells site licenses at $15/resident/yr. Partner first with NASMM (senior move managers) members, who bill $60–$100/hr and can resell Keepsake setup as a service line. One community pilot → case study → association channel.

---

## 5. TOP 5 SALES ACTIONS TO BE REVENUE-READY (ordered)

1. **Ship the one-time $129 purchase with real accounts/payments.** The prototype is localStorage-only — there is literally nothing to buy. Stripe checkout + cloud persistence + the free-tier item cap is the minimum revenue surface. Everything else queues behind this.
2. **Build the "gift/buy-for-a-parent" flow.** The economic buyer (adult child) and the user (parent) are different people; today the Family invite flow assumes the senior starts. Add a child-initiated path: child pays, sets up the binder, sends a warm invite. This single flow unlocks segment 1.
3. **Turn the "For My Family" printable summary into the shareable sales asset.** Watermarked sample PDF ("Margaret's Binder") becomes the attorney kit centerpiece, the landing-page lead magnet, and the demo close. It's the artifact that makes the value tangible to every segment at once.
4. **Sign 3–5 pilot estate attorneys and one appraiser partner in a single metro.** Replace the Appraisals page's `alert('…finds certified appraisers near you')` stub with one real regional partner (even manually brokered) to validate the 15–20% take rate and prove the B2B2C referral loop before building marketplace tech.
5. **Instrument trigger-event funnels and run one paid test to adult children.** $2–3k Meta spend against the "The Talk" landing page; measure quiz completion → free binder → parent activation → paid conversion. This yields the CAC/LTV numbers needed to decide whether digital or the attorney channel leads the go-to-market.

**Key risk:** the product's warmth is aimed at the senior, but the money is with the adult child — every revenue-readiness action above assumes dual-audience positioning ("a gift she'll love; peace of mind you'll pay for"). If marketing speaks only to Margaret, the funnel starves.
