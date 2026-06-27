import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore, money } from '../store'
import {
  AppraisalBadge,
  Button,
  Card,
  InsuredBadge,
  Pill,
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
  ShieldCheck,
  Trash2,
  CircleAlert,
  type LucideIcon,
} from '../components/icons'

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
      <Link
        to={room ? `/room/${room.id}` : '/binder'}
        className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink transition"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        Back{room ? ` to ${room.name}` : ''}
      </Link>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        {/* Photo */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-cream-deep shadow-soft">
            <ItemVisual item={item} rounded="rounded-none" />
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill>{item.category}</Pill>
            {item.insured ? (
              <InsuredBadge />
            ) : (
              <Pill tone="clay" icon={CircleAlert}>
                Not insured
              </Pill>
            )}
            <AppraisalBadge status={item.appraisalStatus} />
          </div>

          <h1 className="mt-4 text-4xl">{item.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{money(item.appraisedValue ?? item.estValue)}</span>
            <span className="text-ink-soft">
              {item.appraisedValue ? 'appraised value' : 'estimated value'}
            </span>
          </div>

          {/* The story — the heart of Keepsake */}
          <Card className="relative mt-6 overflow-hidden bg-cream p-6">
            <Quote
              className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-clay/10"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-clay">
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Its story
            </div>
            <p className="relative mt-3 text-xl leading-relaxed text-ink">
              <span className="font-serif text-3xl leading-none text-clay/40">&ldquo;</span>
              {item.story}
              <span className="font-serif text-3xl leading-none text-clay/40">&rdquo;</span>
            </p>
          </Card>

          {/* Facts */}
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Fact icon={ScrollText} label="Acquired" value={item.acquired ?? '—'} />
            <Fact icon={Sparkles} label="Condition" value={item.condition ?? '—'} />
            <Fact icon={DoorOpen} label="Room" value={room ? room.name : '—'} />
            <Fact icon={KeyRound} label="Serial / mark" value={item.serial ?? '—'} />
          </dl>

          {/* Who it goes to */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              <Gift className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Who this is for
            </div>
            <select
              value={item.beneficiaryId ?? ''}
              onChange={(e) => assignHeir(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-clay focus:outline-none"
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
                  This will pass to <span className="font-semibold text-clay">{heir.name}</span>.
                </span>
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              Documents
            </div>
            {item.documents.length === 0 ? (
              <p className="mt-2 text-ink-soft">No documents attached yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {item.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream-deep text-clay">
                      <FileText className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span className="font-semibold capitalize">{d.type}</span>
                    <span className="text-ink-soft">— {d.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            {item.appraisalStatus === 'none' && (
              <Button icon={Search} onClick={requestAppraisal}>
                Get it appraised
              </Button>
            )}
            {!item.insured ? (
              <Button
                variant="secondary"
                icon={Shield}
                onClick={() => updateItem(item.id, { insured: true })}
              >
                Look into insurance
              </Button>
            ) : (
              <Button variant="secondary" icon={ShieldCheck} disabled>
                Insured
              </Button>
            )}
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                if (confirm(`Remove "${item.name}" from the binder?`)) {
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
