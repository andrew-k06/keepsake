import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card } from '../components/ui'
import type { AppraisalStatus } from '../types'

// A simple "AI suggestion" pool so the demo feels magical without a backend.
const SUGGESTIONS = [
  { emoji: '💍', name: 'Diamond Ring', category: 'Jewelry', value: 4500 },
  { emoji: '🖼️', name: 'Framed Painting', category: 'Art', value: 1200 },
  { emoji: '⌚', name: 'Vintage Wristwatch', category: 'Watches', value: 2200 },
  { emoji: '🏺', name: 'Antique Vase', category: 'Antiques', value: 900 },
  { emoji: '📿', name: 'Pearl Necklace', category: 'Jewelry', value: 1600 },
  { emoji: '🪑', name: 'Heirloom Chair', category: 'Furniture', value: 700 },
  { emoji: '🎻', name: 'Violin', category: 'Instruments', value: 3000 },
  { emoji: '📷', name: 'Collectible Camera', category: 'Collectibles', value: 500 },
]

type Step = 'capture' | 'identify' | 'details'

export function AddItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const presetRoom = (location.state as { roomId?: string } | null)?.roomId
  const { state, addItem } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('capture')
  const [photo, setPhoto] = useState<string | undefined>()
  const [emoji, setEmoji] = useState('📦')
  const [identifying, setIdentifying] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [estValue, setEstValue] = useState<string>('')
  const [roomId, setRoomId] = useState(presetRoom ?? state.rooms[0].id)
  const [story, setStory] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState('')

  const onPickPhoto = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result as string)
      runIdentify()
    }
    reader.readAsDataURL(file)
  }

  // Simulate computer-vision auto-fill.
  const runIdentify = () => {
    setStep('identify')
    setIdentifying(true)
    const pick = SUGGESTIONS[Math.floor((Date.now() / 100) % SUGGESTIONS.length)]
    window.setTimeout(() => {
      setEmoji(pick.emoji)
      setName(pick.name)
      setCategory(pick.category)
      setEstValue(String(pick.value))
      setIdentifying(false)
    }, 1600)
  }

  const skipPhoto = () => {
    runIdentify()
  }

  const save = () => {
    const inPerson = ['Jewelry', 'Watches', 'Collectibles']
    const appraisalStatus: AppraisalStatus = 'none'
    void inPerson
    const id = addItem({
      name: name || 'Untitled item',
      category: category || 'Other',
      roomId,
      emoji,
      photo,
      story,
      estValue: estValue ? Number(estValue) : null,
      beneficiaryId: beneficiaryId || undefined,
      appraisalStatus,
      documents: [],
      insured: false,
    })
    navigate(`/item/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-ink-soft hover:text-ink">
        ← Cancel
      </button>
      <h1 className="mt-3 text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
        Add something precious
      </h1>

      <StepDots step={step} />

      {step === 'capture' && (
        <Card className="mt-6 p-8 text-center">
          <p className="text-xl">Let’s start with a photo.</p>
          <p className="text-ink-soft mt-1">Take a picture and we’ll help fill in the details for you.</p>

          <div
            className="mt-6 grid place-items-center rounded-3xl border-2 border-dashed border-line bg-cream py-14 cursor-pointer hover:border-clay"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-6xl">📷</span>
            <span className="mt-3 text-lg font-semibold text-clay">Tap to take or choose a photo</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && onPickPhoto(e.target.files[0])}
          />

          <button onClick={skipPhoto} className="mt-6 text-ink-soft underline">
            I’ll add a photo later
          </button>
        </Card>
      )}

      {step === 'identify' && (
        <Card className="mt-6 p-8">
          <div className="flex items-center gap-5">
            <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream-deep text-5xl">
              {photo ? <img src={photo} className="h-full w-full object-cover" alt="" /> : emoji}
            </div>
            <div>
              {identifying ? (
                <>
                  <p className="text-xl font-semibold">✨ Looking at your photo…</p>
                  <p className="text-ink-soft">We’re identifying what this is and what it may be worth.</p>
                  <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-cream-deep">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-clay" />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold">Here’s what we found ✨</p>
                  <p className="text-ink-soft">
                    We think this is a <span className="font-semibold text-ink">{name}</span>. You can
                    change anything below.
                  </p>
                </>
              )}
            </div>
          </div>

          {!identifying && (
            <div className="mt-6 text-right">
              <Button onClick={() => setStep('details')}>Looks good — continue →</Button>
            </div>
          )}
        </Card>
      )}

      {step === 'details' && (
        <Card className="mt-6 p-7">
          <Field label="What is it?">
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Category">
              <input className={input} value={category} onChange={(e) => setCategory(e.target.value)} />
            </Field>
            <Field label="Estimated value (optional)">
              <input
                className={input}
                inputMode="numeric"
                value={estValue}
                onChange={(e) => setEstValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="$"
              />
            </Field>
          </div>

          <Field label="Which room?">
            <select className={input} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {state.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.emoji} {r.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tell its story 💬">
            <textarea
              className={`${input} min-h-28`}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Where did it come from? Why does it matter? Who should know about it?"
            />
            <p className="mt-1 text-sm text-ink-soft">
              Tip: in the real app you can simply <em>speak</em> and we’ll write it down for you.
            </p>
          </Field>

          <Field label="Who would you like this to go to? (optional)">
            <select
              className={input}
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
            <Button variant="ghost" onClick={() => navigate('/binder')}>
              Cancel
            </Button>
            <Button onClick={save}>Save to my binder</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

const input =
  'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-clay outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-5">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
    </label>
  )
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['capture', 'identify', 'details']
  const labels = { capture: 'Photo', identify: 'Identify', details: 'Details' }
  return (
    <div className="mt-5 flex items-center gap-2">
      {steps.map((s, i) => {
        const active = steps.indexOf(step) >= i
        return (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                active ? 'bg-clay text-white' : 'bg-cream-deep text-ink-soft'
              }`}
            >
              {i + 1}
            </span>
            <span className={active ? 'font-semibold' : 'text-ink-soft'}>{labels[s]}</span>
            {i < steps.length - 1 && <span className="mx-1 text-line">—</span>}
          </div>
        )
      })}
    </div>
  )
}
