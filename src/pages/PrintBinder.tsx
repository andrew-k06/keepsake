import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { bestAmount } from '../lib/value'
import { Button } from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import { BookHeart, Printer, ChevronLeft } from '../components/icons'
import { EMERGENCY_SECTIONS } from '../lib/emergency'
import type { Item, Person } from '../types'

/**
 * The printed binder — a designed document, not a printed web page.
 *
 * Book structure: cover → table of contents → ONE PAGE PER PERSON (their
 * treasures, the stories, and the practical facts) → still being decided →
 * the emergency guide → a closing note. Values appear only when the owner
 * chooses; every page carries the wishes-not-a-will footer.
 *
 * On screen this previews as paper sheets; `.sheet` becomes a real page
 * break in print (see index.css).
 */
export function PrintBinder() {
  const { state, logEvent, completeStep } = useStore()
  const [showValues, setShowValues] = useState(false)

  const owner = state.people.find((p) => p.role === 'owner')
  const heirs = state.people
    .filter((p) => p.role !== 'owner')
    .map((p) => ({ person: p, items: state.items.filter((it) => it.beneficiaryId === p.id) }))
    .filter((h) => h.items.length > 0)
  const unassigned = state.items.filter((it) => !it.beneficiaryId)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const print = () => {
    // window.print() blocks until the dialog closes — credit the step and
    // write the activity line after the act, not on intent.
    window.print()
    logEvent('You printed the family binder')
    completeStep('share-summary')
  }

  return (
    <div className="has-running-footer mx-auto max-w-3xl px-6 py-8">
      {/* Toolbar — screen only */}
      <div className="print-hidden mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link to="/summary" className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft hover:text-ink">
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          Back to For My Family
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showValues}
              onChange={(e) => setShowValues(e.target.checked)}
              className="h-5 w-5 accent-clay-dark"
            />
            Include dollar values
          </label>
          <Button icon={Printer} onClick={print}>
            Print the binder
          </Button>
        </div>
      </div>

      {/* ---- Cover ---- */}
      <section className="sheet mb-8 flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-line bg-white p-10 text-center shadow-soft">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-clay text-white">
          <BookHeart className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.22em] text-ink-soft">For my family</p>
        <h1 className="mt-3 font-serif text-5xl">{state.binderName}</h1>
        <p className="mt-4 max-w-md text-lg text-ink-soft">
          The stories behind the things that matter — and who they’re meant for, in {state.ownerName}’s
          own words.
        </p>
        <div className="mt-14 text-ink-soft">
          <p className="font-semibold text-ink">{owner?.name ?? state.ownerName}</p>
          <p className="mt-1 text-sm">Prepared with Keepsake · {today}</p>
        </div>
      </section>

      {/* ---- Table of contents ---- */}
      <section className="sheet mb-8 rounded-3xl border border-line bg-white p-10 shadow-soft">
        <h2 className="font-serif text-3xl">What’s inside</h2>
        <ul className="mt-6 space-y-4">
          {heirs.map(({ person, items }) => (
            <TocLine
              key={person.id}
              title={`For ${person.name}`}
              sub={person.relationship}
              right={`${items.length} treasure${items.length === 1 ? '' : 's'}`}
            />
          ))}
          {unassigned.length > 0 && (
            <TocLine
              title="Still being decided"
              sub="a lovely reason to ask"
              right={`${unassigned.length} treasure${unassigned.length === 1 ? '' : 's'}`}
            />
          )}
          {state.emergency.length > 0 && (
            <TocLine
              title="In an emergency"
              sub="the practical guide"
              right={`${state.emergency.length} note${state.emergency.length === 1 ? '' : 's'}`}
            />
          )}
          <TocLine title="A note about this document" sub="please read" right="last page" />
        </ul>
        <p className="mt-8 text-ink-soft">
          Each person has their own pages. Read yours first — then, if you like, read everyone
          else’s. The stories are the point.
        </p>
      </section>

      {/* ---- One page per person ---- */}
      {heirs.map(({ person, items }) => (
        <PersonSheet
          key={person.id}
          person={person}
          items={items}
          ownerName={state.ownerName}
          showValues={showValues}
          roomName={(id) => state.rooms.find((r) => r.id === id)?.name}
          personName={(id) => state.people.find((p) => p.id === id)?.name}
        />
      ))}

      {/* ---- Still being decided ---- */}
      {unassigned.length > 0 && (
        <section className="sheet mb-8 rounded-3xl border border-line bg-white p-10 shadow-soft">
          <h2 className="font-serif text-3xl">Still being decided</h2>
          <p className="mt-2 text-ink-soft">
            {state.ownerName} hasn’t decided on these yet — which makes them a lovely thing to ask
            about, while the stories can still be told in person.
          </p>
          <div className="mt-6 space-y-5">
            {unassigned.map((it) => (
              <div key={it.id} className="print-avoid-break flex gap-4 border-b border-line pb-5 last:border-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                  <ItemVisual item={it} rounded="rounded-none" eager />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold">
                    {it.name}
                    {showValues && bestAmount(it) != null && (
                      <span className="font-normal text-ink-soft"> — {money(bestAmount(it))}</span>
                    )}
                  </p>
                  {it.story && <p className="mt-1 font-serif italic text-ink-soft">“{it.story}”</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Emergency guide ---- */}
      {state.emergency.length > 0 && (
        <section className="sheet mb-8 rounded-3xl border border-line bg-white p-10 shadow-soft">
          <h2 className="font-serif text-3xl">In an emergency</h2>
          <p className="mt-2 text-ink-soft">
            The practical things {state.ownerName} wanted you to know — so you always know what to do.
          </p>
          <p className="mt-2 text-ink-soft">
            A note for the family: papers like a power of attorney or health care directive help only
            when copies are already in the hands of the people named in them. If you’re named in one
            and don’t hold your copy, the kindest time to ask where it lives is now, while everyone
            is well.
          </p>
          <div className="mt-6 space-y-6">
            {EMERGENCY_SECTIONS.map((sec) => {
              const notes = state.emergency.filter((e) => e.sectionId === sec.id)
              if (notes.length === 0) return null
              return (
                <div key={sec.id} className="print-avoid-break">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {sec.title}
                  </p>
                  <div className="mt-2 space-y-4">
                    {notes.map((e) => (
                      <div key={e.id}>
                        <h3 className="font-serif text-xl">{e.label}</h3>
                        <p className="mt-1 leading-relaxed text-ink-soft">{e.detail}</p>
                        {e.preparedOn && (
                          <p className="mt-0.5 text-sm text-ink-soft">Prepared/updated: {e.preparedOn}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {state.emergency
              .filter((e) => !EMERGENCY_SECTIONS.some((sec) => sec.id === e.sectionId))
              .map((e) => (
                <div key={e.id} className="print-avoid-break">
                  <h3 className="font-serif text-xl">{e.label}</h3>
                  <p className="mt-1 leading-relaxed text-ink-soft">{e.detail}</p>
                  {e.preparedOn && (
                    <p className="mt-0.5 text-sm text-ink-soft">Prepared/updated: {e.preparedOn}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ---- Closing note ---- */}
      <section className="sheet rounded-3xl border border-line bg-white p-10 shadow-soft">
        <h2 className="font-serif text-3xl">A note about this document</h2>
        <p className="mt-4 leading-relaxed">
          This binder records {state.ownerName}’s wishes so the family understands what each thing
          means and where it belongs. It was made with love — and it is <strong>not a will, trust, or
          legal instrument</strong>. It doesn’t change who legally inherits anything; for that, the
          family should look to the will and an estate attorney.
        </p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Wishes recorded here can be changed by {state.ownerName} at any time. If a page in your
          hands disagrees with the binder itself, the binder is newer.
        </p>
        <p className="mt-10 text-sm text-ink-soft">
          {state.binderName} · printed {today} · prepared with Keepsake
        </p>
      </section>

      {/* Running footer on every printed page */}
      <div className="print-running-footer" aria-hidden="true">
        <span>{state.binderName} — wishes, lovingly recorded. Not a will.</span>
        <span>{today}</span>
      </div>
    </div>
  )
}

function TocLine({ title, sub, right }: { title: string; sub?: string; right: string }) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="text-lg font-semibold">
        {title}
        {sub && <span className="ml-2 text-base font-normal text-ink-soft">· {sub}</span>}
      </span>
      <span className="mx-1 flex-1 border-b-2 border-dotted border-line-strong" aria-hidden="true" />
      <span className="shrink-0 font-semibold text-ink-soft">{right}</span>
    </li>
  )
}

function PersonSheet({
  person,
  items,
  ownerName,
  showValues,
  roomName,
  personName,
}: {
  person: Person
  items: Item[]
  ownerName: string
  showValues: boolean
  roomName: (id: string) => string | undefined
  personName: (id: string) => string | undefined
}) {
  return (
    <section className="sheet mb-8 rounded-3xl border border-line bg-white p-10 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-dark">
        {ownerName}’s binder
      </p>
      <h2 className="mt-2 font-serif text-3xl">
        For {person.name}
        <span className="ml-3 font-sans text-lg font-normal text-ink-soft">· {person.relationship}</span>
      </h2>
      <p className="mt-2 text-ink-soft">
        {ownerName} would like these to be yours — and wanted you to know why they matter.
      </p>

      <div className="mt-6 space-y-6">
        {items.map((it) => {
          const facts = [
            it.category,
            roomName(it.roomId),
            it.acquired && `acquired ${it.acquired}`,
            it.condition && `condition: ${it.condition}`,
            it.serial && `mark/serial: ${it.serial}`,
            it.insured ? 'insured (noted by owner)' : undefined,
          ].filter(Boolean)
          return (
            <div key={it.id} className="print-avoid-break border-b border-line pb-6 last:border-0 last:pb-0">
              <div className="flex gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                  <ItemVisual item={it} rounded="rounded-none" eager />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-xl">
                    {it.name}
                    {showValues && bestAmount(it) != null && (
                      <span className="ml-2 font-sans text-base font-normal text-ink-soft">
                        {money(bestAmount(it))}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{facts.join(' · ')}</p>
                </div>
              </div>
              {it.story && (
                <p className="mt-3 font-serif text-base italic leading-relaxed">“{it.story}”</p>
              )}
              {it.significance && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">What it means to {ownerName}:</span>{' '}
                  {it.significance}
                </p>
              )}
              {(it.memories ?? []).length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {(it.memories ?? []).map((m) => (
                    <p key={m.id} className="text-ink-soft">
                      <span className="font-semibold">{personName(m.personId) ?? 'Family'} remembers:</span>{' '}
                      “{m.text}”
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
