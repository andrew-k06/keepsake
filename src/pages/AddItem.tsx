import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card, DemoTag, Field, inputClass } from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import {
  Camera,
  Sparkles,
  ChevronLeft,
  ArrowRight,
  ImagePlus,
  CircleCheckBig,
} from '../components/icons'
import { compressImage } from '../lib/photo'
import { makeValuation } from '../lib/value'
import { exampleIdentification, type IdSuggestion } from '../lib/identify'
import { VoiceCapture } from '../components/VoiceCapture'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { CATEGORIES, STARTER_ITEM_LIMIT } from '../types'
import type { AppraisalStatus, Item } from '../types'

type Step = 'capture' | 'identify' | 'details'

export function AddItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const presetRoom = (location.state as { roomId?: string } | null)?.roomId
  const { state, addItem } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('capture')
  const [photo, setPhoto] = useState<string | undefined>()
  const [photoError, setPhotoError] = useState('')
  const [identifying, setIdentifying] = useState(false)
  const [suggestion, setSuggestion] = useState<IdSuggestion | null>(null)

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [category, setCategory] = useState('')
  const [estValue, setEstValue] = useState<string>('')
  const [roomId, setRoomId] = useState(presetRoom ?? state.rooms[0]?.id ?? '')
  const [story, setStory] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState('')

  const dirty = Boolean(photo || name || story || estValue)

  const confirmLeave = () =>
    !dirty || window.confirm('Leave without saving? The photo and anything you typed here will be discarded.')

  const onPickPhoto = async (file: File) => {
    setPhotoError('')
    try {
      // Downscale + re-encode: keeps storage safe and strips location metadata.
      const dataUrl = await compressImage(file)
      setPhoto(dataUrl)
      runIdentify()
    } catch {
      setPhotoError('We could not read that photo. Please try another one.')
    }
  }

  // Simulated identification — ONLY runs when a photo actually exists.
  const runIdentify = () => {
    setStep('identify')
    setIdentifying(true)
    const pick = exampleIdentification(Date.now() / 100)
    window.setTimeout(() => {
      setSuggestion(pick)
      setIdentifying(false)
    }, 1600)
  }

  const acceptSuggestion = () => {
    if (suggestion) {
      setName(suggestion.name)
      setCategory(suggestion.category)
    }
    setStep('details')
  }

  // Skipping the photo goes straight to a blank form. The app never says
  // "looking at your photo" when there is no photo.
  const skipPhoto = () => setStep('details')

  // The user rejects the suggestion: nothing is kept — they say what it is.
  const rejectSuggestion = () => {
    setSuggestion(null)
    setName('')
    setCategory('')
    setEstValue('')
    setStep('details')
  }

  // A lightweight item-shaped object so <ItemVisual> can render the live preview
  // (photo if we have one, otherwise the category fallback tile — never an emoji).
  const previewItem = {
    id: 'preview',
    name: name || 'Your item',
    category: category || 'Other',
    roomId,
    photo,
    story: '',
    valuations: [],
    appraisalStatus: 'none',
    documents: [],
  } as Item

  const save = () => {
    if (!name.trim()) {
      setNameError('Please give it a name — even something simple like “Mom’s blue vase.”')
      return
    }
    const appraisalStatus: AppraisalStatus = 'none'
    // The owner's own figure and the AI's example range are separate entries —
    // provenance is never blurred.
    const valuations = [
      ...(estValue ? [makeValuation('owner', Number(estValue))] : []),
      ...(suggestion && category === suggestion.category
        ? [
            makeValuation('ai', suggestion.low, suggestion.high, {
              confidence: suggestion.confidence === 'guessing' ? 'guessing' : 'fairly sure',
              basis: 'Example range from the preview identification',
            }),
          ]
        : []),
    ]
    const id = addItem({
      name: name.trim(),
      category: category || 'Other',
      roomId,
      photo,
      story,
      valuations,
      beneficiaryId: beneficiaryId || undefined,
      appraisalStatus,
      documents: [],
      insured: false,
    })
    navigate(`/item/${id}`)
  }

  // Starter binders hold 15 items; the one-time Keepsake Binder removes the cap.
  const atStarterLimit = state.plan.tier === 'starter' && state.items.length >= STARTER_ITEM_LIMIT
  if (atStarterLimit) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mt-3 text-4xl">Your starter binder is full.</h1>
        <Card className="mt-6 p-8">
          <p className="text-xl">
            You’ve kept {STARTER_ITEM_LIMIT} treasures — wonderful. The free starter binder holds{' '}
            {STARTER_ITEM_LIMIT} items.
          </p>
          <p className="mt-3 text-ink-soft">
            The Keepsake Binder is a single purchase you own forever — no monthly fees, unlimited
            items, and the printable family summary. Nothing you’ve added is ever held back from you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/plan')}>See the Keepsake Binder</Button>
            <Button variant="ghost" onClick={() => navigate('/binder')}>
              Back to my binder
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GuideReturnPill />
      <button
        onClick={() => confirmLeave() && navigate(-1)}
        className="inline-flex min-h-11 items-center gap-1 py-2 text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        Cancel
      </button>
      <h1 className="mt-3 text-4xl">Add something precious</h1>

      <StepDots step={step} />

      {step === 'capture' && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-xl">Let’s start with a photo.</p>
          <p className="text-ink-soft mt-1">Take a picture and we’ll help fill in the details for you.</p>

          <button
            type="button"
            className="mt-6 grid w-full place-items-center rounded-3xl border-2 border-dashed border-line bg-cream py-14 cursor-pointer transition hover:border-clay hover:bg-cream-deep"
            onClick={() => fileRef.current?.click()}
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-cream-deep text-clay">
              <Camera className="h-9 w-9" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="mt-4 text-lg font-semibold text-clay-dark">Tap to take or choose a photo</span>
            <span className="mt-1 text-sm text-ink-soft">
              Saved only on this device. We remove hidden location data from every photo.
            </span>
          </button>
          {photoError && (
            <p aria-live="polite" className="mt-3 font-semibold text-clay-dark">
              {photoError}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && onPickPhoto(e.target.files[0])}
          />

          <button
            onClick={skipPhoto}
            className="mt-6 inline-flex min-h-11 items-center gap-2 py-2 text-ink-soft underline hover:text-ink"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            I’ll add a photo later
          </button>
        </Card>
      )}

      {step === 'identify' && (
        <Card className="mt-6 p-8">
          <div className="flex items-center gap-5">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
              <ItemVisual item={previewItem} rounded="rounded-none" />
            </div>
            <div aria-live="polite">
              {identifying || !suggestion ? (
                <>
                  <p className="flex items-center gap-2 text-xl font-semibold">
                    <Sparkles className="h-5 w-5 text-clay" strokeWidth={2} aria-hidden="true" />
                    One moment…
                  </p>
                  <p className="text-ink-soft">Preparing a suggestion to start from.</p>
                  <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-cream-deep">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-clay-dark" />
                  </div>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2 text-xl font-semibold">
                    <Sparkles className="h-5 w-5 text-clay" strokeWidth={2} aria-hidden="true" />
                    {suggestion.confidence === 'fairly sure' ? 'I’m fairly sure about this one' : 'I’m guessing here'}
                  </p>
                  <p className="mt-1 text-lg">
                    This looks like a <span className="font-semibold">{suggestion.name}</span> — I can
                    see {suggestion.evidence}.
                  </p>
                  <p className="mt-2 text-ink-soft">
                    Pieces like this often sell for{' '}
                    <span className="font-semibold text-ink">
                      ${suggestion.low.toLocaleString()}–${suggestion.high.toLocaleString()}
                    </span>
                    . To be sure, a photo of {suggestion.followUp} would settle it.
                  </p>
                  <p className="mt-3">
                    <DemoTag>Preview — an example of how the full app explains what it sees</DemoTag>
                  </p>
                </>
              )}
            </div>
          </div>

          {!identifying && suggestion && (
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={rejectSuggestion}>
                No — I’ll tell you what it is
              </Button>
              <Button icon={ArrowRight} onClick={acceptSuggestion}>
                That’s right — continue
              </Button>
            </div>
          )}
        </Card>
      )}

      {step === 'details' && (
        <Card className="mt-6 p-7">
          {suggestion && name === suggestion.name && (
            <p className="mb-5 rounded-2xl bg-amber/15 px-4 py-3 text-sm text-ink-soft">
              We suggested the name and category below — please check them and change anything that
              isn’t right.
            </p>
          )}
          <Field label="What is it?" error={nameError}>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (e.target.value.trim()) setNameError('')
              }}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Choose one…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimated value (optional)" hint="Dollars, numbers only — for example 1200.">
              <input
                className={inputClass}
                inputMode="numeric"
                value={estValue}
                onChange={(e) => setEstValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1200"
              />
            </Field>
          </div>

          <Field label="Which room?">
            <select className={inputClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {state.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Not a <Field>: a button may not live inside a <label> (it breaks
              the accessibility tree and click routing), so the voice control
              sits between the heading and the labeled textarea. */}
          <div className="mb-5">
            <span className="mb-1 block font-semibold">Tell its story</span>
            <VoiceCapture
              onText={(text) => setStory((s) => (s ? `${s.trim()} ${text}` : text))}
            />
            <label className="mt-3 block">
              <span className="sr-only">Its story</span>
              <textarea
                className={`${inputClass} min-h-28`}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Where did it come from? Why does it matter? Who should know about it?"
              />
            </label>
          </div>

          <Field label="Who would you like this to go to? (optional)" hint="A wish you can change anytime — not a legal document.">
            <select
              className={inputClass}
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
            >
              <option value="">Decide later</option>
              {state.people
                .filter((p) => p.role !== 'owner')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
            </select>
          </Field>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => confirmLeave() && navigate('/binder')}>
              Cancel
            </Button>
            <Button onClick={save}>Save to my binder</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['capture', 'identify', 'details']
  const labels = { capture: 'Photo', identify: 'Our guess', details: 'Details' }
  const current = steps.indexOf(step)
  return (
    <div className="mt-5 flex items-center gap-2">
      {steps.map((s, i) => {
        const done = current > i
        const active = current >= i
        return (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-base font-bold ${
                active ? 'bg-clay-dark text-white' : 'bg-cream-deep text-ink-soft'
              }`}
            >
              {done ? (
                <CircleCheckBig className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                i + 1
              )}
            </span>
            <span className={active ? 'font-semibold' : 'text-ink-soft'}>{labels[s]}</span>
            {i < steps.length - 1 && <span className="mx-1 text-line" aria-hidden="true">—</span>}
          </div>
        )
      })}
    </div>
  )
}
