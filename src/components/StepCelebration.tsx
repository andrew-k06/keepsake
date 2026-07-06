import type { GuideStep } from '../lib/prepare'
import { useStore } from '../store'
import { Card } from './ui'
import { CircleCheckBig } from './icons'

/** One warm sentence, once, then never again. No confetti storms. */
export function StepCelebration({ step }: { step: GuideStep }) {
  const { markCelebrated } = useStore()
  return (
    <Card className="flex items-start gap-4 border-sage bg-sage/10 p-5">
      <CircleCheckBig className="mt-0.5 h-6 w-6 shrink-0 text-sage-deep" strokeWidth={2.25} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{step.title} — done.</p>
        <p className="text-ink-soft">{step.celebrate}</p>
      </div>
      <button
        onClick={() => markCelebrated(step.id)}
        className="inline-flex min-h-11 shrink-0 items-center px-2 py-1 font-semibold text-sage-deep underline"
      >
        Lovely
      </button>
    </Card>
  )
}
