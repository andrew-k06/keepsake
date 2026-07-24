import { useEffect } from 'react'
import { useStore } from '../store'
import { STEPS, prepareProgress, pendingCelebration } from '../lib/prepare'
import { NextStepCard } from '../components/NextStepCard'
import { StepCelebration } from '../components/StepCelebration'
import { Card } from '../components/ui'
import { Compass, CircleCheckBig, HeartHandshake } from '../components/icons'

/**
 * Getting Ready — the guided path. One next step up top; the whole path below
 * in words and checkmarks (never percentages, dates, or red badges). Progress
 * is mostly DERIVED from the binder: the guide credits life, it doesn't audit it.
 */
export function Guide() {
  const { state, startPath, setTogether, personById } = useStore()

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

      {/* The whole path */}
      <h2 className="mt-10 text-2xl">The whole path</h2>
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
