# Keepsake — Marketing Strategy Review

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

## 1. Messaging Audit

### What works — this copy is unusually good for a senior audience

- **"A warm place for the things that matter most."** (`src/pages/Welcome.tsx:33`) — leads with warmth and belonging, not death or organization. This is the right instinct and should survive into real marketing.
- **The three-step framing** — "Photograph it / Tell its story / Pass it on" (`Welcome.tsx:5-21`) — is concrete, sequential, and verb-first. Seniors respond to numbered, finite processes ("Step 1" labels at `Welcome.tsx:69`). "Snap a picture — we help fill in the details for you" (`Welcome.tsx:9`) sells the AI without ever saying "AI" — exactly right for this audience.
- **"In your own words"** (`Welcome.tsx:14`) — signals authorship and control, the core emotional need of someone deciding what their family will remember.
- **"When you're ready"** appears twice (`Welcome.tsx:19`, `Home.tsx:148`) — the single most important phrase in the app. It removes deadline pressure from a task people avoid precisely because it feels like a deadline. Keep it as a brand mantra.
- **The privacy line at the moment of highest anxiety**: "Your photo stays private in your binder" (`AddItem.tsx:132`) placed directly under the camera button, and "Your privacy comes first… you'll always be able to see who has looked at your binder" (`Family.tsx:124-128`). Reassurance at the point of fear, not buried in a footer. The audit-trail promise ("see who has looked") is a genuinely differentiated trust feature — market it. *(Note: must be made true first — see security/compliance lenses.)*
- **Seed content is the best marketing asset in the repo.** Margaret's stories (`src/data/seed.ts:66`, `:118`, `:133`) — "eleven dinner plates now — one broke in 1974 and we never replaced it, on purpose"; the clock that "chimes a little early — that's its character" — demonstrate the product's soul better than any tagline. These should become ad copy, not stay buried in a demo file.
- **"This section isn't a legal will"** (`Emergency.tsx:82-84`) — proactive plain-language disclaimer; builds trust and manages legal risk simultaneously.

### What needs fixing

- **"When I'm gone" / "if something happens"** — the README's walkthrough calls Emergency "the 'when I'm gone' practical guide" (`README.md:30`) and the Home nudge says "what to do if something happens" (`Home.tsx:149`). The euphemism stack drifts morbid. The seed entry "If something happens to me" (`seed.ts:53`) works *as Margaret's own words*, but as product-authored copy the frame should be "so your family always knows what to do" — competence, not mortality.
- **"Keepsake can help you share it automatically with your executor if something ever happens"** (`Emergency.tsx:84-85`) — "automatically" + death-trigger is exactly the kind of mechanism a scam-wary senior distrusts ("what happens, decided by whom?"). Needs plain-language explanation of the trigger, or softer copy: "your executor can be given access when it's needed."
- **Money is too loud.** "Estimated value" is one of three headline stats (`Home.tsx:67`), and the family summary opens with "combined estimated value of $X" (`Summary.tsx:41-43`) before any story. In a document children will read after a loss — or worse, *before* one — leading with a dollar total invites the sibling-fairness fight the product should defuse. Story first, values available on request/toggle.
- **Per-heir dollar tallies** — "3 items · $14,000" under each child's name (`Summary.tsx:61-62`) — is a fairness scoreboard. Sarah gets $14,000, David gets $7,800, printed side by side. Either offer a "hide values" print option or expect this screen to *cause* family conflict in testimonials.
- **"Not yet decided" / "haven't been assigned to anyone yet"** (`Summary.tsx:93-95`) reads as a to-do scold inside a keepsake document. Reframe: "Still being decided — ask Mom about these" turns a gap into a conversation prompt.
- **Occasional preciousness.** "One gentle binder" (`Welcome.tsx:38`), "gathered in one calm place" (`Emergency.tsx:31`), "a gentle summary" (`Summary.tsx:21`). One "gentle" is warm; three is a lavender-scented pat on the head. Seniors dislike being handled. Trim to concrete warmth (the seed data proves the team can do it).
- **"Recently kept" / "Items kept"** (`Home.tsx:66`, `:108`) — cute internal vocabulary that will confuse literal readers. "Your items" / "Recently added" costs nothing.
- **"Executor (access in an emergency)"** (`Family.tsx:81`) — "executor" is a legal term of art; using it for a non-legal role invites confusion with the actual estate executor. Call it "Emergency contact" or explain the distinction.
- **Demo-only, but flag for production:** `alert()` dialogs (`Summary.tsx:32`, `Appraisals.tsx:45`) and the double CTA "Open Margaret's Binder" / "Take a tour" going to the same route (`Welcome.tsx:42-47`) — identical-destination buttons erode trust with literal-minded users.

**Verdict:** The copy largely earns trust. The voice is 80% right; the risks are concentrated in (a) death-adjacent phrasing, (b) money placement, and (c) the automatic-executor mechanism.

## 2. Positioning

### Resolve the tension: legacy, not death-prep

The product must be positioned as **"the story of your things, preserved as a gift"** — full stop. Nobody buys "get organized before you die"; estate-planning avoidance is the defining behavior of this market. But don't discard the practical layer — it's the *permission structure*. Legacy is the motivation; "your family will know what to do" is the justification seniors give themselves and others. Lead with story, close with peace of mind.

**One-liner:**

> **Keepsake — every treasure in your home has a story. Save both, for the people you love.**

(Alternate for adult-child audience: *"Your mom's house is full of stories. Keepsake makes sure they don't get lost."*)

**Three message pillars:**

1. **"The story is the treasure."** A ring is $8,500; *knowing it was Eleanor's, from 1948, meant for Sarah* is priceless. Only Keepsake captures the meaning, not just the inventory. (Proof: the story field, the "For my family" summary, printed keepsake output.)
2. **"No surprises, no squabbles."** Every item has a name on it and the reason why — decided calmly by you, not argued over later. (Proof: beneficiary assignment, the who-gets-what summary, "when you're ready" pacing.)
3. **"Yours, private, and in plain English."** No account needed to look around, you choose who sees what, you see who's looked, and it's never a legal document pretending otherwise. (Proof: `Family.tsx:124-128` privacy card, `Emergency.tsx:82` non-will disclaimer, printable paper output.)

### Against the alternatives

| Alternative | Their strength | Keepsake's counter |
|---|---|---|
| **Paper binder / spreadsheet** | Familiar, trusted, tangible | "Keepsake prints a beautiful binder too — but paper can't hold your voice, photos, or update itself when things change. Start digital, keep a printed copy." Never mock paper; *include* it. |
| **Estate attorney / will letter** | Legal authority | "Your will says who gets the house. Keepsake says why the clock chimes early. They work together." Position as complement — attorneys become a referral channel, not a rival. |
| **Home-inventory insurance apps** | Practical, sometimes free | "They count your things. We keep your stories." Insurance apps are a chore about loss; Keepsake is a gift about love — and it handles the insurance list as a byproduct. |
| **Doing nothing (the real competitor)** | Zero effort, avoids mortality | "One item, one photo, one story — five minutes on a Sunday." Shrink the ask; the enemy is procrastination, so the CTA is never 'organize your estate,' it's 'save one story today.' |

## 3. Dual-Audience Strategy

### Seniors (users) — "This is your story to tell"

- **Message:** Pride and authorship, not preparation. "You decide who gets what — and they'll finally know why it matters." Emphasize control ("you choose exactly what each person can see," `Family.tsx:45-46`) and ease ("snap a picture, we fill in the details").
- **Channels:** Facebook (the one platform 65+ actually lives on — interest targeting on genealogy, antiques, grandparenting); print (local newspapers, senior-center newsletters, AARP publications); community — church groups, libraries, senior centers, estate-sale companies, downsizing/"senior move manager" pros; direct mail (this audience *trusts* physical mail — see §4).
- **Creative:** Real seniors, real objects, real voices. Margaret-style stories as 30-second reads/videos: the eleven plates, the clock's brass key.

### Adult children 45–65 (buyers/influencers) — "Ask her now, while you can"

- **Message:** Preemptive regret + conflict avoidance. "You know the ring matters. Do you know why?" and "The #1 thing families fight over isn't money — it's the stuff." They buy peace of mind and a socially acceptable way to raise a hard topic.
- **Channels:** Instagram/Facebook (sandwich-generation targeting), podcasts (caregiving, personal finance, decluttering/Swedish-death-cleaning adjacent), search (SEO on "how to divide parents' belongings," "home inventory for elderly parents," "talking to parents about their stuff"), content marketing (a genuinely useful guide: *"How to ask your parents about their treasures without making it weird"*).

### The handoff — "Gift it to Mom" motion

- **Child → parent:** A **gift flow** is the core growth loop. Child buys, Keepsake sends the parent a beautiful *physical* welcome kit (letter, simple instructions, the child's note: "Mom, I want to keep your stories"). Framed as a gift of attention, not a homework assignment. Seasonal pushes: Mother's/Father's Day, Christmas, Grandparents Day — "the gift that says your stories matter."
- **Child as collaborator, not owner:** The invite roles (`Family.tsx:76-82`) already support "Help me add & edit." Market the shared session: "Spend an afternoon with Dad and the coin folder." The product's best onboarding is a child holding the phone while the parent talks.
- **Parent → child:** The "Invite family" nudge (`Home.tsx:141-155`) and the emailed summary (`Summary.tsx:29-35`) turn every active senior into an acquisition channel — each shared binder lands in 2-4 adult children's inboxes with an emotionally loaded artifact attached. Make the shared summary gorgeous and lightly branded; it's the viral unit.

## 4. Trust for a Scam-Wary Generation

This audience is trained — by their banks, their kids, and AARP itself — to treat unfamiliar apps asking about *valuables in their home* as a scam. A photographed inventory of jewelry + who lives there + when they're vulnerable is, viewed coldly, a burglar's dream document. Trust must be over-engineered:

1. **A real, answered phone number** on the website, in the app footer, and on every email — staffed by humans, US-based, no phone tree. For this generation, "can I call someone" *is* the legitimacy test. Publish a physical mailing address alongside it.
2. **Plain-language privacy promise, one page, first-grade layout:** "We will never sell your information. We will never show your items to anyone you didn't invite. We can't see your photos without your permission. You can see who has looked at your binder. Delete everything anytime — and we mean deleted." Signed by the founder, with a face and a name.
3. **No dark patterns, provably:** no free-trial-into-surprise-billing, no countdown timers, no "your family member is waiting!" pressure emails, cancellation by phone in one call. The existing "when you're ready" voice must extend to billing. One pricing plan, price printed in dollars, no asterisks.
4. **Physical-world presence:** printed welcome kit, the print-your-binder feature (`Summary.tsx:26-28`) marketed hard ("your binder lives on paper too — even if Keepsake disappeared tomorrow, you keep everything"), and an annual mailed printed summary as a subscription perk. Data-export/paper-fallback is the anti-lock-in promise this generation needs.
5. **Endorsements from institutions they already trust:** AARP (partnership or at least ad placement), certified appraiser associations (ISA/ASA — the appraiser marketplace should badge accreditation, which the seed data already references at `seed.ts:90`), estate attorneys and financial planners as referral partners, local senior centers, and — highest leverage — *named, photographed customer families* telling real stories.
6. **Safety-specific reassurances:** explicitly address the burglary fear ("your binder never shows your address; location is never attached to photos") and the appraisal-scam fear ("appraisers in our network are vetted, insured, and never buy what they appraise" — the conflict-of-interest disclosure is the industry's own gold standard).
7. **Fix in product:** the "automatically… if something ever happens" mechanism (`Emergency.tsx:84`) must be explained transparently (who triggers it, what they see) or it will read as the app deciding when you're dead.

## 5. First-90-Days Launch Plan

**Pre-work (weeks 1–2):** landing page with the one-liner, phone number, privacy promise; instrument the funnel (visit → binder created → first item with story → family invite → shared summary).

**Campaign 1 — "The Story Behind It" (weeks 2–12, content/community, senior-facing).**
Weekly series: one real senior, one object, one 60-second story (Margaret-style — the eleven plates format). Distributed on Facebook + partner newsletters (senior centers, libraries, churches in 2-3 pilot metros), with in-person "Story Afternoon" workshops at 5-10 senior centers where staff/volunteers help attendees add their first three items.
*Measure:* workshop attendance, binders created per workshop, % reaching 3+ items with stories within 14 days, Facebook video completion rate and cost per binder created.

**Campaign 2 — "Do You Know Why?" (weeks 4–12, paid social + search, adult-child-facing).**
Instagram/Facebook ads to 45-65s: close-up of an heirloom, "You know it mattered to her. Do you know why?" → guide download ("How to ask your parents about their treasures") → gift-a-binder offer. Search coverage on inheritance/downsizing/parent-conversation queries. 3-5 caregiving/finance podcast sponsorships.
*Measure:* cost per gift purchase, guide→gift conversion, **gift activation rate** (% of gifted parents who add an item within 30 days — the metric that decides whether the gift motion works), CAC by channel.

**Campaign 3 — "Mother's Day / Father's Day Gift Kit" (timed spike; if the 90 days miss both holidays, run Grandparents Day or "Holiday Stories" instead).**
The physical welcome kit as a giftable SKU: box, letter, instruction card, child's handwritten note prompt. PR angle: "the anti-gadget gift for parents who have everything." Pitch gift guides, morning-TV segments, caregiving newsletters.
*Measure:* kits sold, activation rate vs. digital-only gifts, earned-media placements, promo-code attribution.

**Day-90 gate:** 1,000 active binders, ≥40% with a family member invited, ≥25% of gifted binders activated, one signed institutional partner (senior-center network, appraiser association, or AARP-adjacent publication), and 10 named testimonial families.

## 6. Top 5 Marketing Actions, Ordered

1. **Lock positioning as "legacy gift," then sweep the copy:** purge "when I'm gone" (`README.md:30`) and "if something happens" (`Home.tsx:149`) framings, demote dollar totals in Home stats and the family Summary (`Home.tsx:67`, `Summary.tsx:41`, `:61`), add a hide-values print option, cut the "gentle" tic, and rewrite the automatic-executor line (`Emergency.tsx:84`) in transparent plain language.
2. **Ship the trust kit before any paid spend:** real phone number, physical address, one-page founder-signed privacy promise, plain single-price pricing, print/export prominence, and the burglary/appraiser-scam reassurances. For this audience, trust *is* the funnel.
3. **Build the "Gift it to Mom" motion:** gift purchase flow + physical welcome kit + child-as-collaborator onboarding. Adult children are the economic buyer; this is the revenue engine and the activation engine in one.
4. **Turn seed-quality stories into the campaign:** recruit 10 real families, capture Margaret-grade item stories (the eleven plates, the early-chiming clock), and make "The Story Behind It" the always-on content series across Facebook, print, and partner channels.
5. **Sign 3-5 distribution partnerships with already-trusted institutions:** senior centers/libraries for workshops, estate attorneys and senior-move managers for referrals, a certified-appraiser association for marketplace credibility — pursuing an AARP relationship as the long-term flagship endorsement.
