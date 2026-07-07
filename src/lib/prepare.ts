// "Getting Ready" — the guided path's rules, out of the pages (like appraise.ts).
//
// Design rules from docs/guide-layer/:
//   - DERIVED completion: steps with isDone() are computed from the real
//     binder — the guide observes work, it never asks users to claim what the
//     app can verify. Steps without isDone() are attested via preparedness.steps.
//   - Warmth gradient: pleasure before paperwork, artifact before conversation.
//   - "Not today" is first-class: a skipped step goes to the back of the queue,
//     and if it was heavy, the next offer is a light one.
//   - No percentages, no dates, no streaks — words and checkmarks only.

import type { BinderState, PreparednessState } from '../types'

export interface GuideStep {
  id: string
  chapter: string
  title: string
  /** One sentence of why — always about the family's confidence, never mortality. */
  why: string
  minutes: string
  route: string
  /** Emotionally heavy steps are never offered right after a heavy skip. */
  heavy?: boolean
  /** Script shown to the helper during a sit-together session. */
  togetherScript?: string
  /** One-time celebration sentence. */
  celebrate: string
  /** Derived completion. Absent → attested via preparedness.steps. */
  isDone?: (s: BinderState) => boolean
  /** Attested steps completed by a button on the Guide itself (not a route visit). */
  selfAttested?: boolean
}

export interface GuideChapter {
  id: string
  title: string
  sub: string
  /** Ongoing chapters never count toward "the path is complete". */
  ongoing?: boolean
}

const hasNote = (s: BinderState, re: RegExp) =>
  s.emergency.some((e) => re.test(`${e.label} ${e.detail}`))

const storiesTold = (s: BinderState) => s.items.filter((it) => it.story.trim()).length

export const CHAPTERS: GuideChapter[] = [
  { id: 'things', title: 'The things that matter', sub: 'Start with the stories — the part that feels like remembering, because it is.' },
  { id: 'house', title: 'Where things stand', sub: 'Four short notes a loved one could act on tonight.' },
  { id: 'people', title: 'Your people', sub: 'Who helps, who sees, and who you’d like each treasure to go to.' },
  { id: 'conversation', title: 'The conversation', sub: 'Show them the stories — the binder does the talking.' },
  { id: 'living', title: 'Keep it living', sub: 'The binder keeps helping — no chores here, just good habits.', ongoing: true },
]

export const STEPS: GuideStep[] = [
  // Chapter 1 — the things that matter
  {
    id: 'story-first',
    chapter: 'things',
    title: 'Save your first story',
    why: 'The story is the part of a treasure no one else can recover — one is enough to begin.',
    minutes: 'about ten minutes',
    route: '/add',
    togetherScript:
      'Ask out loud: “Which of your things would you hate to see end up at a yard sale?” Then let her talk — tap the microphone and her words become the story.',
    celebrate: 'That story is saved. It’s the one thing in this house nobody else could have written down.',
    isDone: (s) => storiesTold(s) >= 1,
  },
  {
    id: 'story-five',
    chapter: 'things',
    title: 'Five treasures, five stories',
    why: 'Five is enough for your family to feel the house speak — one per visit is a fine pace.',
    minutes: 'ten minutes each',
    route: '/add',
    togetherScript: 'One item per visit is plenty. Ask “what’s the story behind this one?” and hold the phone while she talks.',
    celebrate: 'Five stories kept. Most families never write down even one.',
    isDone: (s) => storiesTold(s) >= 5,
  },

  // Chapter 2 — where things stand
  {
    id: 'note-papers',
    chapter: 'house',
    title: 'Where your important papers are',
    why: 'So no one ever has to search — knowing where things are is half of everything.',
    minutes: 'about five minutes',
    route: '/emergency',
    togetherScript: 'Ask: “If I needed your insurance papers this afternoon, where would I look?” Write the answer as a note — in words, never codes.',
    celebrate: 'That’s one less thing your family will ever have to wonder about.',
    isDone: (s) => hasNote(s, /paper|will|deed|insurance polic/i),
  },
  {
    id: 'note-first-call',
    chapter: 'house',
    title: 'Who to call first',
    why: 'In a hard moment, one clear name saves an hour of panic.',
    minutes: 'about five minutes',
    route: '/emergency',
    togetherScript: 'Ask: “If something happened tonight, who should the neighbors call first? And who after that?”',
    celebrate: 'Now the first hour has a plan. That’s a real gift.',
    isDone: (s) => hasNote(s, /\bcall\b|attorney|who to reach/i),
  },
  {
    id: 'note-medical',
    chapter: 'house',
    title: 'Your doctor & medications',
    why: 'Paramedics and family both ask the same first question — this note answers it.',
    minutes: 'about five minutes',
    route: '/emergency',
    togetherScript: 'Ask where the current medication list lives — the refrigerator door is the classic spot paramedics check.',
    celebrate: 'The question every emergency starts with now has an answer.',
    isDone: (s) => hasNote(s, /doctor|medication|medical|advance directive/i),
  },
  {
    id: 'note-house',
    chapter: 'house',
    title: 'How the house works',
    why: 'Shut-offs, breakers, the clock that needs winding — the house should never be a mystery.',
    minutes: 'about ten minutes',
    route: '/emergency',
    togetherScript: 'Walk the house together: where’s the water shut-off, the breaker box, the spare-key neighbor?',
    celebrate: 'Anyone you trust could look after the house tonight. Done.',
    isDone: (s) => hasNote(s, /shut-?off|water|power|breaker|valve|furnace/i),
  },

  // Chapter 3 — your people
  {
    id: 'person-add',
    chapter: 'people',
    title: 'Add someone you trust',
    why: 'Wishes need a name — add the people who’ll one day carry the stories.',
    minutes: 'about five minutes',
    route: '/family',
    celebrate: 'The binder has family in it now. Everything else builds on this.',
    isDone: (s) => s.people.some((p) => p.role !== 'owner'),
  },
  {
    id: 'trusted-contact',
    chapter: 'people',
    title: 'Choose your trusted contact',
    why: 'One person who could ask for access if it were ever needed — dormant until verified, always yours to change.',
    minutes: 'about five minutes',
    route: '/family',
    heavy: true,
    togetherScript:
      'This one is her decision alone. Read the card together, then step back — she chooses, even if it isn’t you.',
    celebrate: 'If a hard day ever comes, someone can help — and not a day sooner than the rules you set.',
    isDone: (s) => Boolean(s.executorAccess?.personId),
  },
  {
    id: 'wish-three',
    chapter: 'people',
    title: 'Decide three wishes',
    why: 'Pick three treasures and say who you’d love each to go to — the rest can stay “still deciding” as long as you like.',
    minutes: 'about ten minutes',
    route: '/binder',
    heavy: true,
    togetherScript:
      'Open a treasure and ask: “Who do you picture with this?” Never suggest a name first — and “not decided” is a fine answer.',
    celebrate: 'Three wishes decided, in your own words, changeable anytime. No one will ever have to guess about those.',
    isDone: (s) => s.items.filter((it) => it.beneficiaryId).length >= 3,
  },

  // Chapter 4 — the conversation
  {
    id: 'share-summary',
    chapter: 'conversation',
    title: 'Print or share the family summary',
    why: 'The binder becomes a book your family can hold — it’s the easiest way to start the conversation.',
    minutes: 'about five minutes',
    route: '/summary',
    heavy: true,
    togetherScript: 'Print it together. Handing over pages beats any speech.',
    celebrate: 'The stories are on paper now. Paper doesn’t need a password.',
  },
  {
    id: 'have-talk',
    chapter: 'conversation',
    title: 'Have the conversation',
    why: 'Show them the stories and say what you’ve decided — the “still deciding” list makes a lovely agenda.',
    minutes: 'a cup of coffee',
    route: '/guide',
    heavy: true,
    selfAttested: true,
    togetherScript:
      'Your job is to listen. She announces her decisions with their reasons; questions are welcome, votes are not.',
    celebrate: 'Your family will never have to guess. That’s the whole gift.',
  },

  // Chapter 5 — keep it living (ongoing)
  {
    id: 'offer-check-try',
    chapter: 'living',
    title: 'Try the offer check once',
    why: 'So you know it’s there before anyone ever rings the doorbell with cash and a hurry.',
    minutes: 'about two minutes',
    route: '/check',
    celebrate: 'Now you know: no one ever has to decide on the spot again.',
  },
]

export interface ChapterProgress {
  chapter: GuideChapter
  steps: { step: GuideStep; done: boolean; skipped: boolean }[]
  done: boolean
}

export interface GuideProgress {
  chapters: ChapterProgress[]
  /** The one card to show. Null when the core path is complete and nothing is pending. */
  nextStep: GuideStep | null
  /** All non-ongoing chapters complete. */
  coreDone: boolean
  doneCount: number
  coreTotal: number
}

export function stepDone(s: BinderState, step: GuideStep): boolean {
  if (step.isDone) return step.isDone(s)
  return s.preparedness?.steps[step.id]?.status === 'done'
}

export function stepSkipped(s: BinderState, step: GuideStep): boolean {
  return !stepDone(s, step) && s.preparedness?.steps[step.id]?.status === 'skipped'
}

export function prepareProgress(s: BinderState): GuideProgress {
  const chapters: ChapterProgress[] = CHAPTERS.map((chapter) => {
    const steps = STEPS.filter((st) => st.chapter === chapter.id).map((step) => ({
      step,
      done: stepDone(s, step),
      skipped: stepSkipped(s, step),
    }))
    return { chapter, steps, done: steps.every((x) => x.done) }
  })

  const core = chapters.filter((c) => !c.chapter.ongoing)
  const coreDone = core.every((c) => c.done)
  const coreSteps = core.flatMap((c) => c.steps)
  const doneCount = coreSteps.filter((x) => x.done).length

  // Next step: first undone, un-skipped step in path order. Skipped steps go
  // to the back of the queue ("Not today" is remembered). After a skip, the
  // next offer comes from a DIFFERENT chapter — declining "save a story" must
  // not be answered with "save five stories" — and after a heavy skip it's a
  // light step: you come back to warmth, not to the thing you fled.
  const all = chapters.flatMap((c) => c.steps)
  const undoneFresh = all.filter((x) => !x.done && !x.skipped)
  const undoneSkipped = all.filter((x) => !x.done && x.skipped)

  let next: GuideStep | null = null
  if (undoneFresh.length > 0) {
    const lastId = s.preparedness?.lastStepId
    const lastAction = lastId ? s.preparedness?.steps[lastId] : undefined
    const lastStep = lastId ? STEPS.find((st) => st.id === lastId) : undefined
    if (lastAction?.status === 'skipped' && lastStep) {
      next = (
        undoneFresh.find(
          (x) => x.step.chapter !== lastStep.chapter && (!lastStep.heavy || !x.step.heavy),
        ) ??
        undoneFresh.find((x) => x.step.chapter !== lastStep.chapter) ??
        undoneFresh[0]
      ).step
    } else {
      next = undoneFresh[0].step
    }
  } else if (undoneSkipped.length > 0) {
    next = undoneSkipped[0].step
  }

  return { chapters, nextStep: next, coreDone, doneCount, coreTotal: coreSteps.length }
}

/** Steps that just became done but haven't had their one-time celebration. */
export function pendingCelebration(s: BinderState): GuideStep | null {
  const celebrated = s.preparedness?.celebrated ?? []
  // Only celebrate once the path has been started — otherwise a first visit
  // to the Guide would fire a barrage for everything life already did.
  if (!s.preparedness?.startedAt) return null
  return STEPS.find((st) => stepDone(s, st) && !celebrated.includes(st.id)) ?? null
}

export const emptyPreparedness = (): PreparednessState => ({
  startedAt: new Date().toISOString(),
  steps: {},
  celebrated: [],
})
