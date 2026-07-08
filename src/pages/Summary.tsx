import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { bestAmount } from '../lib/value'
import { storiesTold as storiesTotal } from '../lib/selectors'
import { Button, Card, Avatar } from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { Printer, Mail, Heart, ScrollText, FileText } from '../components/icons'

export function Summary() {
  const { state, logEvent, completeStep } = useStore()
  const navigate = useNavigate()
  const [showValues, setShowValues] = useState(false)

  const heirs = state.people.filter((p) => p.role !== 'owner')
  const storiesTold = storiesTotal(state.items)

  const shareByEmail = () => {
    // A real, honest share: opens the user's own mail app with a plain-text summary.
    const lines = [
      `${state.binderName} — a summary from Keepsake`,
      '',
      ...heirs.flatMap((heir) => {
        const theirs = state.items.filter((it) => it.beneficiaryId === heir.id)
        if (theirs.length === 0) return []
        return [
          `For ${heir.name} (${heir.relationship}):`,
          ...theirs.map((it) => `  • ${it.name} — ${it.story.slice(0, 120)}${it.story.length > 120 ? '…' : ''}`),
          '',
        ]
      }),
      'These are wishes, lovingly recorded — not a will or legal document.',
    ]
    const subject = encodeURIComponent(`${state.binderName} — from ${state.ownerName}`)
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div>
      <span className="print-hidden">
        <GuideReturnPill />
      </span>
      {/* Print-only letterhead */}
      <div className="print-only mb-6 border-b-2 border-ink pb-4">
        <p className="font-serif text-3xl">{state.binderName}</p>
        <p className="mt-1 text-ink-soft">
          Prepared with Keepsake · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay print-hidden">
          <Heart className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="text-4xl">For my family</h1>
      </div>
      <p className="text-ink-soft mt-2 text-lg">
        A summary of everything in {state.ownerName}’s binder — written so loved ones understand not
        just what each thing is, but what it means.
      </p>

      <div className="print-hidden mt-5 flex flex-wrap items-center gap-3">
        {/* Opens the designed document: cover, contents, a page per person */}
        <Button icon={Printer} onClick={() => navigate('/print/binder')}>
          Print this binder
        </Button>
        <Button
          variant="secondary"
          icon={Mail}
          onClick={() => {
            shareByEmail()
            logEvent('You shared the family summary by email')
            completeStep('share-summary')
          }}
        >
          Share by email
        </Button>
        <label className="ml-1 inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
            className="h-5 w-5 accent-clay-dark"
          />
          Show dollar values
        </label>
      </div>

      {/* Documents for the professionals in the family's corner */}
      <div className="print-hidden mt-4 flex flex-wrap gap-4">
        <Link
          to="/print/memo"
          className="inline-flex min-h-11 items-center gap-1.5 py-2 font-semibold text-clay-dark underline hover:text-ink"
        >
          <ScrollText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          Property memorandum for your attorney
        </Link>
        <Link
          to="/print/inventory"
          className="inline-flex min-h-11 items-center gap-1.5 py-2 font-semibold text-clay-dark underline hover:text-ink"
        >
          <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          Inventory for estate & insurance professionals
        </Link>
      </div>

      {/* Overview — the stories lead; money never opens a family document */}
      <Card className="mt-6 p-6 print-avoid-break">
        <p className="text-lg leading-relaxed font-serif">
          This binder holds <strong>{state.items.length} treasured belongings</strong> and the stories
          behind {storiesTold === state.items.length ? 'every one of them' : `${storiesTold} of them`}.{' '}
          {heirs.length > 0 && <>{heirs.length} loved ones are part of it. </>}
          Below is what {state.ownerName} would like each person to have — and, more importantly, why
          it matters.
        </p>
      </Card>

      {/* By heir */}
      {heirs.map((heir) => {
        const theirs = state.items.filter((it) => it.beneficiaryId === heir.id)
        if (theirs.length === 0) return null
        const sum = theirs.reduce((s, it) => s + (bestAmount(it) ?? 0), 0)
        return (
          <div key={heir.id} className="mt-8">
            <div className="flex items-center gap-3">
              <span className="print-hidden">
                <Avatar name={heir.name} color={heir.color} />
              </span>
              <div>
                <h2 className="text-2xl">
                  For {heir.name} <span className="text-ink-soft text-lg">· {heir.relationship}</span>
                </h2>
                <p className="text-ink-soft">
                  {theirs.length} item{theirs.length === 1 ? '' : 's'}
                  {showValues && <> · {money(sum)}</>}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {theirs.map((it) => (
                <Card key={it.id} className="p-5 flex gap-4 print-avoid-break">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                    <ItemVisual item={it} rounded="rounded-none" eager />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {it.name}
                      {showValues && (
                        <span className="text-ink-soft font-normal"> — {money(bestAmount(it))}</span>
                      )}
                    </h3>
                    {it.story ? (
                      <p className="text-ink-soft mt-1 italic font-serif">“{it.story}”</p>
                    ) : (
                      <p className="text-ink-soft mt-1">No story recorded yet.</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Still being decided — a conversation prompt, not a scold */}
      {(() => {
        const unassigned = state.items.filter((it) => !it.beneficiaryId)
        if (unassigned.length === 0) return null
        return (
          <div className="mt-8">
            <h2 className="text-2xl">Still being decided</h2>
            <p className="text-ink-soft">
              {state.ownerName} hasn’t decided on {unassigned.length === 1 ? 'this one' : 'these'} yet —
              a lovely reason to ask about {unassigned.length === 1 ? 'its story' : 'their stories'}.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {unassigned.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-2 rounded-full bg-cream-deep px-4 py-2"
                >
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white">
                    <ItemVisual item={it} rounded="rounded-none" eager />
                  </span>
                  {it.name}
                </li>
              ))}
            </ul>
          </div>
        )
      })()}

      {/* Disclaimer — on screen quietly, on EVERY printout prominently */}
      <p className="mt-10 text-sm text-ink-soft">
        This document records {state.ownerName}’s wishes so the family understands what each thing
        means. It is not a will, trust, or legal instrument, and it doesn’t change who legally
        inherits anything — for that, see an estate attorney.
      </p>
      <div className="print-only mt-6 border-t-2 border-ink pt-3">
        <p className="text-sm">
          <strong>Please read:</strong> this document expresses wishes only. It is not a will, trust,
          or legal instrument. Prepared with Keepsake.
        </p>
      </div>
    </div>
  )
}
