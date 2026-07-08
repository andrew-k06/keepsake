import { Link } from 'react-router-dom'
import type { Item } from '../types'
import { marketSnapshot, trendWords } from '../lib/market'
import { Card, DemoTag } from './ui'
import { TrendingUp, TrendingDown, Minus } from './icons'

/**
 * "What it sells for today" — the market-trend card.
 * Truth + dignity + agency: today's range first (with receipts), the market's
 * fault named (never their taste), then the reminder that market price is not
 * family value. Words in the app's warm palette — never red/green tickers.
 */
export function TrendCard({ item, familyPlan }: { item: Item; familyPlan: boolean }) {
  const snap = marketSnapshot(item)
  if (!snap) return null

  if (!familyPlan) {
    return (
      <Card className="mt-6 bg-cream p-5">
        <p className="font-semibold">Is this going up or down?</p>
        <p className="mt-1 text-ink-soft">
          The Family Plan watches what pieces like this actually sell for and tells you — gently, with
          real sales as receipts.{' '}
          <Link to="/plan" className="font-semibold text-clay-dark underline">
            See the Family Plan
          </Link>
        </p>
      </Card>
    )
  }

  const Icon = snap.trend === 'up' ? TrendingUp : snap.trend === 'down' ? TrendingDown : Minus
  const toneCls = snap.trend === 'up' ? 'text-sage-deep' : snap.trend === 'down' ? 'text-clay-dark' : 'text-ink-soft'

  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          <Icon className={`h-4 w-4 shrink-0 ${toneCls}`} strokeWidth={2.25} aria-hidden="true" />
          What it sells for today
        </div>
        <Sparkline changePct={snap.changePct} trend={snap.trend} />
      </div>

      <p className="mt-3 text-xl font-semibold">{snap.headline}</p>
      <p className={`mt-1 font-semibold ${toneCls}`}>
        {capitalize(trendWords(snap.trend, snap.changePct))} over the last {snap.windowYears} years
        {snap.trend !== 'steady' && <> ({snap.changePct > 0 ? 'about ' : 'roughly '}{Math.abs(snap.changePct)}%)</>}.
      </p>
      <p className="mt-2 text-ink-soft">{snap.context}</p>
      {snap.meaning && <p className="mt-2 text-ink-soft">{snap.meaning}</p>}
      {item.significance && (
        <p className="mt-2 font-serif italic text-ink">
          In your own words: “{item.significance}”
        </p>
      )}

      <div className="mt-4 rounded-2xl bg-cream p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Recent sales</p>
        <ul className="mt-2 space-y-1.5">
          {snap.comps.map((c, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="text-ink-soft">
                {c.label} — {c.when}, {c.where}
              </span>
              <span className="shrink-0 font-semibold">${c.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        {snap.basis} <DemoTag>Example data</DemoTag>
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        These ranges are for information, not an appraisal or advice.
        {item.appraisalStatus === 'none' && (
          <> Before selling or insuring, see the appraisal recommendation below.</>
        )}
      </p>
    </Card>
  )
}

/** A calm 10-year shape — a suggestion of the direction, never a stock chart. */
function Sparkline({ changePct, trend }: { changePct: number; trend: 'up' | 'steady' | 'down' }) {
  const points = 7
  const w = 96
  const h = 28
  const coords = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    // gentle ease toward the total change, with a soft mid-wobble
    const drift = changePct * t
    const wobble = Math.sin(t * Math.PI * 2) * 3
    const val = drift + wobble
    const x = 4 + t * (w - 8)
    const y = h / 2 - (val / Math.max(10, Math.abs(changePct) || 10)) * (h / 2 - 4)
    return `${x.toFixed(1)},${Math.max(3, Math.min(h - 3, y)).toFixed(1)}`
  })
  const stroke = trend === 'up' ? '#356152' : trend === 'down' ? '#a44c2d' : '#6b6157'
  return (
    <svg width={w} height={h} aria-hidden="true" className="shrink-0">
      <polyline points={coords.join(' ')} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
