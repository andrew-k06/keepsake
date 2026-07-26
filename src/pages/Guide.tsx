import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { STEPS, prepareProgress, pendingCelebration } from '../lib/prepare'
import { NextStepCard } from '../components/NextStepCard'
import { StepCelebration } from '../components/StepCelebration'
import { Button, Card } from '../components/ui'
import { Compass, CircleCheckBig, HeartHandshake, List } from '../components/icons'

/**
 * Getting Ready — the guided path. One next step up top; the whole path below
 * in words and checkmarks (never percentages, dates, or red badges). Progress
 * is mostly DERIVED from the binder: the guide credits life, it doesn't audit it.
 *
 * Pace: the user chooses how to take this. "Little bites" (recommended) shows
 * exactly one step per visit and tucks the whole path away — the antidote to
 * "this is a lot". "Show me everything" keeps the full map open. Either way,
 * nothing has a deadline.
 */
export function Guide() {
  const { state, startPath, setTogether, setPace, personById } = useStore()
  const [pathOpen, setPathOpen] = useState(false)

  // Opening the guide starts (or resumes) the path — idempotent.
  useEffect(() => {
    startPath()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = prepareProgress(state)
  const celebration = pendingCelebration(state)
  const together = state.preparedness?.togetherWithId
  const togetherPerson = together ? personById(together) : undefined
  const helpers = state.people.filter((p) => p.role !== 'owner')
  const pace = state.preparedness?.pace
  const showWholePath = pace !== 'bites' || pathOpen

  // The welcome line names the last win, never the absence.
  const lastDone = Object.entries(state.preparedness?.steps ?? {})
    .filter(([, v]) => v.status === 'done')
    .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))[0]
  const lastDoneTitle = lastDone ? STEPS.find((st) => st.id === lastDone[0])?.title : undefined

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
          <Compass className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="text-4xl">Getting Ready</h1>
      </div>
      <p className="mt-2 text-lg text-ink-soft">
        {lastDoneTitle ? (
          <>Welcome back, {state.ownerName}. Last time: {lastDoneTitle.toLowerCase()}. </>
        ) : (
          <>Welcome, {state.ownerName}. </>
        )}
        Getting Ready is Keepsake’s guided path: it turns “getting your affairs in order” — which
        sounds enormous — into a handful of small visits, at your pace, and you’ve{' '}
        {progress.doneCount > 0 ? 'already done some of it' : 'got a gentle place to start'}.
      </p>

      {/* Pace choice — asked once, changeable anytime, never a deadline */}
      {!pace && (
        <Card className="mt-5 border-sage/30 bg-sage/5 p-6">
          <p className="text-lg font-semibold">How would you like to take this?</p>
          <p className="mt-1 text-ink-soft">
            There’s no wrong answer and no schedule — you can change your mind anytime.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button icon={Compass} onClick={() => setPace('bites')}>
              Little bites — one step at a time
            </Button>
            <Button variant="secondary" icon={List} onClick={() => setPace('explore')}>
              Show me everything — I’ll choose
            </Button>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Most people pick little bites: one small step each visit, about ten minutes, and the
            rest stays out of sight until you want it.
          </p>
        </Card>
      )}

      {/* Words, not percentages */}
      {progress.doneCount > 0 && !progress.coreDone && (
        <p className="mt-2 font-semibold text-sage-deep">
          {progress.doneCount} of {progress.coreTotal} steps done — most families never get this far.
        </p>
      )}

      {celebration && (
        <div className="mt-5">
          <StepCelebration step={celebration} />
        </div>
      )}

      {/* Together mode */}
      {helpers.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label htmlFor="together" className="font-semibold text-ink-soft">
            Doing this with someone today?
          </label>
          <select
            id="together"
            className="rounded-xl border-2 border-line bg-white px-3 py-2 font-semibold focus:border-clay outline-none"
            value={together ?? ''}
            onChange={(e) => setTogether(e.target.value || undefined)}
          >
            <option value="">Just me</option>
            {helpers.map((p) => (
              <option key={p.id} value={p.id}>
                With {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Why we suggest starting here — the foundation, explained once */}
      {progress.doneCount === 0 && progress.nextStep && (
        <p className="mt-5 text-ink-soft">
          <span className="font-semibold text-ink">Why we suggest starting here:</span> one story is
          the foundation for everything else. It teaches you how Keepsake works in the most pleasant
          way possible — and the wishes, the practical notes, and the printed book all build on the
          treasures you add.
        </p>
      )}

      {/* The one card */}
      <div className="mt-5">
        {progress.coreDone ? (
          <Card className="border-sage bg-sage/10 p-6">
            <div className="flex items-start gap-4">
              <HeartHandshake className="mt-1 h-8 w-8 shrink-0 text-sage-deep" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <p className="text-xl font-semibold">Your family will never have to guess.</p>
                <p className="mt-1 text-ink-soft">
                  That’s the whole gift — and it’s done. From here, Keepsake is a companion, not a
                  chore: add a story when one comes to mind, and the binder keeps quiet watch with you.
                </p>
              </div>
            </div>
          </Card>
        ) : progress.nextStep ? (
          <NextStepCard step={progress.nextStep} togetherName={togetherPerson?.name} />
        ) : (
          <Card className="bg-cream p-6">
            <p className="text-ink-soft">
              Everything left is something you set aside — and that’s fine. It’s all listed below,
              whenever you’re ready.
            </p>
          </Card>
        )}
      </div>

      {/* Little bites: one step is the visit; the rest stays out of sight */}
      {pace === 'bites' && !progress.coreDone && (
        <p className="mt-3 text-sm text-ink-soft">
          One step is plenty for a visit. The rest will be here when you come back.
        </p>
      )}

      {/* The whole path — always one tap away, tucked away in bites mode */}
      {showWholePath ? (
        <>
          <div className="mt-10 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl">The whole path</h2>
            {pace === 'bites' && (
              <button
                onClick={() => setPathOpen(false)}
                className="inline-flex min-h-11 items-center px-2 py-1 text-sm font-semibold text-ink-soft underline hover:text-ink"
              >
                Tuck it away again
              </button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            {progress.chapters.map(({ chapter, steps, done }) => (
              <Card key={chapter.id} className={`p-5 ${done ? 'border-sage/40' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl">
                    {chapter.title}
                    {chapter.ongoing && (
                      <span className="ml-2 text-sm font-sans font-semibold text-ink-soft">ongoing</span>
                    )}
                  </h3>
                  {done && !chapter.ongoing && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-sage-deep">
                      <CircleCheckBig className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                      Done
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{chapter.sub}</p>
                <ul className="mt-3 space-y-2">
                  {steps.map(({ step, done: stepIsDone, skipped }) => (
                    <li key={step.id} className="flex items-center gap-2.5">
                      {stepIsDone ? (
                        <CircleCheckBig className="h-5 w-5 shrink-0 text-sage-deep" strokeWidth={2.25} aria-hidden="true" />
                      ) : (
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-line-strong"
                          aria-hidden="true"
                        />
                      )}
                      <span className={stepIsDone ? '' : 'text-ink-soft'}>
                        {step.title}
                        {skipped && <span className="ml-2 text-sm">(set aside for now)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          {pace === 'explore' && (
            <p className="mt-3 text-sm text-ink-soft">
              Prefer one step at a time?{' '}
              <button
                onClick={() => setPace('bites')}
                className="font-semibold text-sage-deep underline hover:text-ink"
              >
                Switch to little bites
              </button>
            </p>
          )}
        </>
      ) : (
        pace === 'bites' && (
          <button
            onClick={() => setPathOpen(true)}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line bg-white px-4 py-2 font-semibold text-ink-soft transition hover:border-sage hover:text-sage-deep"
          >
            <List className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
            Peek at the whole path
          </button>
        )
      )}

      {/* Helper briefing — visible whenever family exists */}
      {helpers.length > 0 && progress.nextStep?.togetherScript && (
        <Card className="mt-8 bg-cream p-6">
          <h2 className="text-2xl">Before your next visit</h2>
          <p className="mt-1 text-ink-soft">
            For whoever is helping: the next step is “{progress.nextStep.title}.”{' '}
            {progress.nextStep.togetherScript} Remember — you’re the asker and the scribe;{' '}
            {state.ownerName} makes every decision.
          </p>
        </Card>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        Keepsake teaches and keeps notes — it never gives legal advice, and some steps (a will, a
        power of attorney) belong with a professional. Suggested pace only: many families do one
        step on a Sunday afternoon. Nothing here has a deadline.
      </p>
    </div>
  )
}
