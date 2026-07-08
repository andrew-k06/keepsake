import { useMemo, useState } from 'react'
import { useStore, money } from '../store'
import { marketSnapshot } from '../lib/market'
import { Button, Card, DemoTag, Field, inputClass } from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { Shield, Mail, Quote } from '../components/icons'
import { CATEGORIES } from '../types'
import type { Item } from '../types'

type Verdict = 'well-below' | 'below' | 'fair' | 'above'

/**
 * The scam shield. Seniors lose more to valuables scams (door-knock gold
 * buyers, lowball estate pickers) than almost any other fraud — and Keepsake
 * holds the two things a scammer exploits: the item and the owner's
 * uncertainty about its worth.
 *
 * Tone rules: never "you almost got scammed" (shame kills return visits);
 * always "buyers try this on everyone — good thing we checked." And give them
 * the face-saving sentence to say at the door.
 */
export function OfferCheck() {
  const { state, logEvent, completeStep } = useStore()
  const [itemId, setItemId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Other')
  const [customValue, setCustomValue] = useState('')
  const [offer, setOffer] = useState('')
  const [checked, setChecked] = useState(false)
  const [valueError, setValueError] = useState('')

  const custom = itemId === 'other'
  const item = custom ? undefined : state.items.find((it) => it.id === itemId)

  // For not-in-binder items, borrow the same market profile machinery.
  const subject: Item | undefined = useMemo(() => {
    if (item) return item
    if (custom && customName.trim()) {
      return {
        id: `check-${customName}`,
        name: customName.trim(),
        category: customCategory,
        roomId: '',
        story: '',
        valuations: customValue
          ? [{ id: 'v-check', source: 'owner' as const, low: Number(customValue), high: Number(customValue), date: new Date().toISOString() }]
          : [],
        appraisalStatus: 'none' as const,
        documents: [],
      }
    }
    return undefined
  }, [item, custom, customName, customCategory, customValue])

  const snap = subject ? marketSnapshot(subject) : null
  const offerNum = offer ? Number(offer) : null

  const verdict: Verdict | null =
    checked && snap && offerNum != null
      ? offerNum < snap.low * 0.6
        ? 'well-below'
        : offerNum < snap.low
          ? 'below'
          : offerNum <= snap.high * 1.25
            ? 'fair'
            : 'above'
      : null

  const runCheck = () => {
    if (!subject || offerNum == null) return
    // Never a silent click: without any value to compare against there is no
    // honest verdict — say so, and don't credit a check that never happened.
    if (!marketSnapshot(subject)) {
      setValueError(
        'To compare the offer, we need your rough sense of what it’s worth — even a guess helps.',
      )
      setChecked(false)
      return
    }
    setValueError('')
    setChecked(true)
    completeStep('offer-check-try')
    logEvent(`You checked an offer of ${money(offerNum)} on “${subject.name}”`)
  }

  const helper = state.people.find((p) => p.role === 'collaborator' && p.email)
  const tellFamily = () => {
    if (!helper?.email || !subject || offerNum == null) return
    const subjectLine = encodeURIComponent(`Someone offered ${money(offerNum)} for the ${subject.name}`)
    const body = encodeURIComponent(
      `Hi ${helper.name},\n\nSomeone offered me ${money(offerNum)} for the ${subject.name}. ` +
        (snap ? `Keepsake says pieces like it sell for about ${money(snap.low)}–${money(snap.high)}. ` : '') +
        `I haven't decided anything — just wanted you to know.\n\n— ${state.ownerName}`,
    )
    window.location.href = `mailto:${helper.email}?subject=${subjectLine}&body=${body}`
    logEvent(`You let ${helper.name} know about the offer on “${subject.name}”`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GuideReturnPill />
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
          <Shield className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <h1 className="text-4xl">Someone wants to buy something?</h1>
      </div>
      <p className="mt-2 text-lg text-ink-soft">
        Before you decide, let’s check the offer together. Buyers who come to <em>you</em> often
        offer far less than things are worth — good sellers never mind you checking.
      </p>

      <Card className="mt-6 p-6">
        <Field label="Which item is it?">
          <select
            className={inputClass}
            value={itemId}
            onChange={(e) => {
              setItemId(e.target.value)
              setChecked(false)
            }}
          >
            <option value="">Choose from your binder…</option>
            {state.items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
            <option value="other">It isn’t in my binder</option>
          </select>
        </Field>

        {custom && (
          <>
            <Field label="What is it?">
              <input
                className={inputClass}
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value)
                  setChecked(false)
                }}
                placeholder="Silver tea service"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value)
                    setChecked(false)
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Your sense of its value" error={valueError}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value.replace(/[^0-9]/g, ''))
                    setChecked(false)
                    if (e.target.value) setValueError('')
                  }}
                  placeholder="800"
                />
              </Field>
            </div>
          </>
        )}

        <Field label="What are they offering?" hint="Dollars, numbers only.">
          <input
            className={inputClass}
            inputMode="numeric"
            value={offer}
            onChange={(e) => {
              setOffer(e.target.value.replace(/[^0-9]/g, ''))
              setChecked(false)
            }}
            placeholder="200"
          />
        </Field>

        <Button full size="lg" onClick={runCheck} disabled={!subject || !offer}>
          Check this offer
        </Button>
      </Card>

      {verdict && snap && subject && offerNum != null && (
        <Card
          className={`mt-6 p-6 ${verdict === 'fair' ? 'border-2 border-sage' : 'border-2 border-clay-dark'}`}
        >
          <div className="flex items-start gap-4">
            {item && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                <ItemVisual item={item} rounded="rounded-none" />
              </div>
            )}
            <div>
              <p className="text-xl font-semibold">
                {verdict === 'well-below' && 'I’d say no thank you.'}
                {verdict === 'below' && 'This offer is on the low side.'}
                {verdict === 'fair' && 'This looks like a fair range.'}
                {verdict === 'above' && 'Generous — which deserves a careful look too.'}
              </p>
              <p className="mt-2 text-ink-soft">
                {money(offerNum)} against roughly {money(snap.low)}–{money(snap.high)} for pieces like
                this.{' '}
                {verdict === 'well-below' &&
                  'Offers far below value from someone who came to you are a common trick played on homeowners — buyers try it on everyone. Good thing we checked.'}
                {verdict === 'below' &&
                  'You can counter, get a second offer, or take your time — there is no hurry that benefits you.'}
                {verdict === 'fair' &&
                  'If you want to sell, this is in the honest range. Take your time all the same.'}
                {verdict === 'above' &&
                  'A stranger overpaying — especially by check or with urgency — can also be a trick. Real buyers don’t mind waiting for the funds to clear.'}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {snap.basis} <DemoTag>Example data</DemoTag>
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-cream p-4">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              <Quote className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Something you can say
            </p>
            <p className="mt-1 text-lg font-serif">
              “My family keeps a record of everything, so I never decide on the spot. Leave me your
              number.”
            </p>
          </div>

          {helper?.email && (
            <div className="mt-4">
              <Button variant="secondary" icon={Mail} onClick={tellFamily}>
                Mention it to {helper.name}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
