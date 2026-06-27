import { Link } from 'react-router-dom'
import { useStore, money } from '../store'
import { AppraisalBadge, Button, Card } from '../components/ui'

export function Appraisals() {
  const { state, updateItem } = useStore()

  const pending = state.items.filter(
    (it) => it.appraisalStatus === 'requested' || it.appraisalStatus === 'photo-review',
  )
  const inPerson = state.items.filter((it) => it.appraisalStatus === 'needs-in-person')
  const done = state.items.filter((it) => it.appraisalStatus === 'appraised')

  return (
    <div>
      <h1 className="text-4xl" style={{ fontFamily: 'Georgia, serif' }}>
        Appraisals
      </h1>
      <p className="text-ink-soft mt-1 text-lg">
        Some things can be valued right from your photos. Others — like jewelry, watches, and coins —
        are best seen in person by a certified appraiser near you.
      </p>

      <Section
        title="📷 Being reviewed from photos"
        empty="Nothing in photo review right now."
        items={pending}
        action={(it) => (
          <Button
            variant="secondary"
            onClick={() => updateItem(it.id, { appraisalStatus: 'appraised', appraisedValue: Math.round((it.estValue ?? 1000) * 1.1) })}
          >
            Complete (demo)
          </Button>
        )}
      />

      <Section
        title="📍 Recommended: in-person visit"
        empty="No items need an in-person visit."
        items={inPerson}
        action={() => (
          <Button variant="secondary" onClick={() => alert('In the full app, this finds certified appraisers near you and books a visit.')}>
            Find a local appraiser
          </Button>
        )}
      />

      <Section title="✅ Appraised" empty="No completed appraisals yet." items={done} />

      <Card className="mt-10 p-6 bg-cream flex items-start gap-4">
        <span className="text-3xl">🛡️</span>
        <div>
          <p className="font-semibold text-lg">Why this matters</p>
          <p className="text-ink-soft">
            A documented, appraised value protects your family. If something is ever lost, stolen, or
            damaged, this record is what makes an insurance claim simple — and it makes sure your
            children never sell something for a fraction of its worth.
          </p>
        </div>
      </Card>
    </div>
  )
}

function Section({
  title,
  items,
  empty,
  action,
}: {
  title: string
  items: ReturnType<typeof useStore>['state']['items']
  empty: string
  action?: (it: ReturnType<typeof useStore>['state']['items'][number]) => React.ReactNode
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-ink-soft">{empty}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((it) => (
            <Card key={it.id} className="p-4 flex items-center gap-4">
              <Link to={`/item/${it.id}`} className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream-deep text-3xl">
                {it.photo ? <img src={it.photo} className="h-full w-full object-cover" alt="" /> : it.emoji}
              </Link>
              <div className="flex-1">
                <Link to={`/item/${it.id}`} className="text-lg font-semibold hover:text-clay">
                  {it.name}
                </Link>
                <div className="text-ink-soft">
                  {it.category} · est. {money(it.estValue)}
                  {it.appraisedValue && <span className="text-sage-deep"> → appraised {money(it.appraisedValue)}</span>}
                </div>
              </div>
              <AppraisalBadge status={it.appraisalStatus} />
              {action && action(it)}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
