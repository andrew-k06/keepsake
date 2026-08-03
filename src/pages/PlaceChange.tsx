import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import {
  destinationPlaces,
  itemsAtPlace,
  notesForPlace,
  placeById,
  roomsOfPlace,
} from '../lib/places'
import { sectionById } from '../lib/emergency'
import { Button, Card, Field, inputClass } from '../components/ui'
import { ItemVisual } from '../components/ItemVisual'
import { useConfirm } from '../components/Confirm'
import { ChevronLeft, DoorOpen, ScrollText, CircleCheckBig, Plus } from '../components/icons'

/**
 * "We're leaving this place" — the update workflow from field test #1's
 * sold-house scenario: after a sale or a move, a surprising number of things
 * still point at the old address. This page gathers every one of them —
 * treasures in its rooms, notes tied to it (the utility bill, the insurance,
 * the deed) — and walks through them one decision at a time. Little-bites
 * rules apply: the list waits, nothing has a deadline, and "decide later"
 * is always an answer.
 */
export function PlaceChange() {
  const { placeId = '' } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const {
    state,
    updateItem,
    deleteItem,
    updateEmergency,
    deleteEmergency,
    addRoom,
    addPlace,
    setPlaceStatus,
    removePlace,
    logEvent,
  } = useStore()

  const place = placeById(state, placeId)
  const [movingItemId, setMovingItemId] = useState<string | null>(null)
  const [targetRoomId, setTargetRoomId] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [notePlaceId, setNotePlaceId] = useState('')
  const [addingPlace, setAddingPlace] = useState(false)
  const [newPlaceName, setNewPlaceName] = useState('')

  if (!place) {
    return (
      <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
        <p className="text-xl font-semibold">We couldn’t find that place.</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={() => navigate('/binder')}>Back to my binder</Button>
        </div>
      </Card>
    )
  }

  const items = itemsAtPlace(state, place.id)
  const notes = notesForPlace(state, place.id)
  const destinations = destinationPlaces(state, place.id)
  const destinationRooms = destinations.flatMap((p) =>
    roomsOfPlace(state, p.id).map((r) => ({ room: r, place: p })),
  )
  const done = items.length === 0 && notes.length === 0

  const moveItem = (itemId: string) => {
    if (!targetRoomId) return
    const item = state.items.find((it) => it.id === itemId)
    updateItem(itemId, { roomId: targetRoomId })
    if (item) {
      const dest = destinationRooms.find((d) => d.room.id === targetRoomId)
      logEvent(
        `“${item.name}” moved from ${place.name} to ${dest ? `${dest.room.name} at ${dest.place.name}` : 'its new room'}`,
      )
    }
    setMovingItemId(null)
    setTargetRoomId('')
  }

  const itemGone = async (itemId: string, name: string) => {
    if (
      await confirm({
        title: `“${name}” left with ${place.name}?`,
        body: 'Sold, given away, or gone with the sale — it moves to Recently removed, where you can bring it back for 30 days if that’s wrong.',
        confirmLabel: 'Yes, it’s gone',
        cancelLabel: 'Keep it',
      })
    ) {
      deleteItem(itemId)
    }
  }

  const addDestinationRoom = (destPlaceId: string) => {
    if (!newRoomName.trim()) return
    const roomId = addRoom(newRoomName, destPlaceId)
    setTargetRoomId(roomId)
    setNewRoomName('')
  }

  const saveNote = (noteId: string) => {
    updateEmergency(noteId, {
      detail: noteDraft,
      placeId: notePlaceId || undefined,
    })
    setEditingNoteId(null)
  }

  const noteGone = async (noteId: string, label: string) => {
    if (
      await confirm({
        title: `“${label}” no longer needed?`,
        body: `If this only applied to ${place.name}, it can go.`,
        confirmLabel: 'Delete it',
        cancelLabel: 'Keep it',
      })
    ) {
      deleteEmergency(noteId)
    }
  }

  const finish = async () => {
    if (
      await confirm({
        title: `Remove “${place.name}” from the binder?`,
        body: 'Everything has been moved or resolved — its empty rooms go with it. Your activity record keeps the history.',
        confirmLabel: 'Remove it',
        cancelLabel: 'Not yet',
      })
    ) {
      removePlace(place.id)
      navigate('/binder')
    }
  }

  const stay = async () => {
    if (
      await confirm({
        title: `Staying at ${place.name} after all?`,
        body: 'The flags come off and everything stays exactly where it is.',
        confirmLabel: 'We’re staying',
        cancelLabel: 'Go back',
      })
    ) {
      setPlaceStatus(place.id, 'current')
      navigate('/binder')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/binder"
        className="inline-flex min-h-11 items-center gap-1.5 py-2 text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        Back to my binder
      </Link>

      <h1 className="mt-3 text-4xl">Leaving {place.name}</h1>
      <p className="mt-2 text-lg text-ink-soft">
        After a sale or a move, a surprising number of things still point at the old address. Here is
        everything in the binder connected to {place.name} — one small decision at a time, and the
        list will wait as long as you need.
      </p>

      {/* Where are things going? */}
      {destinations.length === 0 && items.length > 0 && (
        <Card className="mt-6 border-amber-deep/40 bg-amber/10 p-6">
          <p className="font-semibold">First: where are things going?</p>
          <p className="mt-1 text-ink-soft">
            Add the place your treasures are moving to — the new apartment, a family member’s house,
            a storage unit — and then each item can be moved there.
          </p>
          {addingPlace ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                className={inputClass}
                style={{ width: 'auto', flex: 1, minWidth: '12rem' }}
                value={newPlaceName}
                autoFocus
                onChange={(e) => setNewPlaceName(e.target.value)}
                placeholder="The new apartment"
              />
              <Button
                onClick={() => {
                  if (newPlaceName.trim()) {
                    addPlace(newPlaceName)
                    setNewPlaceName('')
                    setAddingPlace(false)
                  }
                }}
                disabled={!newPlaceName.trim()}
              >
                Add it
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button variant="secondary" icon={Plus} onClick={() => setAddingPlace(true)}>
                Add the new place
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Treasures still at the place */}
      {items.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl flex items-center gap-3">
            <DoorOpen className="h-6 w-6 text-clay" strokeWidth={2} aria-hidden="true" />
            Treasures still at {place.name}
          </h2>
          <div className="mt-3 space-y-3">
            {items.map((it) => (
              <Card key={it.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                    <ItemVisual item={it} rounded="rounded-none" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/item/${it.id}`} className="font-semibold hover:text-clay-dark">
                      {it.name}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {state.rooms.find((r) => r.id === it.roomId)?.name}
                    </p>
                  </div>
                  {movingItemId !== it.id && (
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setMovingItemId(it.id)
                          setTargetRoomId(destinationRooms[0]?.room.id ?? '')
                        }}
                        disabled={destinations.length === 0}
                      >
                        It moved
                      </Button>
                      <Button variant="ghost" onClick={() => void itemGone(it.id, it.name)}>
                        Sold or gone
                      </Button>
                    </div>
                  )}
                </div>
                {movingItemId === it.id && (
                  <div className="mt-4 border-t border-line pt-4">
                    <Field label={`Where does “${it.name}” live now?`}>
                      <select
                        className={inputClass}
                        value={targetRoomId}
                        onChange={(e) => setTargetRoomId(e.target.value)}
                      >
                        {destinationRooms.map(({ room, place: pl }) => (
                          <option key={room.id} value={room.id}>
                            {room.name} — {pl.name}
                          </option>
                        ))}
                        {destinationRooms.length === 0 && <option value="">No rooms yet…</option>}
                      </select>
                    </Field>
                    {destinations.map((pl) => (
                      <div key={pl.id} className="mb-3 flex flex-wrap items-center gap-2">
                        <input
                          className="min-w-40 flex-1 rounded-2xl border-2 border-line bg-white px-4 py-2.5 outline-none focus:border-clay"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          placeholder={`New room at ${pl.name}…`}
                        />
                        <Button
                          variant="ghost"
                          onClick={() => addDestinationRoom(pl.id)}
                          disabled={!newRoomName.trim()}
                        >
                          Add room
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setMovingItemId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => moveItem(it.id)} disabled={!targetRoomId}>
                        That’s where it is now
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notes tied to the place */}
      {notes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl flex items-center gap-3">
            <ScrollText className="h-6 w-6 text-clay" strokeWidth={2} aria-hidden="true" />
            Notes tied to {place.name}
          </h2>
          <p className="mt-1 text-ink-soft">
            Utility bills, insurance, deeds — anything written down about {place.name} probably
            reads differently now.
          </p>
          <div className="mt-3 space-y-3">
            {notes.map((e) => (
              <Card key={e.id} className="p-5">
                <h3 className="text-xl">{e.label}</h3>
                {sectionById(e.sectionId) && (
                  <p className="text-sm text-ink-soft">{sectionById(e.sectionId)!.title}</p>
                )}
                {editingNoteId === e.id ? (
                  <div className="mt-3">
                    <textarea
                      className={`${inputClass} min-h-24`}
                      value={noteDraft}
                      onChange={(ev) => setNoteDraft(ev.target.value)}
                      autoFocus
                    />
                    <Field label="Still tied to a place?">
                      <select
                        className={inputClass}
                        value={notePlaceId}
                        onChange={(ev) => setNotePlaceId(ev.target.value)}
                      >
                        <option value="">No — it stands on its own now</option>
                        {destinations.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="mt-2 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setEditingNoteId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => saveNote(e.id)}>Save the update</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 leading-relaxed text-ink-soft">{e.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingNoteId(e.id)
                          setNoteDraft(e.detail)
                          setNotePlaceId('')
                        }}
                      >
                        Update it
                      </Button>
                      <Button variant="ghost" onClick={() => void noteGone(e.id, e.label)}>
                        No longer needed
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done && (
        <Card className="mt-8 border-sage bg-sage/10 p-6">
          <div className="flex items-start gap-4">
            <CircleCheckBig className="mt-1 h-8 w-8 shrink-0 text-sage-deep" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-xl font-semibold">
                Everything from {place.name} has a new home in the binder.
              </p>
              <p className="mt-1 text-ink-soft">
                Nothing points at the old address anymore. You can remove {place.name} now, or leave
                it listed a while longer — either is fine.
              </p>
              <div className="mt-4">
                <Button onClick={() => void finish()}>Remove {place.name} from the binder</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        Plans changed?{' '}
        <button onClick={() => void stay()} className="font-semibold text-clay-dark underline">
          Actually, we’re staying at {place.name}
        </button>
      </p>
    </div>
  )
}
