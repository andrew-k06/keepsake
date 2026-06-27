import { Link, useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { Button, Card } from '../components/ui'
import { ItemCard } from '../components/ItemCard'

export function Home() {
  const { state, itemsInRoom } = useStore()
  const navigate = useNavigate()

  const totalValue = state.items.reduce((sum, it) => sum + (it.estValue ?? 0), 0)
  const withHeir = state.items.filter((it) => it.beneficiaryId).length
  const recent = state.items.slice(0, 4)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-soft text-lg">Welcome back, {state.ownerName}</p>
          <h1 className="text-4xl mt-1" style={{ fontFamily: 'Georgia, serif' }}>
            {state.binderName}
          </h1>
        </div>
        <Button onClick={() => navigate('/add')}>＋ Add an item</Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Items kept" value={String(state.items.length)} />
        <Stat label="Estimated value" value={money(totalValue)} />
        <Stat label="Assigned to family" value={`${withHeir} of ${state.items.length}`} />
      </div>

      {/* Rooms */}
      <h2 className="mt-10 text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
        Rooms
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {state.rooms.map((room) => {
          const count = itemsInRoom(room.id).length
          return (
            <Link
              key={room.id}
              to={`/room/${room.id}`}
              className="flex items-center gap-4 rounded-3xl bg-white border border-line p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-4xl">{room.emoji}</span>
              <div>
                <div className="text-lg font-semibold">{room.name}</div>
                <div className="text-ink-soft">{count} item{count === 1 ? '' : 's'}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recently added */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
          Recently kept
        </h2>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </div>

      {/* Gentle nudge */}
      <Card className="mt-10 p-6 flex flex-col sm:flex-row items-center gap-4 bg-sage/5">
        <span className="text-4xl">💌</span>
        <div className="flex-1">
          <p className="text-lg font-semibold">Your family will treasure this.</p>
          <p className="text-ink-soft">
            When you’re ready, you can share your binder so your children understand what each thing
            means — and what to do if something happens.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/family')}>
          Invite family
        </Button>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-ink-soft">{label}</div>
      <div className="mt-1 text-3xl font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
        {value}
      </div>
    </Card>
  )
}
