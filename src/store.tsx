import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  BinderState,
  ExecutorAccess,
  Item,
  ItemMemory,
  Person,
  Plan,
  EmergencyEntry,
  Room,
} from './types'
import { seedState } from './data/seed'
import { createRepository } from './data/repository'

const TRASH_DAYS = 30
const AUDIT_LIMIT = 200

interface StoreApi {
  state: BinderState
  /** Non-null when the last save failed — surfaced in the UI, never swallowed:
      a record the user believes is saved must never silently vanish. */
  saveError: string | null
  addItem: (item: Omit<Item, 'id'>) => string
  updateItem: (id: string, patch: Partial<Item>) => void
  /** Soft delete: moves to trash, restorable for 30 days. */
  deleteItem: (id: string) => void
  restoreItem: (id: string) => void
  addMemory: (itemId: string, personId: string, text: string) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  /** Removes a person and clears any item wishes pointing at them. */
  removePerson: (id: string) => void
  addEmergency: (entry: Omit<EmergencyEntry, 'id'>) => void
  updateEmergency: (id: string, patch: Partial<EmergencyEntry>) => void
  deleteEmergency: (id: string) => void
  setPlan: (plan: Plan) => void
  setExecutorAccess: (access: ExecutorAccess | undefined) => void
  /** Record an activity line (prints, exports, checks) in the binder's history. */
  logEvent: (action: string) => void
  resetDemo: () => void
  /** Start a brand-new, empty binder (optionally set up as a gift). */
  startFresh: (ownerName: string, opts?: { giftFrom?: string }) => void
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

const id = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export function emptyBinder(ownerName: string, opts: { giftFrom?: string } = {}): BinderState {
  const first = ownerName.trim().split(' ')[0] || 'My'
  return {
    ownerName: first,
    binderName: `${first}'s Binder`,
    plan: opts.giftFrom
      ? { tier: 'binder', activatedAt: new Date().toISOString(), giftFrom: opts.giftFrom }
      : { tier: 'starter' },
    rooms: [
      { id: 'living', name: 'Living Room' },
      { id: 'bedroom', name: 'Bedroom' },
    ],
    items: [],
    trash: [],
    people: [
      { id: 'p-self', name: ownerName.trim(), relationship: 'Me', role: 'owner', color: '#c2603d' },
      ...(opts.giftFrom
        ? [
            {
              id: 'p-gifter',
              name: opts.giftFrom.trim(),
              relationship: 'Family',
              role: 'collaborator' as const,
              color: '#4a7c6a',
            },
          ]
        : []),
    ],
    emergency: [],
    audit: opts.giftFrom
      ? [{ id: id('a'), at: new Date().toISOString(), action: `${opts.giftFrom.trim()} set this binder up as a gift` }]
      : [],
  }
}

/** Append an audit line, keeping the record bounded. */
function withAudit(s: BinderState, action: string): BinderState {
  return {
    ...s,
    audit: [{ id: id('a'), at: new Date().toISOString(), action }, ...(s.audit ?? [])].slice(0, AUDIT_LIMIT),
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const repo = useRef(createRepository())
  const [state, setState] = useState<BinderState | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Async boot: load from the repository; seed the demo binder on first run.
  useEffect(() => {
    let cancelled = false
    repo.current
      .load()
      .then((loaded) => {
        if (!cancelled) setState(purgeTrash(loaded ?? seedState))
      })
      .catch(() => {
        if (!cancelled) setState(seedState)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Write-through persistence; failures surface, never vanish.
  useEffect(() => {
    if (!state) return
    repo.current
      .save(state)
      .then(() => setSaveError(null))
      .catch(() =>
        setSaveError(
          'We could not save your latest change on this device — its storage may be full. Your binder is still open; please free some space, then make a small change to save again.',
        ),
      )
  }, [state])

  const api = useMemo<StoreApi | null>(() => {
    if (!state) return null
    const set = (updater: (s: BinderState) => BinderState) =>
      setState((s) => (s ? updater(s) : s))

    return {
      state,
      saveError,
      addItem: (item) => {
        const newId = id('i')
        const now = new Date().toISOString()
        set((s) =>
          withAudit(
            { ...s, items: [{ ...item, id: newId, createdAt: now, updatedAt: now }, ...s.items] },
            `You added “${item.name}”`,
          ),
        )
        return newId
      },
      updateItem: (itemId, patch) =>
        set((s) => {
          const item = s.items.find((it) => it.id === itemId)
          if (!item) return s
          let next: BinderState = {
            ...s,
            items: s.items.map((it) =>
              it.id === itemId ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it,
            ),
          }
          // Sensitive changes get their own plain-language audit line.
          if ('beneficiaryId' in patch && patch.beneficiaryId !== item.beneficiaryId) {
            const who = patch.beneficiaryId
              ? s.people.find((p) => p.id === patch.beneficiaryId)?.name ?? 'someone'
              : 'not yet decided'
            next = withAudit(next, `You changed who “${item.name}” goes to: ${who}`)
          }
          if ('insured' in patch && patch.insured !== item.insured) {
            next = withAudit(
              next,
              patch.insured
                ? `You noted “${item.name}” is insured`
                : `You noted “${item.name}” is not insured`,
            )
          }
          if ('story' in patch && patch.story !== item.story) {
            next = withAudit(next, `You updated the story of “${item.name}”`)
          }
          return next
        }),
      deleteItem: (itemId) =>
        set((s) => {
          const item = s.items.find((it) => it.id === itemId)
          if (!item) return s
          return withAudit(
            {
              ...s,
              items: s.items.filter((it) => it.id !== itemId),
              trash: [{ ...item, deletedAt: new Date().toISOString() }, ...(s.trash ?? [])],
            },
            `You removed “${item.name}” (restorable for 30 days)`,
          )
        }),
      restoreItem: (itemId) =>
        set((s) => {
          const item = (s.trash ?? []).find((it) => it.id === itemId)
          if (!item) return s
          const { deletedAt: _dropped, ...restored } = item
          return withAudit(
            {
              ...s,
              items: [restored as Item, ...s.items],
              trash: (s.trash ?? []).filter((it) => it.id !== itemId),
            },
            `You put “${item.name}” back`,
          )
        }),
      addMemory: (itemId, personId, text) =>
        set((s) => {
          const item = s.items.find((it) => it.id === itemId)
          const person = s.people.find((p) => p.id === personId)
          if (!item || !person) return s
          const memory: ItemMemory = { id: id('m'), personId, text, date: new Date().toISOString() }
          return withAudit(
            {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, memories: [...(it.memories ?? []), memory] } : it,
              ),
            },
            `${person.relationship === 'Me' ? 'You' : person.name} added a memory to “${item.name}”`,
          )
        }),
      addPerson: (person) =>
        set((s) =>
          withAudit(
            { ...s, people: [...s.people, { ...person, id: id('p') }] },
            `You added ${person.name} (${person.relationship})`,
          ),
        ),
      updatePerson: (personId, patch) =>
        set((s) => {
          const person = s.people.find((p) => p.id === personId)
          if (!person) return s
          let next: BinderState = {
            ...s,
            people: s.people.map((p) => (p.id === personId ? { ...p, ...patch } : p)),
          }
          if ('role' in patch && patch.role !== person.role) {
            next = withAudit(next, `You changed what ${person.name} can do`)
          }
          return next
        }),
      removePerson: (personId) =>
        set((s) => {
          const person = s.people.find((p) => p.id === personId)
          if (!person) return s
          return withAudit(
            {
              ...s,
              people: s.people.filter((p) => p.id !== personId),
              items: s.items.map((it) =>
                it.beneficiaryId === personId ? { ...it, beneficiaryId: undefined } : it,
              ),
              trash: (s.trash ?? []).map((it) =>
                it.beneficiaryId === personId ? { ...it, beneficiaryId: undefined } : it,
              ),
              executorAccess:
                s.executorAccess?.personId === personId ? undefined : s.executorAccess,
            },
            `You removed ${person.name}`,
          )
        }),
      addEmergency: (entry) =>
        set((s) =>
          withAudit(
            { ...s, emergency: [...s.emergency, { ...entry, id: id('e') }] },
            `You added the emergency note “${entry.label}”`,
          ),
        ),
      updateEmergency: (entryId, patch) =>
        set((s) => ({
          ...s,
          emergency: s.emergency.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
        })),
      deleteEmergency: (entryId) =>
        set((s) => ({ ...s, emergency: s.emergency.filter((e) => e.id !== entryId) })),
      setPlan: (plan) =>
        set((s) =>
          withAudit({ ...s, plan }, plan.tier === 'starter' ? 'Plan changed' : `You activated the ${plan.tier === 'binder' ? 'Keepsake Binder' : 'Family Plan'}`),
        ),
      setExecutorAccess: (access) =>
        set((s) => {
          const who = access?.personId ? s.people.find((p) => p.id === access.personId)?.name : undefined
          return withAudit(
            { ...s, executorAccess: access },
            access && who
              ? `You designated ${who} as your trusted contact`
              : 'You removed your trusted-contact designation',
          )
        }),
      logEvent: (action) => set((s) => withAudit(s, action)),
      resetDemo: () => setState(seedState),
      startFresh: (ownerName, opts) => setState(emptyBinder(ownerName, opts)),
      itemById: (itemId) => state.items.find((it) => it.id === itemId),
      personById: (personId) => state.people.find((p) => p.id === personId),
      roomById: (roomId) => state.rooms.find((r) => r.id === roomId),
      itemsInRoom: (roomId) => state.items.filter((it) => it.roomId === roomId),
    }
  }, [state, saveError])

  if (!api) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <p className="font-serif text-2xl text-ink-soft">Opening your binder…</p>
      </div>
    )
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export const money = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
