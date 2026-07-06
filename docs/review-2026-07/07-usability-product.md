# Keepsake — Usability & Product Review (Senior-Demographic Lens)

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

Reviewed end-to-end as a 75-year-old with moderate tech comfort. Base type is 18px with large touch targets (`src/index.css:61`, `src/components/ui.tsx:34-44`) — a genuinely strong foundation. Findings ordered by severity within each journey. **Severity scale: P0 = will cause harm or task abandonment; P1 = will cause confusion/errors; P2 = friction; P3 = polish.**

---

## 1. Usability Findings by Journey

### Journey 1: First open (Welcome → Binder)

- **P1 — Three CTAs, one destination, zero differentiation.** "Open Margaret's Binder," "Take a tour," and "Start your own binder" all execute `navigate('/binder')` (`src/pages/Welcome.tsx:42-47, 84-90`). A senior who clicks "Start your own binder" lands in a stranger's (Margaret's) fully populated binder with $25K of someone else's heirlooms. This is disorienting at the exact moment trust is being formed — "whose things are these? Did I break something?" There is no tour, so "Take a tour" is a broken promise on the very first screen.
- **P1 — No onboarding for the empty state.** `resetDemo()` exists (`src/store.tsx:68`) but nothing in the UI invokes it. A real first-run experience (name, one guided first item) doesn't exist; the demo path is the only path.
- **P2 — Privacy claim before it's earned.** "Only the people you invite can ever see your binder" (`Welcome.tsx:81`) is good reassurance copy, but the app never explains *where* the data lives. Seniors ask "is this on the internet?" — one sentence ("It stays on this device until you choose to share") would answer their actual fear.
- **P3 — Decisions per screen: 5 tappable choices on Welcome.** Acceptable, but the duplicated CTAs add noise.

### Journey 2: Add an item (`/add`)

- **P0 — "Cancel" destroys work without warning, twice.** The top back-chevron labeled "Cancel" calls `navigate(-1)` (`src/pages/AddItem.tsx:107-113`) and the details-step "Cancel" goes straight to `/binder` (`AddItem.tsx:257`) — either one silently discards the photo, story, and every field. Seniors mis-tap and lose a 10-minute typed story with no confirmation, no draft, no undo. This is the single most likely rage-quit moment in the app.
- **P1 — AI runs even with no photo.** "I'll add a photo later" calls `runIdentify()` (`AddItem.tsx:70-72`), so the app announces "Looking at your photo…" and confidently declares "We think this is a Diamond Ring" *when there is no photo*. To this audience that isn't a demo quirk — it's evidence the machine is making things up, and it poisons trust in every later AI claim.
- **P1 — The identify step has no "that's wrong" path.** The only button is "Looks good — continue" (`AddItem.tsx:188-190`). If the AI misidentifies Grandma's teapot as a "Vintage Wristwatch," the correction affordance is implicit (edit fields later). Seniors take on-screen assertions literally; they need an explicit, equal-weight "No, that's not it" button.
- **P1 — AI value appears with no provenance or uncertainty.** `setEstValue(String(pick.value))` (`AddItem.tsx:65`) drops a bare dollar figure into a field. Where did $4,500 come from? A senior will either treat it as gospel (dangerous — they'll quote it to a buyer) or as spooky ("how does it know what my ring costs?"). Values must always arrive as a *range with a stated source*.
- **P1 — Six decisions on the details screen** (name, category, value, room, story, beneficiary — `AddItem.tsx:196-263`). That's heavy for one screen; the story (the emotional heart) competes with logistics. Split: facts screen, then story screen, then "who gets it" screen — one decision per screen is the senior-proof pattern.
- **P1 — Voice is promised but absent.** "Tip: in the real app you can simply *speak*" (`AddItem.tsx:234-236`) sits under a `<textarea>`. For a generation that tells stories rather than types them, this is the product's core feature described as a footnote about a different app.
- **P2 — Silent input munging.** The value field strips non-digits on every keystroke (`AddItem.tsx:211`) — a user typing "$1,200" watches characters vanish with no explanation. Free-text Category (`AddItem.tsx:204`) invites "jewellery," "rings," "Jewelry & watches" — which then breaks appraisal triage (see Journey 5).
- **P2 — Empty name saves as "Untitled item"** (`AddItem.tsx:91`) with no prompt. Silent defaults create mystery objects the user won't recognize next week.
- **P3 — Step-dot label "Identify"** (`AddItem.tsx:282`) is system-speak. "We take a look" reads better to this audience.

### Journey 3: Tell its story / Item detail (`/item/:id`)

- **P0 — "Look into insurance" instantly marks the item Insured.** One tap flips `insured: true` and renders the green "Insured" badge (`src/pages/ItemDetail.tsx:181-193`, badge at `ui.tsx:185-192`). No policy exists. A senior now *believes the ring is insured*. If this prototype pattern ships, it manufactures a false safety record for the exact scenario (loss/theft) the app claims to protect against. Rename to "Learn about insuring this" and never set state from it.
- **P1 — Delete is `window.confirm` + permanent** (`ItemDetail.tsx:196-202`). No undo/trash; `deleteItem` (`src/store.tsx:62-63`) is unrecoverable. Soft-delete with "It's in your Recently removed for 30 days" is the kind pattern.
- **P1 — The story is not editable.** ItemDetail displays `item.story` beautifully (`ItemDetail.tsx:93-108`) but offers no way to add to or fix it after creation, even though `updateItem` exists. Stories are told in layers over weeks; the current design makes storytelling a one-shot form field.
- **P2 — "Get it appraised" teleports with no explanation.** Tapping it changes status and navigates to `/appraisals` (`ItemDetail.tsx:42-49`) without saying what was requested, who will see the photos, what it costs, or how long it takes — four questions a senior asks before any transaction.
- **P2 — Beneficiary changes save silently.** The `<select>` at `ItemDetail.tsx:124-137` commits instantly. The sage confirmation line is good, but there's no "saved ✓" feedback; seniors re-select to "make sure it took."
- **P3 — Dead-end error state:** `Item not found.` bare paragraph with no way home (`ItemDetail.tsx:35`; same at `Room.tsx:32`).

### Journey 4: Assign & invite family (`/family`)

- **P0 — The privacy promise is false in the UI.** The reassurance card says "You can change or remove anyone's access at any time, and you'll always be able to see who has looked at your binder" (`src/pages/Family.tsx:124-128`) — but there is **no** remove, no role editing, and no access log anywhere. `addPerson` is the only person mutation in the store (`store.tsx:64-65`). For a trust-first senior product, reassurance copy that the UI contradicts is worse than no copy.
- **P1 — Invite silently fails on empty name** (`Family.tsx:24 — if (!name) return`). Tap "Send invitation," nothing happens, no message.
- **P1 — "Send invitation" that sends nothing.** The person appears with an "Invitation sent" pill (`Family.tsx:105`) but no email goes anywhere and there's no explanation of what the invitee will receive or see. When Sarah never gets an email, Margaret concludes she did it wrong.
- **P2 — Role vocabulary is half-translated.** "View only / Help me add & edit / Executor" (`Family.tsx:77-81`) is good plain language, but "Executor (access in an emergency)" needs one more sentence: *when* does that access trigger, and who decides? That's the question every parent asks.
- **P3 — Email accepts anything** — no format check (`Family.tsx:68-75`).

### Journey 5: Appraisals (`/appraisals`)

- **P1 — Triage logic is fragile and invisible.** Routing is a hardcoded exact-match list `['Jewelry', 'Watches', 'Collectibles']` (`ItemDetail.tsx:44`), while the type comment promises jewelry/gems/watches/coins/firearms (`src/types.ts:8`). Because Category is free text (Journey 2), a user-typed "jewelry" (lowercase) or "Coins" routes to photo-review when it needs in-person. The user is also never told *why* their item was routed one way — the per-item reason is missing.
- **P2 — Native `alert()` for "Find a local appraiser"** (`Appraisals.tsx:45`) — jarring, and dead-ends the highest-intent action on the page.
- **P2 — "USPAP appraisal (2023)"** in documents (`src/data/seed.ts:90`) — pure industry jargon; say "Certified written appraisal (2023)."
- **P3 — "Complete (demo)"** button (`Appraisals.tsx:34`) visible in walkthroughs; fine for demo, flagging so it never leaks.

### Journey 6: Emergency guide (`/emergency`)

- **P1 — Notes can never be edited or deleted.** Store exposes only `addEmergency` (`store.tsx:66-67`); the page renders read-only cards (`src/pages/Emergency.tsx:63-75`). A typo in "where the will is" — the single most consequential text in the app — is permanent.
- **P1 — Silent no-op save** when label is empty (`Emergency.tsx:13 — if (!label) return`), same failure pattern as Family.
- **P2 — No guided prompts.** The blank "Add a note" form (`Emergency.tsx:39-61`) assumes the user knows what belongs here. The seed data (`seed.ts:34-57`) is actually a perfect checklist — papers, attorney, shut-offs — but real users get an empty text field. Turn the seed categories into suggested fill-in-the-blank cards.
- **P3 — Good copy:** "This isn't a legal will" disclaimer (`Emergency.tsx:81-86`) is exactly the right reassurance at the right moment. Keep it.

### Journey 7: Print summary (`/summary`)

- **P1 — "Print this binder" prints the app chrome.** `window.print()` (`src/pages/Summary.tsx:26-28`) with **no `@media print` styles anywhere** means the sidebar nav, buttons, and mobile bar print with it, and photos may lazy-load blank (`ItemVisual.tsx:33 loading="lazy"`). For seniors, the printed page *is* the product — this is the artifact they'll hand to their kids — and right now it comes out looking broken.
- **P2 — "Share with family" is another `alert()`** dead-end (`Summary.tsx:32`).
- **P2 — Value framing on the family-facing document.** The summary leads with per-heir dollar totals (`Summary.tsx:61`). Money-first ordering on the document children read invites comparison. Lead with items and stories; put values in a quiet appendix column.
- **P3 — "Not yet decided" section is a gentle, effective nudge** (`Summary.tsx:88-115`). Good pattern.

### Cross-journey / navigation

- **P1 — Two nav items labeled "Family" on mobile.** The bottom bar shows `short: 'Family'` for both `/family` and `/summary` (`src/components/Layout.tsx:23,26`). Rename summary to "The Book" or "Print."
- **P1 — No global search, high memory reliance.** To find the coin collection you must remember it's in "The Safe." No search box exists anywhere. Meanwhile the *Appraisals* nav item uses a magnifying-glass icon (`Layout.tsx:24`) — the universal "search" symbol — guaranteeing mis-taps.
- **P2 — No persistent help.** No "?" affordance, no phone number, no "ask a person" anywhere in the shell. Seniors need one always-visible escape hatch.
- **P2 — View toggle is a decision nobody asked for.** Tile/List segmented control (`Home.tsx:172-201`) adds cognitive load for near-zero benefit at 6 items. Cut it or bury it.
- **P3 — Warm typography, generous targets, consistent back-links with named destinations** ("Back to Living Room," `ItemDetail.tsx:53-59`) are all genuinely senior-friendly. The bones are good.

### Is the AI "understandable or spooky"?

Current verdict: **spooky in three ways, fixable with one design rule.** (1) It "looks at" photos that don't exist (`AddItem.tsx:70`); (2) it asserts identity and value with no reasoning shown (`AddItem.tsx:173-181`); (3) sparkle iconography (`Sparkles`, used at `AddItem.tsx:163` and even on the *story* card, `ItemDetail.tsx:100`) signals "magic," and this generation distrusts magic with their money. The rule: **the AI must always show its work in one plain sentence and always yield the last word to the user.** "I can see a gold band with a large clear stone — that's usually an engagement ring. Am I right?" is understandable. "✨ Here's what we found" is spooky.

---

## 2. The Core Mandate — Keepsake as the Seniors' AI Bridge

The framing that should drive everything: this generation owns the largest pool of un-catalogued personal property in history, tells stories fluently, and is the #1 target of valuables scams — and they are the demographic least served by AI tooling. Keepsake's job is to be the *trusted interpreter*: AI that talks like a careful neighbor, shows its sources, and takes their side in every transaction.

### (a) Voice-first story capture — "You talk, it writes"

- **Interaction:** On the story step, the primary control is one large button: **"Press and tell me about it"** (a microphone icon *plus the words* — icon alone is not enough). Live transcription scrolls in large type as they speak, so they see it's working. When they stop, the AI plays back a lightly cleaned version — *their* words, filler removed, never rewritten voice — and asks one question at a time, out loud if they prefer: "You mentioned Robert. Who was Robert?" "When did you say you got it?" Answers get woven in. Typed editing stays available but secondary.
- **Design rules:** never auto-punctuate meaning away; show "I wrote down what you said — read it over" before saving; a re-record button that *adds* rather than replaces ("Tell me more"). Keep the raw audio attached to the item — for the family, Grandma's *voice* telling the story is worth more than the transcript. This turns the current textarea tease (`AddItem.tsx:234-236`) into the product's signature feature.
- **Why it's the bridge:** it converts their strongest skill (oral storytelling) into the app's hardest input (structured text) with zero typing.

### (b) AI photo identification that explains itself

Replace "Here's what we found" (`AddItem.tsx:174-181`) with a **show-your-work card**:

> "I can see a **porcelain figurine of a boy with an umbrella**. The crown stamp on the base looks like a **Hummel mark** — makers put these marks underneath, like a signature. Could you take one more photo of the bottom so I can be sure?"

Rules: (1) state *what visual evidence* led to the guess; (2) confidence in words, never percentages — "I'm fairly sure" / "I'm guessing here"; (3) always request the disambiguating photo (base marks, hallmarks, labels) with a picture showing *where* to point the camera; (4) equal-weight buttons: **"That's right"** / **"No, let me tell you what it is"** — the correction path feeds back into voice capture ("Just say what it is"). (5) Never auto-fill silently: fields the AI filled get a small "I suggested this — tap to change" tint until the user confirms.

### (c) Value trends — honest comps, kindly delivered

- **Mechanics:** item name/photo → match against eBay sold listings, auction results, WorthPoint-class data → present a **sold-price range** (never a single number), a 10-year direction arrow, and 2–3 actual recent sales as receipts ("A set like yours sold for $240 in March in Ohio"). Always dated, always sourced: "Based on 14 completed sales in the last 12 months."
- **Presenting falling values kindly — the hard case.** Hummels, china sets, and brown furniture have collapsed; the number the user carries in their head is from 1988. The design pattern is **truth + dignity + agency**, in that order:
  1. **Never lead with the loss.** Lead with the fact: "Sets like this sell for $150–$300 today."
  2. **Name the market, not their judgment:** "Fewer people set formal tables now, so prices for fine china have come down quite a bit — that's true for nearly everyone's set, not just yours." The decline is the world's fault, not their taste.
  3. **Immediately separate the two kinds of worth:** "Its market price is not its value to your family — the story of the missing 1974 plate is exactly what makes it an heirloom." Keepsake is uniquely positioned to say this credibly, because the story sits right there on the same card.
  4. **Give agency, not just news:** "Would you like me to watch it and tell you if that changes?" and "Some families insure these for sentimental replacement instead."
  5. **Celebrate the risers without gloating:** "Your mid-century credenza is up — pieces like it sell for about 60% more than ten years ago" gets a warm, matter-of-fact card, same visual weight as decliners. No red/green stock-ticker aesthetics anywhere; use the app's clay/sage palette and words ("gently down," "holding steady," "up quite a bit").
- **Data model hooks:** add `valueHistory: {date, low, high, source}[]` and `marketTrend: 'up' | 'steady' | 'down' | 'unknown'` to `Item` (`src/types.ts:27-45`); render as a small sparkline on ItemDetail with the sentence, never the sentence-less chart. *(See architecture lens: model as a `valuations` history table.)*

### (d) Appraisal routing — when is AI enough?

Replace the hardcoded category list (`ItemDetail.tsx:44`) with explicit, explainable threshold logic:

| Tier | Trigger | Route | What the user sees |
|---|---|---|---|
| **AI estimate only** | Comp confidence high AND est. value < $500 AND not in high-stakes category | Instant range | "Items like this sell for $80–$140. A paid appraisal would likely cost more than it adds." |
| **Photo review (human, remote)** | $500–$5,000, OR AI confidence low, OR user disputes the AI range | Credentialed remote appraiser | "Worth a real expert's eyes — they can do it from photos for about $30." |
| **In-person certified** | est. > $5,000, OR category ∈ {jewelry/gems, watches, coins, firearms, fine art, signed pieces} where authenticity = touch/test, OR **any insurance, estate-tax, or equitable-distribution purpose**, OR AI detects possible high-value marks it can't verify | USPAP-qualified local appraiser | "For something like this, an accredited appraiser should see it in person. Here's why: real gemstones can't be verified from a photo." |
| **Escalate regardless of value** | User states intent to sell to a specific buyer, item is contested among heirs, or provenance suggests museum-grade | In-person + documented | Framed as protection, not upsell. |

Two rules make it senior-trustworthy: **always show the why** ("routed in person because coins must be weighed and graded by hand"), and **always show the cost-benefit** ("the appraisal costs ~$150; being wrong about this ring could cost $8,000"). The AI must be willing to say "you don't need to pay anyone for this one" — that sentence, spoken against Keepsake's own referral revenue, is what earns the trust that powers everything else.

### (e) Scam-shield — the protective second opinion

Seniors lose more to valuables scams (door-knocking "gold buyers," lowball estate pickers, fake online buyers) than to almost any other consumer fraud. Keepsake already holds the two things a scammer exploits: the item and the owner's uncertainty about its worth.

- **The feature:** a big, always-findable button — **"Someone wants to buy something"** — in main nav, not buried. Flow: which item (or quick-add) → "What are they offering?" → instant plain verdict against comps: *"$200 is well below what these actually sell for ($800–$1,100). I'd say no thank you. Offers far below value from someone who came to you are a common trick played on homeowners."*
- **Tone rules:** never "you almost got scammed" (shame guarantees they'll never use it again); always "buyers try this on everyone — good thing we checked." The AI is the deflection-excuse they can use socially: teach the script — *"My family keeps a record of everything, so I never decide on the spot."* Giving them a face-saving sentence to say at the door is itself the feature.
- **Escalation:** any check on an item >$1,000, or repeat offers from the same buyer, offers to notify a chosen family member ("Want me to let Sarah know someone's asking about the coins?") — opt-in, owner-controlled.
- **Pre-emptive shield:** when the user marks intent to sell anything, run the same check *before* they list it, and recommend the appraisal tier from (d) when the stakes warrant.

---

## 3. Feature Roadmap

### Wave 1 — Make current flows senior-proof (weeks, not months)

| Feature | User story | Effort |
|---|---|---|
| Draft protection on Add Item — confirm-before-discard + auto-saved draft (`AddItem.tsx:107,257`) | "If I tap the wrong thing mid-story, I don't lose ten minutes of memories." | S |
| Fix false-state buttons: "Look into insurance" no longer sets `insured` (`ItemDetail.tsx:181-188`); remove no-photo AI run (`AddItem.tsx:70-72`) | "The app never tells me something is true when it isn't." | S |
| Inline validation messages replacing silent no-ops (`Family.tsx:24`, `Emergency.tsx:13`) + friendly error pages (`ItemDetail.tsx:35`) | "When something doesn't work, the app tells me what to do next." | S |
| Edit/delete emergency notes + edit story on ItemDetail (store: add `updateEmergency`/`deleteEmergency`) | "I can fix a mistake in the note about where my will is." | S |
| Print stylesheet + designed printable binder (`Summary.tsx:26`, `index.css`) — stories first, values in appendix | "The book I print for my children looks like a keepsake, not a webpage." | M |
| Family access management: remove person, change role, honest privacy copy (`Family.tsx:124-128`) | "I can take back access, just like the app promised." | M |
| Navigation cleanup: dedupe mobile "Family" labels (`Layout.tsx:23,26`), swap the Appraisals magnifier icon, add global search, drop the tile/list toggle | "I can always find my things and tell the screens apart." | M |
| Guided emergency checklist (turn `seed.ts:34-57` categories into prompt cards) | "The app asks me the questions my kids will need answered." | S |
| Soft-delete with 30-day undo (`store.tsx:62-63`) | "Removing something by accident isn't forever." | M |
| First-run onboarding: real "start your own" path with clean state and one guided first item (`Welcome.tsx:42-47`) | "The first thing I see is my binder, not Margaret's." | M |

### Wave 2 — The AI bridge (the mandate)

| Feature | User story | Effort |
|---|---|---|
| Voice-first story capture with conversational follow-ups + attached audio | "I press one button, talk about Robert's watch, and it's written down — and my grandkids can hear my voice." | L |
| Explainable photo ID (evidence sentence, word-confidence, disambiguation photo requests, "No, let me tell you" path) — replaces `SUGGESTIONS` (`AddItem.tsx:17-26`) | "It tells me *why* it thinks my figurine is a Hummel, and asks before deciding." | L |
| Value ranges with sources + trend sentences (comps API, valuations history) with the kind-decline copy pattern | "I know what my china really sells for today, told to me gently, with proof." | L |
| Appraisal routing engine per the §2d threshold table, with per-item "why" and cost-benefit line | "The app tells me when a $150 appraiser is worth it — and when it isn't." | M |
| Scam-shield "Someone wants to buy something" check + face-saving script + opt-in family alert | "When a man at the door offers $200 for Robert's coins, I have a second opinion in my pocket." | M |
| Voice control of the whole app ("Show me the safe," "Read me the clock's story") | "I can use Keepsake the way I talk." | L |

### Wave 3 — Marketplace & network

| Feature | User story | Effort |
|---|---|---|
| Vetted appraiser marketplace (USPAP/ISA/ASA-verified, ratings, booked in-app, fixed transparent pricing) — replaces the `alert()` at `Appraisals.tsx:45` | "I book an accredited appraiser like booking a haircut, and I know the price first." | L |
| Insurance referral with real quotes per item / scheduled-property riders — the honest version of the current button | "I actually insure the ring, from inside the binder." | L |
| Assisted fair-market selling for items *no heir wants* (consignment/auction partners, AI-verified fair price, family visibility) | "When nobody wants the china, I sell it safely at a fair price instead of to a door-knocker." | L |
| Family collaboration: heirs add memories/photos to items, react to stories, request items respectfully ("I'd love to be considered for the clock") | "My children add their own memories of the clock while I'm here to read them." | M |
| Executor mode: verified release of the emergency guide + binder to the executor (delivers on `Emergency.tsx:83-85`; see security/compliance lenses for the activation protocol) | "If something happens, Sarah gets everything — and not a day sooner." | L |
| Estate-professional export (attorney/CPA-ready inventory with appraisal docs) | "My lawyer gets a clean inventory instead of a shoebox." | M |

---

## 4. Top 5 Product Actions (ordered)

1. **Eliminate every trust-breaking falsehood in one sweep** — the insurance button that fakes coverage (`ItemDetail.tsx:181-188`), AI "looking at" a nonexistent photo (`AddItem.tsx:70-72`), the "Send invitation" that sends nothing, the privacy promises with no UI behind them (`Family.tsx:124-128`), and "Take a tour" going nowhere (`Welcome.tsx:45`). For this demographic, one caught lie ends the relationship; nothing else on this list matters until the app never asserts what isn't true.
2. **Ship voice-first story capture as the flagship.** It's already promised in the UI (`AddItem.tsx:234-236`), it's the single feature that converts this generation's strength into the product's core asset, and it's the clearest embodiment of "AI bridge, not AI barrier." Lead the demo, marketing, and onboarding with it.
3. **Make the AI explain itself everywhere** — evidence sentence + word-based confidence + explicit correction path in photo ID, sourced ranges instead of bare numbers, per-item "why" on appraisal routing. One design rule, applied to every AI surface, is what moves the product from "spooky" to "trusted interpreter."
4. **Build value-truth with kindness: comps-backed ranges, trend sentences, and the scam-shield check.** This is the feature pair with real protective economic value to the user (and the clearest story for partners/press: "the app that stops your mother from selling the Morgan dollars for $200").
5. **Perfect the printed binder.** Add print styles, story-first layout, values in an appendix (`Summary.tsx`, `index.css`). The printed book is the emotional payoff of the entire product and the artifact that recruits the next user — every adult child who receives one is a customer.
