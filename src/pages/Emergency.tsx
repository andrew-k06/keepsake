import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card, Field, inputClass } from '../components/ui'
import { LifeBuoy, ScrollText, Heart, Plus, Pencil, Trash2 } from '../components/icons'

// Guided prompts — the questions families actually need answered. Tapping one
// starts a note instead of leaving the user staring at a blank form.
const PROMPTS = [
  'Where my important papers are',
  'My attorney',
  'Who to call first',
  'My doctor & medications',
  'Home — water and power shut-offs',
  'Bills that need paying',
]

export function Emergency() {
  const { state, addEmergency, updateEmergency, deleteEmergency } = useStore()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [labelError, setLabelError] = useState('')
  const [detail, setDetail] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDetail, setEditDetail] = useState('')

  const startFromPrompt = (p: string) => {
    setLabel(p)
    setLabelError('')
    setAdding(true)
  }

  const save = () => {
    if (!label.trim()) {
      setLabelError('Please give the note a short title so your family can find it.')
      return
    }
    addEmergency({ label: label.trim(), detail })
    setLabel('')
    setDetail('')
    setAdding(false)
  }

  const beginEdit = (id: string, currentDetail: string) => {
    setEditingId(id)
    setEditDetail(currentDetail)
  }
  const saveEdit = () => {
    if (editingId) updateEmergency(editingId, { detail: editDetail })
    setEditingId(null)
  }

  const remove = (id: string, noteLabel: string) => {
    if (window.confirm(`Delete the note “${noteLabel}”?`)) deleteEmergency(id)
  }

  return (
    <div>
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

      {/* Guided prompts for notes not yet written */}
      {(() => {
        const existing = new Set(state.emergency.map((e) => e.label.toLowerCase()))
        const remaining = PROMPTS.filter((p) => !existing.has(p.toLowerCase()))
        if (remaining.length === 0) return null
        return (
          <div className="mt-6">
            <p className="font-semibold">Questions your family will ask:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {remaining.map((p) => (
                <button
                  key={p}
                  onClick={() => startFromPrompt(p)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-line bg-white px-4 py-2 font-semibold text-ink-soft transition hover:border-clay hover:text-ink"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )
      })()}

      {adding && (
        <Card className="mt-6 p-6">
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
            label="Details"
            hint="A tip for safety: say where things are in words your family understands — there’s no need to write down key locations or codes."
          >
            <textarea className={`${inputClass} min-h-28`} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </Field>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save note</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {state.emergency.map((e) => (
          <Card key={e.id} className="p-5 flex gap-4">
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
                    autoFocus
                  />
                  <div className="mt-3 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEdit}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-ink-soft mt-1 leading-relaxed">{e.detail}</p>
              )}
            </div>
            {editingId !== e.id && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  onClick={() => beginEdit(e.id, e.detail)}
                  className="inline-flex min-h-11 items-center gap-1 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Edit
                </button>
                <button
                  onClick={() => remove(e.id, e.label)}
                  className="inline-flex min-h-11 items-center gap-1 px-2 py-2 text-sm font-semibold text-ink-soft hover:text-clay-dark"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-clay/5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
          <Heart className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-ink-soft leading-relaxed">
          <span className="font-semibold text-ink">A note on peace of mind.</span> This section isn’t a
          legal will — it’s the warm, practical guide your loved ones will be grateful for. You decide
          who can see it: your trusted contact can be given access through a careful, verified process,
          and never a day sooner than you choose.
        </p>
      </Card>
    </div>
  )
}
