import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Button } from '../components/ui'
import { ItemCard } from '../components/ItemCard'

export function Room() {
  const { roomId = '' } = useParams()
  const { roomById, itemsInRoom } = useStore()
  const navigate = useNavigate()
  const room = roomById(roomId)
  const items = itemsInRoom(roomId)

  if (!room) return <p>Room not found.</p>

  return (
    <div>
      <Link to="/binder" className="text-ink-soft hover:text-ink">
        ← Back to binder
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl flex items-center gap-3" style={{ fontFamily: 'Georgia, serif' }}>
          <span>{room.emoji}</span> {room.name}
        </h1>
        <Button onClick={() => navigate('/add', { state: { roomId } })}>＋ Add to this room</Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-ink-soft text-lg">Nothing here yet. Add your first item to this room.</p>
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
