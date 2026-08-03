// Places — the location layer. Rooms belong to places; emergency notes can be
// tied to them. These selectors are the single way pages reason about what is
// connected to a place (the update-workflow math lives here, not in pages).

import type { BinderState, EmergencyEntry, Item, Place } from '../types'

export const DEFAULT_PLACE_ID = 'pl-home'

export const placesOf = (s: BinderState): Place[] =>
  s.places && s.places.length > 0
    ? s.places
    : [{ id: DEFAULT_PLACE_ID, name: 'Home', status: 'current' }]

export const placeById = (s: BinderState, id?: string): Place | undefined =>
  placesOf(s).find((p) => p.id === id)

export const placeForRoom = (s: BinderState, roomId: string): Place | undefined => {
  const room = s.rooms.find((r) => r.id === roomId)
  return placeById(s, room?.placeId ?? DEFAULT_PLACE_ID)
}

export const roomsOfPlace = (s: BinderState, placeId: string) =>
  s.rooms.filter((r) => (r.placeId ?? DEFAULT_PLACE_ID) === placeId)

export const itemsAtPlace = (s: BinderState, placeId: string): Item[] => {
  const roomIds = new Set(roomsOfPlace(s, placeId).map((r) => r.id))
  return s.items.filter((it) => roomIds.has(it.roomId))
}

export const notesForPlace = (s: BinderState, placeId: string): EmergencyEntry[] =>
  s.emergency.filter((e) => e.placeId === placeId)

/** Everything still pointing at a place — the update-workflow worklist. */
export const pendingForPlace = (s: BinderState, placeId: string) => {
  const items = itemsAtPlace(s, placeId)
  const notes = notesForPlace(s, placeId)
  return { items, notes, total: items.length + notes.length }
}

/** Current places OTHER than this one — where things can move to. */
export const destinationPlaces = (s: BinderState, exceptId: string): Place[] =>
  placesOf(s).filter((p) => p.id !== exceptId && p.status === 'current')
