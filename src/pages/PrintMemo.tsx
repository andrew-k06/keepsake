import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Button } from '../components/ui'
import { Printer, ChevronLeft } from '../components/icons'

/**
 * Personal property memorandum — the bridge from wishes to (possible) legal
 * effect. In many states a signed memorandum REFERENCED BY YOUR WILL can
 * direct who receives tangible personal property; in others (New York,
 * notably) it cannot. So this document never claims force of its own: it is
 * formatted for the user to take to the attorney who holds their will.
 */
export function PrintMemo() {
  const { state, logEvent } = useStore()
  const assigned = state.items.filter((it) => it.beneficiaryId)
  const personName = (id?: string) => {
    const p = id ? state.people.find((pp) => pp.id === id) : undefined
    return p ? `${p.name}${p.relationship && p.relationship !== 'Me' ? ` (my ${p.relationship.toLowerCase()})` : ''}` : ''
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="print-hidden mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link to="/summary" className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft hover:text-ink">
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          Back to For My Family
        </Link>
        <Button
          icon={Printer}
          onClick={() => {
            logEvent('You printed the personal property memorandum')
            window.print()
          }}
        >
          Print this memorandum
        </Button>
      </div>

      <div className="border-b-2 border-ink pb-4">
        <h1 className="font-serif text-3xl">Memorandum of Tangible Personal Property</h1>
        <p className="mt-2 text-ink-soft">
          Prepared by {state.people.find((p) => p.role === 'owner')?.name ?? state.ownerName} with
          Keepsake ·{' '}
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <p className="mt-6 leading-relaxed">
        I would like the following items of tangible personal property to go to the people named
        below. I understand this list has legal effect only if the law of my state allows it and my
        will refers to a memorandum like this one — and I intend to review it with my attorney.
      </p>

      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2 pr-4 font-semibold">Item</th>
            <th className="py-2 pr-4 font-semibold">Description</th>
            <th className="py-2 font-semibold">I would like it to go to</th>
          </tr>
        </thead>
        <tbody>
          {assigned.map((it) => (
            <tr key={it.id} className="border-b border-line align-top">
              <td className="py-3 pr-4 font-semibold">{it.name}</td>
              <td className="py-3 pr-4 text-ink-soft">
                {[it.category, it.acquired && `acquired ${it.acquired}`, it.serial && `mark/serial: ${it.serial}`]
                  .filter(Boolean)
                  .join(' · ')}
              </td>
              <td className="py-3">{personName(it.beneficiaryId)}</td>
            </tr>
          ))}
          {assigned.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-ink-soft">
                No items have been assigned yet — decide who you’d like each item to go to in the
                binder first.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <div className="border-b-2 border-ink pt-8" />
          <p className="mt-1 text-sm text-ink-soft">Signature</p>
        </div>
        <div>
          <div className="border-b-2 border-ink pt-8" />
          <p className="mt-1 text-sm text-ink-soft">Date</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border-2 border-line p-4 text-sm leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">Please read — and bring this to your attorney.</p>
        <p className="mt-1">
          Many states honor a signed memorandum of tangible personal property when a will refers to
          it; some (including New York) do not, and states differ on the details. This document is
          not a will, does not change your will, and is not legal advice. Give it to the attorney who
          prepared or holds your will and ask them to make it effective in your state.
        </p>
      </div>
    </div>
  )
}
