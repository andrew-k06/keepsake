# Keepsake — "From Binder to Guide": Product/UX Design

*Guide-layer concept session, July 2026. See 00-synthesis.md for the consolidated concept.*

*Grounded in the actual prototype: routes in `src/App.tsx`, nav in `src/components/Layout.tsx`, state in `src/store.tsx` / `src/types.ts`, persistence seam in `src/data/repository.ts`, and the existing pages under `src/pages/` (notably `Emergency.tsx` prompt chips, `Summary.tsx` print/share, `Family.tsx` roles, `Start.tsx` gift path, `Home.tsx`).*

---

## 1. The Journey Model

### Structure: a persistent path, walked in episodic visits

Not either/or — the two are layers of one system:

- **The Path** (persistent): a fixed sequence of 4 chapters + 1 ongoing chapter, each with 2–4 steps. Chapter definitions live in code (`src/lib/prepare.ts`), not in state — like `lib/appraise.ts`, the rules stay out of the pages.
- **The Visit** (episodic): each interaction is one step, framed as ~10–15 minutes. The app never shows a 75-year-old the whole wall of unchecked boxes as her default view. It shows **one card: the next step** — title, one sentence of *why*, a time estimate in plain words ("about ten minutes"), one button, and a "Not today" link. One decision per screen, exactly as `Start.tsx` already does.
- **Pacing is suggested, never scheduled.** Copy says "many families do one of these on a Sunday afternoon" — no dates, no deadlines, no streaks. A dated "Week 2" that you're late for is shame machinery; a chapter you haven't opened yet is just a chapter.

### The chapters (sequenced to defeat avoidance)

| # | Chapter | Steps | Completion |
|---|---|---|---|
| 1 | **The things that matter** | Add your first treasure and its story → `/add`; then "your five most precious things" (one per visit is fine) | Derived: items with a non-empty `story` ≥ 1, then ≥ 5 |
| 2 | **Where things stand** | Four notes: papers, who to call first, doctor & medications, house shut-offs | Derived: `state.emergency` labels matching the existing `PROMPTS` in `Emergency.tsx:8-15` |
| 3 | **Your people** | Add one person you trust → `/family`; choose a trusted contact; decide three wishes ("it's fine to leave the rest still being decided") | Derived: `people.some(p => p.role !== 'owner')`; `!!executorAccess?.personId`; `items.filter(i => i.beneficiaryId).length ≥ 3` |
| 4 | **The conversation** | Print or share the family summary → `/summary`; then "have the talk" | First derived (hook into `Summary.tsx` print/share handlers); second is the only **self-attested** step |
| 5 | **Keep it living** *(ongoing, never shown as debt)* | Try the offer check once "so you know it's there before anyone rings the doorbell" → `/check`; a season-turn check-in | Optional; the path reads "complete" after ch. 4 |

The sequencing is the anti-avoidance design: **pleasure before paperwork, artifact before conversation.** Chapter 1 is telling stories about beloved objects — the part that feels like reminiscing, not estate prep. By the time the hard step arrives (ch. 4), the user isn't being asked to "talk to your kids about death"; she's being asked to *show them the stories* — the printed summary from `Summary.tsx` is the conversation's prop, and its "still being decided" items are the natural agenda ("I haven't decided about the china — what do you think?").

### Progress that motivates without nagging or morbidity

- **Words and checkmarks, never percentages or bars.** "You've finished two of the four parts. Most families never get this far." Sage checkmarks on done steps; future steps in soft ink, never red.
- **Derived completion means progress accrues invisibly.** Someone who casually added six items and two emergency notes opens the guide to find chapters already done: "You've already done part of this without trying." The guide credits life, it doesn't audit it.
- **One-time celebration per step** (`StepCelebration` card, gated by a `celebrated[]` list): a single warm sentence — "That's one less thing your family will ever have to wonder about." — then it never reappears. Respects `prefers-reduced-motion`; no confetti storms.
- **Competence framing throughout** (per the synthesis's de-morbid mandate): the feature is called **"Getting Ready"**, never "preparedness," "estate," or "when I'm gone." Every *why* sentence is about the family's confidence: "so they always know what to do."

---

## 2. Dual-User Mode: the "Sit Together" session

The adult child is usually the engine (the store already models this: `plan.giftFrom` and the `p-gifter` collaborator in `emptyBinder()`, `store.tsx:67-100`). But the parent must stay the *decider* — the child is scribe and asker, never owner of the record.

**Together mode** is a session toggle on the Guide page: "Doing this with someone today?" → pick a collaborator (or the gift-giver, pre-selected). While active:

- **Each step card gains a facilitation panel for the child** — a literal script: *"Ask out loud: 'Mom, which of your things would you hate to see end up at a yard sale?'"* and a handling note: *"Let her talk. Tap the microphone and her words become the story."* This aims the existing `VoiceCapture` at the parent while the child holds the device.
- **The parent keeps every decision.** Wishes, the trusted contact, and especially the "we had the conversation" attestation render as parent-voiced confirmations ("Margaret, is this what you'd like?") — the child cannot check them on her behalf.
- **Attribution is honest.** Audit lines (the existing `withAudit` mechanism) read "You and Sarah added 'the pearl brooch'" during together sessions — consistent with the anti-coercion purpose of the activity record.
- **What the child sees alone:** a "Before your next visit" section on the Guide page (visible whenever `plan.giftFrom` is set or a collaborator exists) — which step is next, the script for it, and what to bring ("her address book helps with 'who to call first'"). In this single-device prototype that's simply a section of the same page; in the real product it becomes the collaborator's remote view.
- **Gift binders start here.** For `giftFrom` binders, `Start.tsx` should route to `/guide` instead of `/binder`, and the guide opens with "Your first visit together" — the child's onboarding *is* chapter 1 in together mode.

---

## 3. Entry Points, Resume, and the Avoidance Problem

**Where it surfaces:**
1. **Home card (primary).** A `NextStepCard` at the top of `Home.tsx` (after the gift card) — one step, one button, "See the whole path" link to `/guide`. It **replaces** the current generic "Invite family" nudge card, because that nudge is now a real step with context and sequencing.
2. **Nav.** Add "Getting Ready" to the desktop sidebar `nav` array (`Layout.tsx`). The mobile bottom nav is already at six items at `text-xs` — do **not** add a seventh there; on mobile the Home card is the door.
3. **Onboarding.** `Start.tsx` "for me" keeps its straight-to-`/add` flow (momentum beats orientation), but AddItem's success moment offers "See your path — you've already finished the first step." Gift mode routes to `/guide` as above.

**Resume.** The slice stores `lastStepId` / `lastVisitAt`. The Home card and Guide header always open by naming the last *win*, then the next step: *"Welcome back, Margaret. Last time you wrote down where your papers are. Next: choose someone you trust — about ten minutes."* Never "you haven't been here in 12 days."

**Handling avoidance (the flee-response):**
- **"Not today" is a first-class button**, answered with grace ("This will be here whenever you're ready") — and *remembered*: a snoozed step isn't re-offered next visit. If the snoozed step was heavy (people, the conversation), the next card rotates to a light one (add another story). You come back to warmth, not to the thing you fled.
- **Reframing does the heavy lifting**: stories first, gift language, "so your family always knows what to do," and the conversation step armed with an artifact.
- **No completion cliff.** Finishing ch. 4 lands on a genuine finish moment ("Your family will never have to guess. That's the whole gift.") — then chapter 5 reframes the app as a living companion, not a finished chore.

---

## 4. Concrete Spec (minimal buildable version)

**Types — `src/types.ts`:**
```ts
export interface PreparednessState {
  startedAt?: string
  lastVisitAt?: string
  lastStepId?: string
  togetherWithId?: string            // personId during a sit-together session
  steps: Record<string, { status: 'done' | 'skipped'; at: string; together?: boolean }>
  celebrated: string[]               // step ids whose one-time celebration has shown
}
// BinderState gains: preparedness?: PreparednessState
```
Optional field ⇒ the `repository.ts` migration (v3→v4) is a one-line default; seed Margaret with a partially-walked path so the demo shows the mechanic.

**Rules — new `src/lib/prepare.ts`:** the chapter/step catalog: `{ id, chapter, title, why, minutes, route, togetherScript, isDone?(state): boolean }`. Steps with `isDone` are **derived** (computed every render from `BinderState` — items/stories, `emergency` labels vs. `Emergency.tsx`'s `PROMPTS` (export that constant), people/roles, `beneficiaryId` counts, `executorAccess`); steps without it read from `preparedness.steps`. One selector `prepareProgress(state)` returns chapters with statuses plus `nextStep`, applying the snooze-rotation rule. Note: derive print/share from explicit calls, **not** by string-matching `audit` — fragile.

**Store — `src/store.tsx`:** add `completeStep(id)`, `skipStep(id)`, `setTogether(personId?)` to `StoreApi`; each writes plain-language audit lines via the existing `withAudit`.

**Screens/components:**
- `src/pages/Guide.tsx` at route `/guide` (`App.tsx`) + sidebar nav entry (`Layout.tsx`): welcome-back header, big `NextStepCard`, together-mode toggle, chapter list (done in sage, next highlighted, future soft), "Before your next visit" helper section.
- `src/components/NextStepCard.tsx` — shared by Guide and Home; navigates with `location.state = { fromGuide: stepId }`.
- `src/components/StepCelebration.tsx` — one-time, gated by `celebrated`.
- **Return-path wiring** (small edits): `Emergency.tsx`, `Family.tsx`, `AddItem.tsx` read `fromGuide` and show a "Back to your path" pill after save; `Summary.tsx` print/share handlers also call `completeStep('share-summary')`; `OfferCheck.tsx` verdict calls `completeStep('offer-check')`.
- `Home.tsx`: `NextStepCard` in place of the invite nudge; `Start.tsx`: gift path → `/guide`.

Everything fits the free Starter tier (five items < `STARTER_ITEM_LIMIT`) — the guide is a trust-builder, never a paywall funnel.

---

## 5. Top 5 Product Decisions (ordered)

1. **Derived completion over checkbox theater.** The guide *observes* the binder rather than asking users to claim work the app can verify — extending the prototype's core "never assert what isn't true" rule to progress itself, and crediting work done outside the guide.
2. **One next step, everywhere.** Home shows exactly one card; the full path lives behind "see the whole path." A new 75-year-old must never face a wall of unchecked boxes.
3. **Pleasure before paperwork, artifact before conversation.** Chapter order is the anti-avoidance mechanism: stories → papers → people → the talk (armed with the printed summary and its "still being decided" agenda).
4. **The child gets a script, not a dashboard.** Together mode makes the adult child the asker/scribe and the parent the decider; attestations are parent-voiced, attribution is honest in the audit record. No separate child analytics in v1.
5. **No nagging mechanics, ever.** No streaks, percentages, dates, or red badges; "Not today" is first-class, remembered, and followed by a lighter step; re-entry always names the last win. The guide competes with procrastination using warmth, because guilt is the one tool guaranteed to lose this audience.
