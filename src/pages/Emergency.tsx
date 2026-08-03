import { useState } from 'react'
import { useStore } from '../store'
import { EMERGENCY_SECTIONS, sectionById } from '../lib/emergency'
import { Link } from 'react-router-dom'
import { placesOf, placeById } from '../lib/places'
import { Button, Card, Field, inputClass } from '../components/ui'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { useConfirm } from '../components/Confirm'
import { LifeBuoy, ScrollText, Heart, Plus, Pencil, Trash2 } from '../components/icons'
import type { EmergencyEntry } from '../types'

/**
 * "In an emergency" — sectioned like the planners families make by hand:
 * health & care, final arrangements, papers, money, secured places, the
 * house, and where the photographs live. Each section carries the questions
 * a family actually asks, and its own safety rule where one applies
 * (locations in words — never codes, numbers, or passwords).
 */
export function Emergency() {
  const { state, addEmergency, updateEmergency, deleteEmergency } = useStore()
  const confirm = useConfirm()
  const [adding, setAdding] = useState(false)
  const [sectionId, setSectionId] = useState<string>(EMERGENCY_SECTIONS[0].id)
  const [label, setLabel] = useState('')
  const [labelError, setLabelError] = useState('')
  const [detail, setDetail] = useState('')
  const [preparedOn, setPreparedOn] = useState('')
  const [notePlace, setNotePlace] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDetail, setEditDetail] = useState('')
  const [editPreparedOn, setEditPreparedOn] = useState('')

  const startFromPrompt = (secId: string, p: string) => {
    setSectionId(secId)
    setLabel(p)
    setLabelError('')
    setAdding(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = () => {
    if (!label.trim()) {
      setLabelError('Please give the note a short title so your family can find it.')
      return
    }
    addEmergency({
      label: label.trim(),
      detail,
      sectionId,
      preparedOn: preparedOn.trim() || undefined,
      placeId: notePlace || undefined,
    })
    setLabel('')
    setDetail('')
    setPreparedOn('')
    setNotePlace('')
    setAdding(false)
  }

  const beginEdit = (e: EmergencyEntry) => {
    setEditingId(e.id)
    setEditDetail(e.detail)
    setEditPreparedOn(e.preparedOn ?? '')
  }
  const saveEdit = () => {
    if (editingId)
      updateEmergency(editingId, {
        detail: editDetail,
        preparedOn: editPreparedOn.trim() || undefined,
      })
    setEditingId(null)
  }

  const remove = async (id: string, noteLabel: string) => {
    if (
      await confirm({
        title: `Delete “${noteLabel}”?`,
        confirmLabel: 'Delete it',
        cancelLabel: 'Keep it',
      })
    )
      deleteEmergency(id)
  }

  const activeSection = sectionById(sectionId)
  const orphans = state.emergency.filter((e) => !sectionById(e.sectionId))
  const places = placesOf(state)

  const NoteCard = ({ e }: { e: EmergencyEntry }) => {
    const sec = sectionById(e.sectionId)
    return (
    <div className="flex gap-4 border-t border-line pt-4 first:border-0 first:pt-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream-deep text-clay">
        <ScrollText className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl">{e.label}</h3>
        {editingId === e.id ? (
          <div className="mt-2">
            <textarea
              className={`${inputClass} min-h-24`}
              value={editDetail}
              onChange={(ev) => setEditDetail(ev.target.value)}
              placeholder={sec?.detailPlaceholder}
              autoFocus
            />
            {(sec?.asksPreparedOn || e.preparedOn) && (
              <label className="mt-3 block">
                <span className="mb-1 block text-sm font-semibold">
                  When was it prepared or last updated? (optional)
                </span>
                <input
                  className={inputClass}
                  value={editPreparedOn}
                  onChange={(ev) => setEditPreparedOn(ev.target.value)}
                  placeholder="e.g. March 2023"
                />
              </label>
            )}
            <div className="mt-3 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-ink-soft mt-1 leading-relaxed">{e.detail}</p>
            {e.preparedOn && (
              <p className="mt-1 text-sm text-ink-soft">Prepared/updated: {e.preparedOn}</p>
            )}
            {(() => {
              const pl = placeById(state, e.placeId)
              if (!pl) return null
              return pl.status === 'leaving' ? (
                <Link
                  to={`/place/${pl.id}/leaving`}
                  className="mt-2 inline-flex min-h-11 items-center rounded-full border-2 border-amber-deep/50 bg-amber/15 px-3 py-1 text-sm font-semibold text-amber-deep hover:border-amber-deep"
                >
                  Tied to {pl.name} — needs updating
                </Link>
              ) : (
                <p className="mt-1 text-sm text-ink-soft">Tied to {pl.name}</p>
              )
            })()}
          </>
        )}
      </div>
      {editingId !== e.id && (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            onClick={() => beginEdit(e)}
            className="inline-flex min-h-11 items-center gap-1 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Edit
          </button>
          <button
            onClick={() => void remove(e.id, e.label)}
            className="inline-flex min-h-11 items-center gap-1 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-clay-dark"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
    </div>
    )
  }

  return (
    <div>
      <GuideReturnPill />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
              <LifeBuoy className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </span>
            <h1 className="text-4xl">In an emergency</h1>
          </div>
          <p className="text-ink-soft mt-2 text-lg">
            The practical things your family would need to know — so they always know what to do.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setAdding((s) => !s)}>
          Add a note
        </Button>
      </div>

      {adding && (
        <Card className="mt-6 p-6">
          <Field label="Which part of the guide?">
            <select
              className={inputClass}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              {EMERGENCY_SECTIONS.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What is it?" error={labelError}>
            <input
              className={inputClass}
              value={label}
              onChange={(e) => {
                setLabel(e.target.value)
                if (e.target.value.trim()) setLabelError('')
              }}
              placeholder="e.g. Who to call first"
            />
          </Field>
          <Field
            label={activeSection?.detailLabel ?? 'Details'}
            hint={
              activeSection?.safety ??
              'Say where things are in words your family understands — there’s no need to write down key locations or codes.'
            }
          >
            <textarea
              className={`${inputClass} min-h-28`}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={activeSection?.detailPlaceholder}
            />
          </Field>
          {activeSection?.asksPreparedOn && (
            <Field
              label="When was it prepared or last updated? (optional)"
              hint="A rough date is fine — like “March 2023”. Laws change, and so do situations, so it helps your family to know how current a document is."
            >
              <input
                className={inputClass}
                value={preparedOn}
                onChange={(e) => setPreparedOn(e.target.value)}
                placeholder="e.g. March 2023"
              />
            </Field>
          )}
          {places.length > 1 && (
            <Field
              label="Tied to a place? (optional)"
              hint="A utility bill, an insurance policy, a deed — tying it to the place means that if you ever sell or move, Keepsake flags this note for updating."
            >
              <select
                className={inputClass}
                value={notePlace}
                onChange={(e) => setNotePlace(e.target.value)}
              >
                <option value="">Not tied to a place</option>
                {places.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save note</Button>
          </div>
        </Card>
      )}

      {/* The guide, chapter by chapter */}
      <div className="mt-8 space-y-6">
        {EMERGENCY_SECTIONS.map((sec) => {
          const notes = state.emergency.filter((e) => e.sectionId === sec.id)
          const existing = new Set(notes.map((e) => e.label.toLowerCase()))
          const remaining = sec.prompts.filter((p) => !existing.has(p.toLowerCase()))
          return (
            <Card key={sec.id} className="p-6">
              <h2 className="text-2xl">{sec.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{sec.sub}</p>
              {notes.length > 0 && (
                <div className="mt-4 space-y-4">
                  {notes.map((e) => (
                    <NoteCard key={e.id} e={e} />
                  ))}
                </div>
              )}
              {remaining.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {remaining.map((p) => (
                    <button
                      key={p}
                      onClick={() => startFromPrompt(sec.id, p)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-line bg-white px-4 py-2 font-semibold text-ink-soft transition hover:border-clay hover:text-ink"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                      {p}
                    </button>
                  ))}
                </div>
              )}
              {sec.safety && <p className="mt-3 text-sm text-ink-soft">Safety note: {sec.safety}</p>}
            </Card>
          )
        })}

        {orphans.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl">Other notes</h2>
            <div className="mt-4 space-y-4">
              {orphans.map((e) => (
                <NoteCard key={e.id} e={e} />
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card className="mt-8 p-6 bg-clay/5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
          <Heart className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-ink-soft leading-relaxed">
          <span className="font-semibold text-ink">A note on peace of mind.</span> This section isn’t a
          legal will — it’s the warm, practical guide your loved ones will be grateful for. Documents
          like directives and powers of attorney belong with the professionals who made them; here you
          record where they live and who to ask. You decide who can see it: your trusted contact can be
          given access through a careful, verified process, and never a day sooner than you choose.
        </p>
      </Card>
    </div>
  )
}
