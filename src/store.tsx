import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BinderState, Item, Person, EmergencyEntry, Room } from './types'
import { seedState } from './data/seed'

const STORAGE_KEY = 'keepsake.binder.v2'

interface StoreApi {
  state: BinderState
  addItem: (item: Omit<Item, 'id'>) => string
  updateItem: (id: string, patch: Partial<Item>) => void
  deleteItem: (id: string) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  addEmergency: (entry: Omit<EmergencyEntry, 'id'>) => void
  resetDemo: () => void
  // selectors
  itemById: (id: string) => Item | undefined
  personById: (id: string) => Person | undefined
  roomById: (id: string) => Room | undefined
  itemsInRoom: (roomId: string) => Item[]
}

const StoreContext = createContext<StoreApi | null>(null)

function load(): BinderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as BinderState
  } catch {
    /* ignore */
  }
  return seedState
}

const id = (prefix: string) =>
  `${prefix}-${Math.floor(performance.now() * 1000).toString(36)}-${Math.floor(
    (typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : 1) % 1e6,
  ).toString(36)}`

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BinderState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const api = useMemo<StoreApi>(
    () => ({
      state,
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
        setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== itemId) })),
      addPerson: (person) =>
        setState((s) => ({ ...s, people: [...s.people, { ...person, id: id('p') }] })),
      addEmergency: (entry) =>
        setState((s) => ({ ...s, emergency: [...s.emergency, { ...entry, id: id('e') }] })),
      resetDemo: () => setState(seedState),
      itemById: (itemId) => state.items.find((it) => it.id === itemId),
      personById: (personId) => state.people.find((p) => p.id === personId),
      roomById: (roomId) => state.rooms.find((r) => r.id === roomId),
      itemsInRoom: (roomId) => state.items.filter((it) => it.roomId === roomId),
    }),
    [state],
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
