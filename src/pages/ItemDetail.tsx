import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore, money } from '../store'
import { AppraisalBadge, Button, Card, Pill } from '../components/ui'

export function ItemDetail() {
  const { itemId = '' } = useParams()
  const { itemById, personById, roomById, state, updateItem, deleteItem } = useStore()
  const navigate = useNavigate()
  const item = itemById(itemId)

  if (!item) return <p>Item not found.</p>
  const heir = item.beneficiaryId ? personById(item.beneficiaryId) : undefined
  const room = roomById(item.roomId)

  const assignHeir = (personId: string) =>
    updateItem(item.id, { beneficiaryId: personId || undefined })

  const requestAppraisal = () => {
    // Mimics triage: certain categories must be seen in person.
    const inPerson = ['Jewelry', 'Watches', 'Collectibles']
    updateItem(item.id, {
      appraisalStatus: inPerson.includes(item.category) ? 'needs-in-person' : 'photo-review',
    })
    navigate('/appraisals')
  }

  return (
    <div>
      <Link to={room ? `/room/${room.id}` : '/binder'} className="text-ink-soft hover:text-ink">
        ← Back{room ? ` to ${room.name}` : ''}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Photo */}
        <div className="overflow-hidden rounded-3xl border border-line bg-cream-deep">
          <div className="aspect-square w-full">
            {item.photo ? (
              <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-[10rem]">{item.emoji}</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{item.category}</Pill>
            {item.insured ? <Pill tone="sage">Insured</Pill> : <Pill tone="clay">Not insured</Pill>}
            <AppraisalBadge status={item.appraisalStatus} />
          </div>
          <h1 className="mt-3 text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
            {item.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{money(item.appraisedValue ?? item.estValue)}</span>
            <span className="text-ink-soft">
              {item.appraisedValue ? 'appraised value' : 'estimated value'}
            </span>
          </div>

          {/* The story — the heart of Keepsake */}
          <Card className="mt-6 p-5 bg-cream">
            <div className="text-ink-soft text-sm font-semibold uppercase tracking-wide">Its story</div>
            <p className="mt-2 text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              “{item.story}”
            </p>
          </Card>

          {/* Facts */}
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Fact label="Acquired" value={item.acquired ?? '—'} />
            <Fact label="Condition" value={item.condition ?? '—'} />
            <Fact label="Room" value={room ? `${room.emoji} ${room.name}` : '—'} />
            <Fact label="Serial / mark" value={item.serial ?? '—'} />
          </dl>

          {/* Who it goes to */}
          <div className="mt-6">
            <div className="text-ink-soft text-sm font-semibold uppercase tracking-wide">
              Who this is for
            </div>
            <select
              value={item.beneficiaryId ?? ''}
              onChange={(e) => assignHeir(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg"
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
              <p className="mt-2 text-ink-soft">
                This will pass to <span className="font-semibold text-clay">{heir.name}</span>.
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="mt-6">
            <div className="text-ink-soft text-sm font-semibold uppercase tracking-wide">Documents</div>
            {item.documents.length === 0 ? (
              <p className="mt-2 text-ink-soft">No documents attached yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {item.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
                  >
                    <span className="text-xl">📄</span>
                    <span className="capitalize font-semibold">{d.type}</span>
                    <span className="text-ink-soft">— {d.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            {item.appraisalStatus === 'none' && (
              <Button onClick={requestAppraisal}>🔎 Get it appraised</Button>
            )}
            {!item.insured && (
              <Button variant="secondary" onClick={() => updateItem(item.id, { insured: true })}>
                🛡️ Look into insurance
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(`Remove “${item.name}” from the binder?`)) {
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-soft text-sm">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
