import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore, money } from '../store'
import { bestAmount, valueSourceLabel } from '../lib/value'
import { routeAppraisal, tierTitle, reconcileAppraisalStatus } from '../lib/appraise'
import { compressImage } from '../lib/photo'
import { TrendCard } from '../components/TrendCard'
import { useConfirm } from '../components/Confirm'
import { VoiceCapture } from '../components/VoiceCapture'
import { CATEGORIES } from '../types'
import type { ItemDocument } from '../types'
import {
  AppraisalBadge,
  Button,
  Card,
  Field,
  InsuredBadge,
  Pill,
  inputClass,
} from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import {
  ChevronLeft,
  Quote,
  ScrollText,
  Sparkles,
  DoorOpen,
  KeyRound,
  Gift,
  HeartHandshake,
  FileText,
  Search,
  Shield,
  Trash2,
  CircleAlert,
  Pencil,
  type LucideIcon,
} from '../components/icons'

export function ItemDetail() {
  const { itemId = '' } = useParams()
  const {
    itemById,
    personById,
    roomById,
    state,
    updateItem,
    deleteItem,
    addMemory,
    addDocument,
    setItemPhoto,
  } = useStore()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const item = itemById(itemId)

  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState('')
  const [editingMeaning, setEditingMeaning] = useState(false)
  const [meaningDraft, setMeaningDraft] = useState('')
  const [showInsuranceInfo, setShowInsuranceInfo] = useState(false)
  const [showAppraisalPlan, setShowAppraisalPlan] = useState(false)
  const [addingMemory, setAddingMemory] = useState(false)
  const [memoryPersonId, setMemoryPersonId] = useState('')
  const [memoryText, setMemoryText] = useState('')

  // Edit-details mode: everything about an item is correctable — a wrong AI
  // category must never be permanent (it silently mis-routes appraisals).
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: '', category: '', roomId: '', acquired: '', condition: '', serial: '' })
  const [photoError, setPhotoError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  // Documents
  const [addingDoc, setAddingDoc] = useState(false)
  const [docType, setDocType] = useState<ItemDocument['type']>('receipt')
  const [docLabel, setDocLabel] = useState('')
  const [docSrc, setDocSrc] = useState<string | undefined>()
  const docPhotoRef = useRef<HTMLInputElement>(null)

  if (!item) {
    return (
      <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
        <p className="text-xl font-semibold">We couldn’t find that item.</p>
        <p className="mt-1 text-ink-soft">It may have been removed. Your binder is safe.</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={() => navigate('/binder')}>Back to my binder</Button>
        </div>
      </Card>
    )
  }
  const heir = item.beneficiaryId ? personById(item.beneficiaryId) : undefined
  const room = roomById(item.roomId)

  const assignHeir = (personId: string) =>
    updateItem(item.id, { beneficiaryId: personId || undefined })

  // Explainable routing (lib/appraise.ts): the user sees WHY and WHAT IT COSTS
  // before anything is requested — never a teleport.
  const route = routeAppraisal(item)
  const confirmAppraisal = (tier: 'photo-review' | 'needs-in-person') => {
    updateItem(item.id, { appraisalStatus: tier })
    navigate('/appraisals')
  }

  const beginEditStory = () => {
    setStoryDraft(item.story)
    setEditingStory(true)
  }
  const saveStory = () => {
    updateItem(item.id, { story: storyDraft })
    setEditingStory(false)
  }

  const beginEditMeaning = () => {
    setMeaningDraft(item.significance ?? '')
    setEditingMeaning(true)
  }
  const saveMeaning = () => {
    updateItem(item.id, { significance: meaningDraft.trim() || undefined })
    setEditingMeaning(false)
  }

  const beginEdit = () => {
    setDraft({
      name: item.name,
      category: item.category,
      roomId: item.roomId,
      acquired: item.acquired ?? '',
      condition: item.condition ?? '',
      serial: item.serial ?? '',
    })
    setEditing(true)
  }
  const saveEdit = () => {
    if (!draft.name.trim()) return
    updateItem(item.id, {
      name: draft.name.trim(),
      category: draft.category || 'Other',
      roomId: draft.roomId,
      acquired: draft.acquired.trim() || undefined,
      condition: draft.condition.trim() || undefined,
      serial: draft.serial.trim() || undefined,
    })
    setEditing(false)
  }

  const onPickPhoto = async (file: File) => {
    setPhotoError('')
    try {
      const dataUrl = await compressImage(file)
      setItemPhoto(item.id, dataUrl)
    } catch {
      setPhotoError('We could not read that photo — please try another one.')
    }
  }

  const onPickDocPhoto = async (file: File) => {
    try {
      setDocSrc(await compressImage(file))
      setDocType('photo')
    } catch {
      setDocSrc(undefined)
    }
  }
  const saveDoc = () => {
    if (!docLabel.trim()) return
    addDocument(item.id, { type: docType, label: docLabel.trim(), src: docSrc })
    setDocLabel('')
    setDocSrc(undefined)
    setDocType('receipt')
    setAddingDoc(false)
  }

  return (
    <div>
      <Link
        to={room ? `/room/${room.id}` : '/binder'}
        className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft hover:text-ink transition"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        Back{room ? ` to ${room.name}` : ''}
      </Link>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        {/* Photo — always changeable: "I'll add a photo later" has a later */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-cream-deep shadow-soft">
            <ItemVisual item={item} rounded="rounded-none" />
          </div>
          <div className="print-hidden mt-3">
            <button
              onClick={() => photoRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-line bg-white px-4 py-2 font-semibold text-ink-soft transition hover:border-clay hover:text-ink"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {item.photo || item.photoId || item.image ? 'Change the photo' : 'Add a photo'}
            </button>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onPickPhoto(f)
                e.target.value = ''
              }}
            />
            {photoError && (
              <p aria-live="polite" className="mt-2 font-semibold text-clay-dark">
                {photoError}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{item.category}</Pill>
            {item.insured ? (
              <InsuredBadge />
            ) : (
              <Pill tone="neutral" icon={CircleAlert}>
                No insurance noted
              </Pill>
            )}
            <AppraisalBadge status={reconcileAppraisalStatus(item)} />
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-4xl">{item.name}</h1>
            {!editing && (
              <button
                onClick={beginEdit}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Edit details
              </button>
            )}
          </div>

          {editing && (
            <Card className="mt-4 p-5">
              <Field label="What is it?">
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select
                    className={inputClass}
                    value={draft.category}
                    onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    {!CATEGORIES.includes(draft.category as (typeof CATEGORIES)[number]) && (
                      <option value={draft.category}>{draft.category}</option>
                    )}
                  </select>
                </Field>
                <Field label="Which room?">
                  <select
                    className={inputClass}
                    value={draft.roomId}
                    onChange={(e) => setDraft((d) => ({ ...d, roomId: e.target.value }))}
                  >
                    {state.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Acquired (optional)">
                  <input
                    className={inputClass}
                    value={draft.acquired}
                    onChange={(e) => setDraft((d) => ({ ...d, acquired: e.target.value }))}
                    placeholder="1968, our wedding year"
                  />
                </Field>
                <Field label="Condition (optional)">
                  <input
                    className={inputClass}
                    value={draft.condition}
                    onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
                    placeholder="Good — one small chip"
                  />
                </Field>
                <Field label="Serial / mark (optional)">
                  <input
                    className={inputClass}
                    value={draft.serial}
                    onChange={(e) => setDraft((d) => ({ ...d, serial: e.target.value }))}
                    placeholder="Stamp on the base"
                  />
                </Field>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={!draft.name.trim()}>
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{money(bestAmount(item))}</span>
            <span className="text-ink-soft">{valueSourceLabel(item)}</span>
          </div>

          {/* The story — the heart of Keepsake */}
          <Card className="relative mt-6 overflow-hidden bg-cream p-6">
            <Quote
              className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-clay/10"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-clay-dark">
                <Quote className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                Its story
              </div>
              {!editingStory && (
                <button
                  onClick={beginEditStory}
                  className="relative inline-flex min-h-11 items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  {item.story ? 'Add to it' : 'Tell it'}
                </button>
              )}
            </div>
            {editingStory ? (
              <div className="relative mt-3">
                <VoiceCapture
                  onText={(text) => setStoryDraft((s) => (s ? `${s.trim()} ${text}` : text))}
                />
                <textarea
                  className={`${inputClass} mt-3 min-h-32`}
                  value={storyDraft}
                  onChange={(e) => setStoryDraft(e.target.value)}
                  placeholder="Where did it come from? Why does it matter?"
                  autoFocus
                />
                <div className="mt-3 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setEditingStory(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveStory}>Save the story</Button>
                </div>
              </div>
            ) : item.story ? (
              <p className="relative mt-3 text-xl leading-relaxed text-ink">
                <span className="font-serif text-3xl leading-none text-clay/40">&ldquo;</span>
                {item.story}
                <span className="font-serif text-3xl leading-none text-clay/40">&rdquo;</span>
              </p>
            ) : (
              <p className="relative mt-3 text-ink-soft">
                No story yet. Stories are what turn belongings into heirlooms — add a few sentences
                whenever you’re ready.
              </p>
            )}

            {/* The emotional layer — distinct from provenance. It rides along
                with values and appraisals so market price never stands alone. */}
            <div className="relative mt-5 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sage-deep">
                  <HeartHandshake className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  What it means
                </div>
                {!editingMeaning && (
                  <button
                    onClick={beginEditMeaning}
                    className="relative inline-flex min-h-11 items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    {item.significance ? 'Change it' : 'Say it'}
                  </button>
                )}
              </div>
              {editingMeaning ? (
                <div className="relative mt-2">
                  <VoiceCapture
                    onText={(text) => setMeaningDraft((m) => (m ? `${m.trim()} ${text}` : text))}
                  />
                  <textarea
                    className={`${inputClass} mt-3 min-h-24`}
                    value={meaningDraft}
                    onChange={(e) => setMeaningDraft(e.target.value)}
                    placeholder="What does it mean to you? Why does it matter?"
                    autoFocus
                  />
                  <div className="mt-3 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setEditingMeaning(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveMeaning}>Save</Button>
                  </div>
                </div>
              ) : item.significance ? (
                <p className="relative mt-2 leading-relaxed text-ink">{item.significance}</p>
              ) : (
                <p className="relative mt-2 text-sm text-ink-soft">
                  The story says where it came from — this says why it matters. A sentence is plenty,
                  and it travels with every appraisal and printed page.
                </p>
              )}
            </div>
          </Card>

          {/* Family memories — the heirs' side of the story, added while
              everyone is here to read them */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                <HeartHandshake className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                Family memories
              </div>
              {!addingMemory && (
                <button
                  onClick={() => setAddingMemory(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Add a memory
                </button>
              )}
            </div>
            {(item.memories ?? []).length === 0 && !addingMemory && (
              <p className="mt-2 text-ink-soft">
                Family can add their own memories of this — while everyone is here to read them.
              </p>
            )}
            {(item.memories ?? []).map((m) => {
              const author = personById(m.personId)
              return (
                <div key={m.id} className="mt-2 rounded-2xl border border-line bg-white px-4 py-3">
                  <p className="italic">“{m.text}”</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    — {author ? `${author.name}${author.relationship !== 'Me' ? ` (${author.relationship})` : ''}` : 'Family'}
                  </p>
                </div>
              )
            })}
            {addingMemory && (
              <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Who is remembering?</span>
                  <select
                    className={inputClass}
                    value={memoryPersonId}
                    onChange={(e) => setMemoryPersonId(e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {state.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.relationship === 'Me' ? `${p.name} (me)` : `${p.name} (${p.relationship})`}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className={`${inputClass} mt-3 min-h-20`}
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                  placeholder="What do you remember about it?"
                />
                <div className="mt-3 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setAddingMemory(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={!memoryPersonId || !memoryText.trim()}
                    onClick={() => {
                      addMemory(item.id, memoryPersonId, memoryText.trim())
                      setMemoryText('')
                      setAddingMemory(false)
                    }}
                  >
                    Keep this memory
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Facts */}
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Fact icon={ScrollText} label="Acquired" value={item.acquired ?? '—'} />
            <Fact icon={Sparkles} label="Condition" value={item.condition ?? '—'} />
            <Fact icon={DoorOpen} label="Room" value={room ? room.name : '—'} />
            <Fact icon={KeyRound} label="Serial / mark" value={item.serial ?? '—'} />
          </dl>

          {/* Market trend — kind, sourced, never a stock ticker */}
          <TrendCard item={item} familyPlan={state.plan.tier === 'family'} />
          <p className="print-hidden mt-2 text-sm text-ink-soft">
            Someone offering to buy it?{' '}
            <Link to="/check" className="font-semibold text-clay-dark underline">
              Check the offer first
            </Link>
            .
          </p>

          {/* Who it goes to */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              <Gift className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Who you’d like this to go to
            </div>
            <select
              value={item.beneficiaryId ?? ''}
              onChange={(e) => assignHeir(e.target.value)}
              className={`mt-2 ${inputClass}`}
            >
              <option value="">Not yet decided</option>
              {state.people
                .filter((p) => p.role !== 'owner')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
            </select>
            {heir && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-sage/10 px-4 py-2.5 text-ink-soft">
                <HeartHandshake className="h-5 w-5 shrink-0 text-sage-deep" strokeWidth={2} aria-hidden="true" />
                <span>
                  Saved: your wish is for <span className="font-semibold text-clay-dark">{heir.name}</span> to
                  have this. A wish you can change anytime — it isn’t a will.
                </span>
              </p>
            )}
          </div>

          {/* Documents — notes about where papers live, plus attached photos
              (the "close-up of the hallmark" the identification step asks for) */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                Documents
              </div>
              {!addingDoc && (
                <button
                  onClick={() => setAddingDoc(true)}
                  className="inline-flex min-h-11 items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Add
                </button>
              )}
            </div>
            {item.documents.length === 0 && !addingDoc ? (
              <p className="mt-2 text-ink-soft">
                Nothing attached yet — a receipt note, an old appraisal, or a close-up photo of a
                maker’s mark all belong here.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {item.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
                  >
                    {d.src ? (
                      <img
                        src={d.src}
                        alt={d.label}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-clay">
                        <FileText className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                      </span>
                    )}
                    <span className="font-semibold capitalize">{d.type}</span>
                    <span className="text-ink-soft">— {d.label}</span>
                  </li>
                ))}
              </ul>
            )}
            {addingDoc && (
              <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold">What kind?</span>
                    <select
                      className={inputClass}
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as ItemDocument['type'])}
                    >
                      <option value="receipt">Receipt</option>
                      <option value="appraisal">Appraisal</option>
                      <option value="warranty">Warranty</option>
                      <option value="manual">Manual / instructions</option>
                      <option value="certificate">Certificate</option>
                      <option value="photo">Photo (close-up, mark…)</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold">Describe it</span>
                    <input
                      className={inputClass}
                      value={docLabel}
                      onChange={(e) => setDocLabel(e.target.value)}
                      placeholder="Original receipt — in the gray box"
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => docPhotoRef.current?.click()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-line bg-white px-4 py-2 font-semibold text-ink-soft transition hover:border-clay hover:text-ink"
                  >
                    <FileText className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    {docSrc ? 'Photo attached ✓' : 'Attach a photo (optional)'}
                  </button>
                  <input
                    ref={docPhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void onPickDocPhoto(f)
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setAddingDoc(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveDoc} disabled={!docLabel.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Insurance — always the owner's statement, never the app's claim */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              <Shield className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Insurance
            </div>
            {item.insured ? (
              <p className="mt-2 text-ink-soft">
                You noted that this is insured.{' '}
                <button
                  onClick={() => updateItem(item.id, { insured: false })}
                  className="font-semibold text-clay-dark underline"
                >
                  Change that
                </button>
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => updateItem(item.id, { insured: true })}>
                  I already have this insured
                </Button>
                <Button variant="ghost" onClick={() => setShowInsuranceInfo((s) => !s)}>
                  What would insuring it involve?
                </Button>
              </div>
            )}
            {showInsuranceInfo && !item.insured && (
              <Card className="mt-3 bg-cream p-5 text-ink-soft">
                <p>
                  Valuable single items are usually insured by adding a{' '}
                  <span className="font-semibold text-ink">“scheduled item”</span> to your homeowner’s
                  policy — your agent will ask for a description, a photo, and a recent appraisal, all of
                  which this binder holds. Keepsake doesn’t sell insurance and can’t set it up for you;
                  a call to your own insurance agent is the right next step.
                </p>
              </Card>
            )}
          </div>

          {/* Appraisal — recommendation first, with the why and the cost */}
          {item.appraisalStatus === 'none' && (
            <div className="mt-8">
              {!showAppraisalPlan ? (
                <Button icon={Search} onClick={() => setShowAppraisalPlan(true)}>
                  Get it appraised
                </Button>
              ) : (
                <Card className="bg-cream p-6">
                  <p className="text-xl font-semibold">{tierTitle[route.tier]}</p>
                  <p className="mt-2 text-ink-soft">{route.why}</p>
                  <p className="mt-2 text-ink-soft">{route.costBenefit}</p>
                  {route.tier !== 'none-needed' && (
                    <p className="mt-2 text-sm text-ink-soft">
                      Only the appraiser you choose would see this item’s photos — never your whole
                      binder, and never your address before you book.
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-3">
                    {route.tier === 'none-needed' ? (
                      <>
                        <Button onClick={() => setShowAppraisalPlan(false)}>Good to know</Button>
                        <Button variant="ghost" onClick={() => confirmAppraisal('photo-review')}>
                          Request a photo review anyway
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() =>
                            confirmAppraisal(route.tier === 'in-person' ? 'needs-in-person' : 'photo-review')
                          }
                        >
                          {route.tier === 'in-person' ? 'Plan an in-person visit' : 'Start the photo review'}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowAppraisalPlan(false)}>
                          Not now
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* A pending request is never a dead end — the plan can change */}
          {(item.appraisalStatus === 'photo-review' || item.appraisalStatus === 'needs-in-person' || item.appraisalStatus === 'requested') && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => updateItem(item.id, { appraisalStatus: 'none' })}
              >
                Cancel the appraisal request
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={async () => {
                if (
                  await confirm({
                    title: `Remove “${item.name}”?`,
                    body: 'It moves to Recently removed, where you can bring it back for 30 days.',
                    confirmLabel: 'Remove it',
                    cancelLabel: 'Keep it',
                  })
                ) {
                  deleteItem(item.id)
                  navigate('/binder')
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3">
      <dt className="flex items-center gap-1.5 text-sm text-ink-soft">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  )
}
