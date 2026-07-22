import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore, money } from '../store'
import { bestAmount } from '../lib/value'
import { prepareProgress } from '../lib/prepare'
import { reconcileAppraisalStatus } from '../lib/appraise'
import { storiesTold } from '../lib/selectors'
import { Button, Card, AppraisalBadge } from '../components/ui'
import { ItemCard } from '../components/ItemCard'
import { ItemVisual } from '../components/ItemVisual'
import { NextStepCard } from '../components/NextStepCard'
import { GuideReturnPill } from '../components/GuideReturnPill'
import { STARTER_ITEM_LIMIT } from '../types'
import type { Item } from '../types'
import {
  Plus,
  Quote,
  Compass,
  HeartHandshake,
  BookHeart,
  Users,
  ChevronRight,
  LayoutGrid,
  List,
  Undo2,
  roomIcon,
  type LucideIcon,
} from '../components/icons'

type ViewMode = 'tile' | 'list'
const VIEW_KEY = 'keepsake.recentView'
const ORIENT_KEY = 'keepsake.orientationSeen'

export function Home() {
  const { state, itemsInRoom, restoreItem, addRoom } = useStore()
  const navigate = useNavigate()
  const [addingRoom, setAddingRoom] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(VIEW_KEY) as ViewMode) || 'tile',
  )
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [showOrientation, setShowOrientation] = useState(
    () => localStorage.getItem(ORIENT_KEY) !== '1',
  )
  const dismissOrientation = () => {
    localStorage.setItem(ORIENT_KEY, '1')
    setShowOrientation(false)
  }
  const q = query.trim().toLowerCase()
  const matches = q
    ? state.items.filter((it) =>
        `${it.name} ${it.category} ${it.story}`.toLowerCase().includes(q),
      )
    : []
  const saveRoom = () => {
    if (!roomName.trim()) return
    addRoom(roomName)
    setRoomName('')
    setAddingRoom(false)
  }
  const setViewMode = (v: ViewMode) => {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const withStory = storiesTold(state.items)
  const withHeir = state.items.filter((it) => it.beneficiaryId).length
  const recent = state.items.slice(0, view === 'list' ? 6 : 4)
  const trash = state.trash ?? []

  return (
    <div>
      <GuideReturnPill />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ink-soft text-lg">Welcome back, {state.ownerName}</p>
          <h1 className="text-4xl mt-1">{state.binderName}</h1>
        </div>
        <Button icon={Plus} size="lg" onClick={() => navigate('/add')}>
          Add an item
        </Button>
      </div>

      {/* A gifted binder opens with the giver's warmth, not a feature tour */}
      {state.plan.giftFrom && state.items.length === 0 && (
        <Card className="mt-6 flex items-start gap-4 border-sage/30 bg-sage/5 p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
            <HeartHandshake className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-semibold">A gift from {state.plan.giftFrom}.</p>
            <p className="text-ink-soft">
              {state.plan.giftFrom} set this binder up because your stories matter to them. There is
              nothing to pay — whenever you’re ready, add the first thing that comes to mind.
            </p>
          </div>
        </Card>
      )}

      {/* First-visit orientation — the concept in one card (field test #1:
          entering My Binder cold left "what am I producing?" unanswered) */}
      {showOrientation && !state.isDemo && !(state.plan.giftFrom && state.items.length === 0) && (
        <Card className="mt-6 flex items-start gap-4 border-sage/30 bg-sage/5 p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
            <Compass className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">What you’re making here</p>
            <p className="mt-1 text-ink-soft">
              A binder of the things you care about — a photo and a name for each, the story behind
              the ones that have one, and your wish for who you’d like to have it. Piece by piece, it
              becomes a book your family can hold onto. The Getting Ready page walks you through it,
              one small visit at a time.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" icon={Compass} onClick={() => navigate('/guide')}>
                Show me the path
              </Button>
              <button
                onClick={dismissOrientation}
                className="inline-flex min-h-11 items-center px-2 py-2 font-semibold text-ink-soft underline hover:text-ink"
              >
                Got it, thanks
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats — stories and wishes lead; money never headlines the binder */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={BookHeart}
          label="Your items"
          value={
            state.plan.tier === 'starter'
              ? `${state.items.length} of ${STARTER_ITEM_LIMIT} free`
              : String(state.items.length)
          }
        />
        <Stat icon={Quote} label="Stories told" value={`${withStory} of ${state.items.length}`} />
        <Stat
          icon={Users}
          label="Wishes decided"
          value={`${withHeir} of ${state.items.length}`}
        />
      </div>

      {/* Getting Ready — the one next step, ABOVE the fold (field test #1:
          "See the whole path" was buried). Persists as the mobile door to the
          Guide even after the core path completes. */}
      {(() => {
        const progress = prepareProgress(state)
        if (progress.nextStep) {
          return (
            <div className="mt-8">
              <NextStepCard step={progress.nextStep} compact />
              <Link
                to="/guide"
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-sage/40 bg-sage/10 px-4 py-2 font-semibold text-sage-deep hover:border-sage"
              >
                <Compass className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                See the whole path
              </Link>
            </div>
          )
        }
        return (
          <Link
            to="/guide"
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-sage/40 bg-sage/10 px-4 py-2 font-semibold text-sage-deep hover:border-sage"
          >
            <Compass className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
            Getting Ready — complete. Open your path anytime.
          </Link>
        )
      })()}

      {/* Rooms */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <h2 className="text-2xl">Rooms</h2>
        {!addingRoom && (
          <button
            onClick={() => setAddingRoom(true)}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 py-2 font-semibold text-ink-soft hover:text-ink"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            Add a room
          </button>
        )}
      </div>
      {addingRoom && (
        <Card className="mt-3 flex flex-wrap items-center gap-3 p-4">
          <input
            className="min-w-48 flex-1 rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg outline-none focus:border-clay"
            value={roomName}
            autoFocus
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveRoom()}
            placeholder="Kitchen, Study, The Attic…"
          />
          <Button variant="ghost" onClick={() => setAddingRoom(false)}>
            Cancel
          </Button>
          <Button onClick={saveRoom} disabled={!roomName.trim()}>
            Add it
          </Button>
        </Card>
      )}
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
                className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:text-clay-dark"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>

      {/* Find anything — search across every item; no memory of rooms needed */}
      {state.items.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl">Find something</h2>
          <input
            className="mt-3 w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg outline-none focus:border-clay"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, or a word from its story…"
          />
          {query.trim() ? (
            matches.length === 0 ? (
              <p className="mt-3 text-ink-soft">Nothing matches “{query.trim()}” yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {matches.map((it) => (
                  <ItemRow key={it.id} item={it} />
                ))}
              </div>
            )
          ) : showAll ? (
            <div className="mt-3 flex flex-col gap-3">
              {state.items.map((it) => (
                <ItemRow key={it.id} item={it} />
              ))}
            </div>
          ) : (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 inline-flex min-h-11 items-center px-2 py-2 font-semibold text-clay-dark underline hover:text-ink"
            >
              Show all {state.items.length} items
            </button>
          )}
        </div>
      )}

      {/* Recently added */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <h2 className="text-2xl">Recently added</h2>
        {recent.length > 0 && <ViewToggle view={view} onChange={setViewMode} />}
      </div>
      {recent.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-deep text-clay">
            <BookHeart className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-semibold">Your binder is ready.</p>
          <p className="text-ink-soft mt-1">
            Add your first treasure — a photo and a name is all it takes. Its story can come whenever
            you’re ready.
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

      {/* Recently removed — mistakes aren't forever */}
      {trash.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl">Recently removed</h2>
          <p className="text-ink-soft">
            Removed items stay here for 30 days, in case you change your mind.
          </p>
          <div className="mt-3 space-y-3">
            {trash.map((it) => (
              <Card key={it.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                  <ItemVisual item={it} rounded="rounded-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-ink-soft">{it.category}</div>
                </div>
                <Button variant="secondary" icon={Undo2} onClick={() => restoreItem(it.id)}>
                  Put it back
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
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

/** Segmented control to switch the Recently added section between tile and list views. */
function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { mode: ViewMode; icon: LucideIcon; label: string }[] = [
    { mode: 'tile', icon: LayoutGrid, label: 'Tiles' },
    { mode: 'list', icon: List, label: 'List' },
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
            className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-base font-semibold transition ${
              active ? 'bg-clay-dark text-white shadow-soft' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
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
              {' · '}for <span className="font-semibold text-clay-dark">{heir.name}</span>
            </>
          )}
        </div>
      </div>
      <div className="hidden shrink-0 sm:block">
        <AppraisalBadge status={reconcileAppraisalStatus(item)} />
      </div>
      <div className="shrink-0 text-right">
        <div className="text-lg font-semibold">{money(bestAmount(item))}</div>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:text-clay-dark"
        strokeWidth={2}
        aria-hidden="true"
      />
    </Link>
  )
}
