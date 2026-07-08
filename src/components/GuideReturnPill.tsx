import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { STEPS, stepDone } from '../lib/prepare'
import { Compass, CircleCheckBig } from './icons'

/** Shown while the user is out doing a Getting Ready step. Reads persisted
    state (not router state), so it survives reloads and page-to-page hops;
    opening the Guide clears it. */
export function GuideReturnPill() {
  const { state } = useStore()
  const activeId = state.preparedness?.activeStepId
  if (!activeId) return null
  const step = STEPS.find((st) => st.id === activeId)
  if (!step) return null
  const done = stepDone(state, step)
  return (
    <Link
      to="/guide"
      className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-sage/40 bg-sage/10 px-4 py-2 font-semibold text-sage-deep hover:border-sage"
    >
      {done ? (
        <>
          <CircleCheckBig className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          “{step.title}” — done. Back to Getting Ready
        </>
      ) : (
        <>
          <Compass className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          You’re on your path: {step.title.toLowerCase()} — back to Getting Ready
        </>
      )}
    </Link>
  )
}
