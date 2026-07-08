import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { currentValuation } from '../lib/value'
import { Button } from '../components/ui'
import { Printer, ChevronLeft } from '../components/icons'

/**
 * Estate-professional export — the clean inventory an attorney, CPA, or
 * insurance agent can act on in one sitting, instead of a shoebox. Values
 * carry their provenance (whose number, from when) because that's the first
 * question a professional asks.
 */
export function PrintInventory() {
  const { state, logEvent } = useStore()
  const rooms = new Map(state.rooms.map((r) => [r.id, r.name]))
  const owner = state.people.find((p) => p.role === 'owner')

  const sourceLabel: Record<import('../types').ValuationSource, string> = {
    'in-person-appraisal': 'appraised (in person)',
    'photo-appraisal': 'appraised (photos)',
    owner: 'owner estimate',
    ai: 'informal range',
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="print-hidden mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link to="/summary" className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft hover:text-ink">
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          Back to For My Family
        </Link>
        <Button
          icon={Printer}
          onClick={() => {
            logEvent('You printed the professional inventory')
            window.print()
          }}
        >
          Print this inventory
        </Button>
      </div>

      <div className="border-b-2 border-ink pb-4">
        <h1 className="font-serif text-3xl">Personal Property Inventory</h1>
        <p className="mt-2 text-ink-soft">
          {owner?.name ?? state.ownerName} · prepared with Keepsake ·{' '}
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} ·
          for review by estate and insurance professionals
        </p>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2 pr-3 font-semibold">Item</th>
            <th className="py-2 pr-3 font-semibold">Category / location</th>
            <th className="py-2 pr-3 font-semibold">Acquired · serial/mark</th>
            <th className="py-2 pr-3 font-semibold">Value (source)</th>
            <th className="py-2 pr-3 font-semibold">Documents</th>
            <th className="py-2 font-semibold">Insurance*</th>
          </tr>
        </thead>
        <tbody>
          {state.items.map((it) => {
            const v = currentValuation(it)
            return (
              <tr key={it.id} className="border-b border-line align-top">
                <td className="py-2.5 pr-3 font-semibold">{it.name}</td>
                <td className="py-2.5 pr-3 text-ink-soft">
                  {it.category} · {rooms.get(it.roomId) ?? '—'}
                </td>
                <td className="py-2.5 pr-3 text-ink-soft">
                  {[it.acquired, it.serial].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="py-2.5 pr-3">
                  {v ? (
                    <>
                      {v.low === v.high ? money(v.low) : `${money(v.low)}–${money(v.high)}`}
                      <span className="text-ink-soft"> ({sourceLabel[v.source]}, {new Date(v.date).getFullYear()})</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2.5 pr-3 text-ink-soft">
                  {it.documents.length > 0 ? it.documents.map((d) => d.label).join('; ') : '—'}
                </td>
                <td className="py-2.5">{it.insured ? 'Yes (owner-stated)' : 'None noted'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        *Insurance status is as stated by the owner and has not been verified against any policy.
        Values marked “owner estimate” or “informal range” are not appraisals. This inventory is for
        information and planning; it is not a legal document, an appraisal report, or advice.
      </p>
    </div>
  )
}
