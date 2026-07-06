# Keepsake Guide Layer — Concept Synthesis

*July 2026. Five-lens concept session: product/UX (01), curriculum (02), compliance (03), AI companion (04), GTM (05). Full reports in this directory. Context: all four waves of the original review roadmap are implemented on `build/waves`; this is the next layer.*

---

## The concept in one paragraph

Keepsake evolves from a binder you fill into a **guide that walks you through getting ready** — because the market's real competitor is "doing nothing," and the reason people do nothing is that "getting your affairs in order" feels like one enormous, morbid, unknowable job. The guide decomposes it into eight warm modules walked in 15-minute visits, teaches every concept in plain language (will, POA, advance directive, beneficiary designation), captures what Keepsake can capture, and routes everything else to professionals with a printed list of questions in hand. Senior-facing name: **"Getting Ready."** It teaches and checklists; it never advises or drafts.

## Where the five lenses converged (the design is over-determined)

1. **The truth rule extends to the guide, everywhere.** Product: progress is *derived* from the real binder, never checkbox theater. Curriculum: every module states its own "this part needs a professional" boundary inside the module. AI: the preview never fakes open-ended understanding; the companion cites its source in every answer. GTM: no outcome claims ("be prepared in 6 weeks" is banned). Compliance: the whole edifice rests on it. One rule, five expressions.

2. **The definition/application line is the load-bearing wall.** The guide (and its AI companion) may *define* anything in the counsel-reviewed curriculum; it may *apply* nothing to one user's facts. "A trust generally does X" — always. "You need a trust" — never. This single line is simultaneously the UPL compliance architecture, the AI system-prompt core, the content style guide, and — unexpectedly — the estate-attorney channel strategy: a product that teaches concepts and manufactures prepared clients with question lists *feeds* attorneys instead of threatening them.

3. **Warmth gradient defeats avoidance.** Product's chapter order and curriculum's difficulty ratings (🕯1–5) independently arrived at the same sequence: stories → house → people → papers → health wishes → money → the conversation. Pleasure before paperwork; artifact before conversation (the printed summary IS the family talk's prop, and "still being decided" is its agenda). Hard rule: never two heavy sessions in a row; the first three sessions always include a story.

4. **"Not today" is a first-class design object.** Product: a remembered snooze followed by a lighter step. AI: honored on the first ask, unconditionally, then a competence reframe from real binder state and a pivot to stories. Curriculum: "not yet — ask me again in three months" is a recorded, judgment-free answer in every gap plan. No streaks, dates, percentages, or red badges anywhere.

5. **The adult child is engine, never owner.** Product: Together mode gives the child a facilitation script while every decision renders as a parent-voiced confirmation. Curriculum: the child gets a parallel helper track ("help without taking over") and enters at the trusted-contact moment, framed as the senior's choice. Compliance/AI: coercion language triggers cooling-off drafts, audit lines, and resource routing (APS locator, Eldercare Locator, DOJ elder-fraud hotline) — never accusations. GTM: child-visible progress must be milestone-level and senior-consented — coaching, never surveillance.

6. **The guide is the honest recurring service.** GTM's sharpest finding: "ongoing coaching" (annual reviews, seasonal check-ins, new modules) justifies the child-paid $79/yr Family Plan far more honestly than trend-watching, which demotes to a feature. And the free **Family Check-Up** (4 areas, 12 questions, sibling-share mechanic — "mismatch is the demo") becomes the new top of funnel, replacing the generic quiz.

## The curriculum at a glance (see 02 for full modules)

| # | Module | Difficulty | Keepsake captures | Professional boundary |
|---|---|---|---|---|
| 1 | The Stories in Your Things | 🕯1 | everything (built) | none |
| 2 | How Your House Works | 🕯1–2 | emergency notes (built) | none |
| 3 | Your People (the four hats) | 🕯3–4 | trusted contact (built) + intentions | executor/POA/proxy need Modules 4–5 documents |
| 4 | Your Important Papers | 🕯3 | document inventory: exists/where/who | attorney drafts will & POA; state forms for directives |
| 5 | Your Health Wishes | 🕯5 | status, locations, optional voice note on *why* | state form + witnesses; POLST via clinician |
| 6 | Money, Accounts & Passwords | 🕯2–3 | institution *pointers only* — never numbers/credentials | designations at each institution; attorney for digital-asset language |
| 7 | The Family Conversation | 🕯4 | the summary anchor + held-status | elder mediator if already burning |
| 8 | For Your Family: The First Days | 🕯3 (child) | lives in binder, prints with summary | probate attorney post-death |

Four trigger-event doors re-sequence the same modules: downsizing (stories ride the sorting energy), widowhood (paperwork first, stories as memorial later, directives delayed 8–12 weeks), new diagnosis (documents-require-capacity sprint + voice-first stories; the word "still" is banned), and "the kids finally asked" (child enters first via the gift flow, leads with the story ask).

## Build plan

**Phase G0 — the Path (buildable now, in this prototype).** Product spec in 01 §4: `preparedness` state slice + `lib/prepare.ts` catalog with derived completion, `/guide` page with NextStepCard + chapter list + Together mode, Home card replacing the invite nudge, return-path wiring into existing pages, seed Margaret partially along the path. Small, honest, no new simulation surface.

**Phase G1 — the curriculum content.** Modules 2/4/6 first (they extend the existing emergency-notes machinery), written to the compliance rubric, with the glossary underlines and per-module professional boundaries. Document-inventory structure (exists/where/who) as a new capture type. The "questions for your attorney" printable per module.

**Phase G2 — the companion (preview).** Scripted dialogue tree in `lib/guide.ts` returning the real `GuideTurn` shape (`speak, display, sourceModuleId, knowledgeConfidence, proposedWrite?, safetyFlag?`); voice in/out real; "Guide — Preview" honest labeling; the ~30 canned Q&A pairs including the trust question and the avoidance branch.

**Phase G3 — real services.** Claude behind the server endpoint with the compliance system prompt + retrieval-only grounding + schema-enforced output + red-team eval suite; the Family Check-Up as a public lead-magnet page; Gift Kit SKU with printed workbook.

**Parallel (human) tracks:** counsel review of the UPL rubric (`03 §1`) before content ships; the eval harness before any live model; zero attorney-referral revenue at launch (bar-LRS/NAELA links only); the coercion escalation playbook.

## The one-sentence pitch

> Keepsake — every treasure in your home has a story. Save both, for the people you love. *And you won't do it alone — Keepsake walks you through it, one step at a time.*
