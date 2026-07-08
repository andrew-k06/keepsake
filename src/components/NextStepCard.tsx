import { useNavigate } from 'react-router-dom'
import type { GuideStep } from '../lib/prepare'
import { useStore } from '../store'
import { Button, Card } from './ui'
import { ArrowRight, Check, Compass } from './icons'

/**
 * The one card. A 75-year-old never faces a wall of unchecked boxes — just
 * the next step: title, one sentence of why, a time estimate in plain words,
 * one button, and a first-class "Not today".
 */
export function NextStepCard({
  step,
  compact = false,
  togetherName,
}: {
  step: GuideStep
  compact?: boolean
  togetherName?: string
}) {
  const navigate = useNavigate()
  const { startPath, completeStep, skipStep, setActiveStep } = useStore()

  const go = () => {
    startPath()
    if (step.selfAttested) {
      completeStep(step.id)
    } else {
      // Persisted (not router state): the return pill survives reloads and
      // multi-page hops until the user comes back to the Guide.
      setActiveStep(step.id)
      navigate(step.route)
    }
  }

  const notToday = () => {
    startPath()
    skipStep(step.id)
  }

  return (
    <Card className={`border-sage/30 bg-sage/5 ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
          <Compass className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-sage-deep">
            {compact ? 'Getting Ready — your next step' : 'Your next step'}
          </p>
          <p className="mt-1 text-xl font-semibold">{step.title}</p>
          <p className="mt-1 text-ink-soft">
            {step.why} <span className="whitespace-nowrap">({step.minutes})</span>
          </p>
          {togetherName && step.togetherScript && (
            <div className="mt-3 rounded-2xl border border-line bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                For {togetherName}
              </p>
              <p className="mt-1 text-ink-soft">{step.togetherScript}</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button icon={step.selfAttested ? Check : ArrowRight} onClick={go}>
              {step.selfAttested ? 'Yes — we’ve talked' : 'Let’s do it'}
            </Button>
            <button
              onClick={notToday}
              className="inline-flex min-h-11 items-center px-2 py-2 font-semibold text-ink-soft underline hover:text-ink"
            >
              Not today
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
