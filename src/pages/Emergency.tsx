import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card } from '../components/ui'

export function Emergency() {
  const { state, addEmergency } = useStore()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [detail, setDetail] = useState('')

  const save = () => {
    if (!label) return
    addEmergency({ label, detail })
    setLabel('')
    setDetail('')
    setAdding(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
            In an emergency
          </h1>
          <p className="text-ink-soft mt-1 text-lg">
            The important things your family would need to know — gathered in one calm place.
          </p>
        </div>
        <Button onClick={() => setAdding((s) => !s)}>＋ Add a note</Button>
      </div>

      {adding && (
        <Card className="mt-6 p-6">
          <label className="block mb-4">
            <span className="mb-1 block font-semibold">What is it?</span>
            <input
              className={input}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Where the spare key is"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Details</span>
            <textarea className={`${input} min-h-28`} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </label>
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
            <span className="text-2xl">🔖</span>
            <div>
              <h3 className="text-xl" style={{ fontFamily: 'Georgia, serif' }}>
                {e.label}
              </h3>
              <p className="text-ink-soft mt-1 leading-relaxed">{e.detail}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-clay/5 flex items-start gap-4">
        <span className="text-3xl">💙</span>
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">A note on peace of mind.</span> This section isn’t a
          legal will — it’s the warm, practical guide your loved ones will be grateful for. Keepsake can
          help you share it automatically with your executor if something ever happens.
        </p>
      </Card>
    </div>
  )
}

const input = 'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-clay outline-none'
