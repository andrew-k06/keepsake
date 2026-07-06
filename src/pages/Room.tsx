import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card } from '../components/ui'
import { ItemCard } from '../components/ItemCard'
import { Plus, ChevronLeft, roomIcon } from '../components/icons'

export function Room() {
  const { roomId = '' } = useParams()
  const { roomById, itemsInRoom } = useStore()
  const navigate = useNavigate()
  const room = roomById(roomId)
  const items = itemsInRoom(roomId)

  if (!room)
    return (
      <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
        <p className="text-xl font-semibold">We couldn’t find that room.</p>
        <p className="mt-1 text-ink-soft">Your binder is safe.</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={() => navigate('/binder')}>Back to my binder</Button>
        </div>
      </Card>
    )

  const Icon = roomIcon(room.name)

  return (
    <div>
      <Link
        to="/binder"
        className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft transition hover:text-ink"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        Back to binder
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-clay">
            <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          {room.name}
        </h1>
        <Button
          icon={Plus}
          size="lg"
          onClick={() => navigate('/add', { state: { roomId } })}
        >
          Add to this room
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-clay">
            <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-semibold">Nothing here yet.</p>
          <p className="text-ink-soft mt-1">Add your first item to {room.name}.</p>
          <div className="mt-5 flex justify-center">
            <Button icon={Plus} onClick={() => navigate('/add', { state: { roomId } })}>
              Add an item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  )
}
