import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { Button, Card, AppraisalBadge } from '../components/ui'
import { ItemCard } from '../components/ItemCard'
import { ItemVisual } from '../components/ItemVisual'
import type { Item } from '../types'
import {
  Plus,
  Package,
  Armchair,
  DoorOpen,
  Lock,
  HeartHandshake,
  ArrowRight,
  BookHeart,
  Users,
  ChevronRight,
  LayoutGrid,
  List,
  type LucideIcon,
} from '../components/icons'

type ViewMode = 'tile' | 'list'
const VIEW_KEY = 'keepsake.recentView'

/** Derive a calm lucide icon from a room's name (no emoji). */
function roomIcon(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes('safe') || n.includes('vault')) return Lock
  if (n.includes('living') || n.includes('lounge') || n.includes('parlor')) return Armchair
  if (n.includes('garage') || n.includes('shed') || n.includes('attic') || n.includes('basement'))
    return Package
  return DoorOpen
}

export function Home() {
  const { state, itemsInRoom } = useStore()
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) as ViewMode) || 'tile',
  )
  const setViewMode = (v: ViewMode) => {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const totalValue = state.items.reduce((sum, it) => sum + (it.estValue ?? 0), 0)
  const withHeir = state.items.filter((it) => it.beneficiaryId).length
  const recent = state.items.slice(0, view === 'list' ? 6 : 4)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-soft text-lg">Welcome back, {state.ownerName}</p>
          <h1 className="text-4xl mt-1">{state.binderName}</h1>
        </div>
        <Button icon={Plus} size="lg" onClick={() => navigate('/add')}>
          Add an item
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={BookHeart} label="Items kept" value={String(state.items.length)} />
        <Stat icon={Package} label="Estimated value" value={money(totalValue)} />
        <Stat
          icon={Users}
          label="Assigned to family"
          value={`${withHeir} of ${state.items.length}`}
        />
      </div>

      {/* Rooms */}
      <h2 className="mt-12 text-2xl">Rooms</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.rooms.map((room) => {
          const count = itemsInRoom(room.id).length
          const Icon = roomIcon(room.name)
          return (
            <Link
              key={room.id}
              to={`/room/${room.id}`}
              className="group flex items-center gap-4 rounded-3xl bg-white border border-line p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift hover:border-line-strong"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-clay">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold leading-snug">{room.name}</div>
                <div className="text-ink-soft">
                  {count} item{count === 1 ? '' : 's'}
                </div>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-line-strong transition group-hover:text-clay"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>

      {/* Recently added */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <h2 className="text-2xl">Recently kept</h2>
        {recent.length > 0 && <ViewToggle view={view} onChange={setViewMode} />}
      </div>
      {recent.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-clay">
            <BookHeart className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-semibold">Your binder is ready.</p>
          <p className="text-ink-soft mt-1">
            Add your first keepsake to begin telling its story.
          </p>
          <div className="mt-5 flex justify-center">
            <Button icon={Plus} onClick={() => navigate('/add')}>
              Add an item
            </Button>
          </div>
        </Card>
      ) : view === 'tile' ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {recent.map((it) => (
            <ItemRow key={it.id} item={it} />
          ))}
        </div>
      )}

      {/* Gentle nudge */}
      <Card className="mt-12 p-6 flex flex-col sm:flex-row items-center gap-5 bg-sage/5 border-sage/30">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage/15 text-sage-deep">
          <HeartHandshake className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-lg font-semibold">Your family will treasure this.</p>
          <p className="text-ink-soft">
            When you’re ready, you can share your binder so your children understand what each thing
            means — and what to do if something happens.
          </p>
        </div>
        <Button variant="secondary" icon={ArrowRight} onClick={() => navigate('/family')}>
          Invite family
        </Button>
      </Card>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-ink-soft">
        <Icon className="h-5 w-5 text-clay" strokeWidth={1.75} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </Card>
  )
}

/** Segmented control to switch the Recently kept section between tile and list views. */
function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { mode: ViewMode; icon: LucideIcon; label: string }[] = [
    { mode: 'tile', icon: LayoutGrid, label: 'Tile view' },
    { mode: 'list', icon: List, label: 'List view' },
  ]
  return (
    <div className="flex shrink-0 items-center rounded-2xl border border-line bg-white p-1 shadow-soft">
      {opts.map(({ mode, icon: Icon, label }) => {
        const active = view === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-base font-semibold transition ${
              active ? 'bg-clay text-white shadow-soft' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">{mode === 'tile' ? 'Tiles' : 'List'}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Compact horizontal row used by the list view. */
function ItemRow({ item }: { item: Item }) {
  const { personById } = useStore()
  const heir = item.beneficiaryId ? personById(item.beneficiaryId) : undefined
  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex items-center gap-4 rounded-3xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
        <ItemVisual item={item} rounded="rounded-none" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold leading-snug">{item.name}</div>
        <div className="text-ink-soft">
          {item.category}
          {heir && (
            <>
              {' · '}for <span className="font-semibold text-clay">{heir.name}</span>
            </>
          )}
        </div>
      </div>
      <div className="hidden shrink-0 sm:block">
        <AppraisalBadge status={item.appraisalStatus} />
      </div>
      <div className="shrink-0 text-right">
        <div className="text-lg font-semibold">{money(item.appraisedValue ?? item.estValue)}</div>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-line-strong transition group-hover:text-clay"
        strokeWidth={2}
        aria-hidden="true"
      />
    </Link>
  )
}
