import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BinderState, Item, Person, EmergencyEntry, Room } from './types'
import { seedState } from './data/seed'

const STORAGE_KEY = 'keepsake.binder.v2'
const TRASH_DAYS = 30

interface StoreApi {
  state: BinderState
  /** Non-null when the last save failed (e.g. storage full) — surfaced in the UI,
      never swallowed: a record the user believes is saved must never silently vanish. */
  saveError: string | null
  addItem: (item: Omit<Item, 'id'>) => string
  updateItem: (id: string, patch: Partial<Item>) => void
  /** Soft delete: moves to trash, restorable for 30 days. */
  deleteItem: (id: string) => void
  restoreItem: (id: string) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  /** Removes a person and clears any item wishes pointing at them. */
  removePerson: (id: string) => void
  addEmergency: (entry: Omit<EmergencyEntry, 'id'>) => void
  updateEmergency: (id: string, patch: Partial<EmergencyEntry>) => void
  deleteEmergency: (id: string) => void
  resetDemo: () => void
  /** Start a brand-new, empty binder for a real user (replaces current state). */
  startFresh: (ownerName: string) => void
  // selectors
  itemById: (id: string) => Item | undefined
  personById: (id: string) => Person | undefined
  roomById: (id: string) => Room | undefined
  itemsInRoom: (roomId: string) => Item[]
}

const StoreContext = createContext<StoreApi | null>(null)

/** Drop trashed items older than the restore window. */
function purgeTrash(state: BinderState): BinderState {
  const cutoff = Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000
  const trash = (state.trash ?? []).filter(
    (it) => it.deletedAt && new Date(it.deletedAt).getTime() > cutoff,
  )
  return { ...state, trash }
}

function load(): BinderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BinderState
      // Minimal shape check — corrupted storage must not brick the app.
      if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
        return purgeTrash({ trash: [], ...parsed })
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seedState
}

const id = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export function emptyBinder(ownerName: string): BinderState {
  const first = ownerName.trim().split(' ')[0] || 'My'
  return {
    ownerName: first,
    binderName: `${first}'s Binder`,
    rooms: [
      { id: 'living', name: 'Living Room' },
      { id: 'bedroom', name: 'Bedroom' },
    ],
    items: [],
    trash: [],
    people: [{ id: 'p-self', name: ownerName.trim(), relationship: 'Me', role: 'owner', color: '#c2603d' }],
    emergency: [],
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BinderState>(load)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setSaveError(null)
    } catch {
      // Storage full or unavailable. Say so, plainly — never lose work silently.
      setSaveError(
        'We could not save your latest change on this device — its storage may be full. Your binder is still open; please try removing a photo or freeing space, then make a small change to save again.',
      )
    }
  }, [state])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      saveError,
      addItem: (item) => {
        const newId = id('i')
        setState((s) => ({ ...s, items: [{ ...item, id: newId }, ...s.items] }))
        return newId
      },
      updateItem: (itemId, patch) =>
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
        })),
      deleteItem: (itemId) =>
        setState((s) => {
          const item = s.items.find((it) => it.id === itemId)
          if (!item) return s
          return {
            ...s,
            items: s.items.filter((it) => it.id !== itemId),
            trash: [{ ...item, deletedAt: new Date().toISOString() }, ...(s.trash ?? [])],
          }
        }),
      restoreItem: (itemId) =>
        setState((s) => {
          const item = (s.trash ?? []).find((it) => it.id === itemId)
          if (!item) return s
          const { deletedAt: _dropped, ...restored } = item
          return {
            ...s,
            items: [restored as Item, ...s.items],
            trash: (s.trash ?? []).filter((it) => it.id !== itemId),
          }
        }),
      addPerson: (person) =>
        setState((s) => ({ ...s, people: [...s.people, { ...person, id: id('p') }] })),
      updatePerson: (personId, patch) =>
        setState((s) => ({
          ...s,
          people: s.people.map((p) => (p.id === personId ? { ...p, ...patch } : p)),
        })),
      removePerson: (personId) =>
        setState((s) => ({
          ...s,
          people: s.people.filter((p) => p.id !== personId),
          // Clear wishes pointing at the removed person (both live and trashed items).
          items: s.items.map((it) =>
            it.beneficiaryId === personId ? { ...it, beneficiaryId: undefined } : it,
          ),
          trash: (s.trash ?? []).map((it) =>
            it.beneficiaryId === personId ? { ...it, beneficiaryId: undefined } : it,
          ),
        })),
      addEmergency: (entry) =>
        setState((s) => ({ ...s, emergency: [...s.emergency, { ...entry, id: id('e') }] })),
      updateEmergency: (entryId, patch) =>
        setState((s) => ({
          ...s,
          emergency: s.emergency.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
        })),
      deleteEmergency: (entryId) =>
        setState((s) => ({ ...s, emergency: s.emergency.filter((e) => e.id !== entryId) })),
      resetDemo: () => setState(seedState),
      startFresh: (ownerName) => setState(emptyBinder(ownerName)),
      itemById: (itemId) => state.items.find((it) => it.id === itemId),
      personById: (personId) => state.people.find((p) => p.id === personId),
      roomById: (roomId) => state.rooms.find((r) => r.id === roomId),
      itemsInRoom: (roomId) => state.items.filter((it) => it.roomId === roomId),
    }),
    [state, saveError],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export const money = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
