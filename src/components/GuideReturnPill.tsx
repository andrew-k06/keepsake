import { Link, useLocation } from 'react-router-dom'
import { Compass } from './icons'

/** Shown when a page was reached from the Getting Ready path — one quiet way back. */
export function GuideReturnPill() {
  const location = useLocation()
  const fromGuide = (location.state as { fromGuide?: string } | null)?.fromGuide
  if (!fromGuide) return null
  return (
    <Link
      to="/guide"
      className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-sage/40 bg-sage/10 px-4 py-2 font-semibold text-sage-deep hover:border-sage"
    >
      <Compass className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      You’re on your path — back to Getting Ready
    </Link>
  )
}
