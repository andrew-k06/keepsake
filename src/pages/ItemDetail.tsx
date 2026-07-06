import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore, money } from '../store'
import { bestAmount, valueSourceLabel } from '../lib/value'
import { routeAppraisal, tierTitle } from '../lib/appraise'
import { TrendCard } from '../components/TrendCard'
import { VoiceCapture } from '../components/VoiceCapture'
import {
  AppraisalBadge,
  Button,
  Card,
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
  const { itemById, personById, roomById, state, updateItem, deleteItem } = useStore()
  const navigate = useNavigate()
  const item = itemById(itemId)

  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState('')
  const [showInsuranceInfo, setShowInsuranceInfo] = useState(false)
  const [showAppraisalPlan, setShowAppraisalPlan] = useState(false)

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
              <Pill tone="neutral" icon={CircleAlert}>
                No insurance noted
              </Pill>
            )}
            <AppraisalBadge status={item.appraisalStatus} />
          </div>

          <h1 className="mt-4 text-4xl">{item.name}</h1>

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
          </Card>

          {/* Facts */}
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <Fact icon={ScrollText} label="Acquired" value={item.acquired ?? '—'} />
            <Fact icon={Sparkles} label="Condition" value={item.condition ?? '—'} />
            <Fact icon={DoorOpen} label="Room" value={room ? room.name : '—'} />
            <Fact icon={KeyRound} label="Serial / mark" value={item.serial ?? '—'} />
          </dl>

          {/* Market trend — kind, sourced, never a stock ticker */}
          <TrendCard item={item} familyPlan={state.plan.tier === 'family'} />

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

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                if (
                  confirm(
                    `Remove "${item.name}" from the binder? You can bring it back from Recently removed for 30 days.`,
                  )
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
