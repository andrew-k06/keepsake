import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  BinderState,
  ExecutorAccess,
  Item,
  ItemDocument,
  ItemMemory,
  Person,
  Plan,
  EmergencyEntry,
  Room,
} from './types'
import { seedState } from './data/seed'
import { createRepository, externalizePhotos, photoStore, photoStoreAvailable, StaleWriteError } from './data/repository'
import { STEPS, stepDone, emptyPreparedness } from './lib/prepare'

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
  /** Set/replace an item's photo from a captured data URL (stored outside the blob). */
  setItemPhoto: (itemId: string, dataUrl: string) => void
  addDocument: (itemId: string, doc: Omit<ItemDocument, 'id'>) => void
  removeDocument: (itemId: string, docId: string) => void
  addRoom: (name: string) => string
  renameRoom: (roomId: string, name: string) => void
  addPerson: (person: Omit<Person, 'id'>) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  /** Removes a person and clears any item wishes pointing at them. */
  removePerson: (id: string) => void
  addEmergency: (entry: Omit<EmergencyEntry, 'id'>) => void
  updateEmergency: (id: string, patch: Partial<EmergencyEntry>) => void
  deleteEmergency: (id: string) => void
  setPlan: (plan: Plan) => void
  setExecutorAccess: (access: ExecutorAccess | undefined) => void
  /** Getting Ready path. startPath is idempotent; attested steps only —
      derived steps complete themselves by observing the binder. */
  startPath: () => void
  completeStep: (stepId: string) => void
  skipStep: (stepId: string) => void
  /** Mark the step the user just left the Guide to do (persists over reload). */
  setActiveStep: (stepId?: string) => void
  /** How the user wants to take the path (little bites vs. see everything). */
  setPace: (pace: 'bites' | 'explore') => void
  setTogether: (personId?: string) => void
  markCelebrated: (stepId: string) => void
  /** Record an activity line (prints, exports, checks) in the binder's history. */
  logEvent: (action: string) => void
  /** Replace the whole binder (backup import). Caller confirms first. */
  replaceBinder: (next: BinderState) => void
  /** True when another tab/window wrote the binder — reload to see it. */
  otherTabWrote: boolean
  resetDemo: () => void
  /** Open Margaret's example binder (its own storage slot — the user's
      binder is untouched and always recoverable). Loads pristine seed. */
  viewExample: () => void
  /** Leave the example. Resolves false when no user binder exists yet. */
  exitExample: () => Promise<boolean>
  /** Start a brand-new, empty binder (optionally set up as a gift). */
  startFresh: (ownerName: string, opts?: { giftFrom?: string }) => void
  // selectors
  itemById: (id: string) => Item | undefined
  personById: (id: string) => Person | undefined
  roomById: (id: string) => Room | undefined
  itemsInRoom: (roomId: string) => Item[]
}

const StoreContext = createContext<StoreApi | null>(null)

/** Drop trashed items older than the restore window. Exported for tests. */
export function purgeTrash(state: BinderState): BinderState {
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
    // A gifted binder opens on the guide IN Together mode — the giver's
    // first visit is chapter one with the script in hand.
    preparedness: opts.giftFrom
      ? { ...emptyPreparedness(), togetherWithId: 'p-gifter' }
      : undefined,
  }
}

/** Lazily create the preparedness slice OUTSIDE of startPath. Pre-credits
    everything the binder already satisfies so a later first visit to the
    Guide never fires a celebration barrage for work life already did. */
export function ensurePrep(s: BinderState) {
  if (s.preparedness) return s.preparedness
  const prep = emptyPreparedness()
  prep.celebrated = STEPS.filter((st) => stepDone(s, st)).map((st) => st.id)
  return prep
}

/** Move a freshly captured data URL into the photo store, returning the item
    patch to apply. Falls back to inline when IndexedDB is unavailable. */
function externalizeCapture(itemId: string, dataUrl: string): Partial<Item> {
  if (!photoStoreAvailable) return { photo: dataUrl, photoId: undefined }
  const pid = `ph-${itemId}-${Date.now().toString(36)}`
  photoStore.prime(pid, dataUrl)
  void photoStore.put(pid, dataUrl).catch(() => {})
  return { photo: undefined, photoId: pid }
}

/** Append an audit line, keeping the record bounded. */
function withAudit(s: BinderState, action: string): BinderState {
  return {
    ...s,
    audit: [{ id: id('a'), at: new Date().toISOString(), action }, ...(s.audit ?? [])].slice(0, AUDIT_LIMIT),
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const repo = useRef<ReturnType<typeof createRepository> | null>(null)
  if (!repo.current) repo.current = createRepository()
  const [state, setState] = useState<BinderState | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Ask the browser to protect our storage from eviction — without this,
  // iOS/Safari can silently drop IndexedDB after ~7 days of disuse, and this
  // product's cadence is one Sunday a month.
  useEffect(() => {
    void navigator.storage?.persist?.().catch(() => {})
  }, [])

  // Which storage slot the current state persists to. The example binder
  // lives in its own slot so it can never clobber the user's data.
  const activeSlot = useRef<'main' | 'demo'>('main')

  // Async boot: the user's binder if one exists; otherwise the example.
  useEffect(() => {
    let cancelled = false
    repo.current!
      .load('main')
      .then(async (main) => {
        if (cancelled) return
        if (main) {
          activeSlot.current = 'main'
          setState(purgeTrash(await externalizePhotos(main)))
        } else {
          const demo = await repo.current!.load('demo').catch(() => null)
          if (cancelled) return
          activeSlot.current = 'demo'
          setState(purgeTrash(demo ?? seedState))
        }
      })
      .catch(() => {
        if (!cancelled) {
          activeSlot.current = 'demo'
          setState(seedState)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Write-through persistence; failures surface, never vanish. The sequence
  // guard keeps a slow, early save from clearing (or raising) a banner that
  // belongs to a newer save — matters under the localStorage fallback.
  const saveSeq = useRef(0)
  const savedSeq = useRef(0)
  const latestState = useRef<BinderState | null>(null)
  const [otherTabWrote, setOtherTabWrote] = useState(false)
  const otherTabWroteRef = useRef(false)
  const markSuperseded = () => {
    otherTabWroteRef.current = true
    setOtherTabWrote(true)
  }
  const tabId = useRef(Math.random().toString(36).slice(2))
  const channel = useRef<BroadcastChannel | null>(null)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel('keepsake-binder')
    channel.current = ch
    ch.onmessage = (e) => {
      if (e.data?.tab && e.data.tab !== tabId.current) markSuperseded()
    }
    return () => ch.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!state) return
    latestState.current = state
    // A superseded window must stop writing: another tab holds the truth.
    if (otherTabWroteRef.current) return
    const seq = ++saveSeq.current
    repo.current!
      .save(state, activeSlot.current)
      .then(() => {
        savedSeq.current = Math.max(savedSeq.current, seq)
        if (seq === saveSeq.current) setSaveError(null)
        channel.current?.postMessage({ tab: tabId.current })
      })
      .catch((err) => {
        if (err instanceof StaleWriteError) {
          // Another window saved a newer revision — freeze this one.
          markSuperseded()
          return
        }
        if (seq === saveSeq.current)
          setSaveError(
            'We could not save your latest change on this device — its storage may be full. Your binder is still open; please free some space, then make a small change to save again.',
          )
      })
  }, [state])

  // Best-effort flush when the tab is hidden or closing — but ONLY when this
  // tab actually has unsaved changes, and never once superseded. An
  // unconditional flush re-saved a STALE snapshot when an untouched window
  // closed, silently reverting edits made in another window (found by the
  // first ICP field test: two of three insured flags vanished).
  useEffect(() => {
    const flush = () => {
      if (otherTabWroteRef.current) return
      if (saveSeq.current === savedSeq.current) return // nothing unsaved here
      if (latestState.current)
        void repo.current!.save(latestState.current, activeSlot.current).catch(() => {})
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

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
        const photoPatch = item.photo?.startsWith('data:')
          ? externalizeCapture(newId, item.photo)
          : {}
        set((s) =>
          withAudit(
            {
              ...s,
              items: [
                { ...item, ...photoPatch, id: newId, createdAt: now, updatedAt: now },
                ...s.items,
              ],
            },
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
          if ('significance' in patch && patch.significance !== item.significance) {
            next = withAudit(next, `You wrote what “${item.name}” means to you`)
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
      setItemPhoto: (itemId, dataUrl) =>
        set((s) => ({
          ...s,
          items: s.items.map((it) =>
            it.id === itemId
              ? { ...it, ...externalizeCapture(itemId, dataUrl), updatedAt: new Date().toISOString() }
              : it,
          ),
        })),
      addDocument: (itemId, doc) =>
        set((s) => {
          const item = s.items.find((it) => it.id === itemId)
          if (!item) return s
          return withAudit(
            {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId
                  ? { ...it, documents: [...it.documents, { ...doc, id: id('d') }] }
                  : it,
              ),
            },
            `You attached “${doc.label}” to “${item.name}”`,
          )
        }),
      removeDocument: (itemId, docId) =>
        set((s) => ({
          ...s,
          items: s.items.map((it) =>
            it.id === itemId
              ? { ...it, documents: it.documents.filter((d) => d.id !== docId) }
              : it,
          ),
        })),
      addRoom: (name) => {
        const newId = id('r')
        set((s) =>
          withAudit(
            { ...s, rooms: [...s.rooms, { id: newId, name: name.trim() }] },
            `You added the room “${name.trim()}”`,
          ),
        )
        return newId
      },
      renameRoom: (roomId, name) =>
        set((s) => {
          const room = s.rooms.find((r) => r.id === roomId)
          if (!room || !name.trim()) return s
          return withAudit(
            {
              ...s,
              rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, name: name.trim() } : r)),
            },
            `You renamed the room “${room.name}” to “${name.trim()}”`,
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
        set((s) => {
          const entry = s.emergency.find((e) => e.id === entryId)
          if (!entry) return s
          return withAudit(
            {
              ...s,
              emergency: s.emergency.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
            },
            `You updated the emergency note “${entry.label}”`,
          )
        }),
      deleteEmergency: (entryId) =>
        set((s) => {
          const entry = s.emergency.find((e) => e.id === entryId)
          if (!entry) return s
          return withAudit(
            { ...s, emergency: s.emergency.filter((e) => e.id !== entryId) },
            `You deleted the emergency note “${entry.label}”`,
          )
        }),
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
      startPath: () =>
        set((s) => {
          if (s.preparedness?.startedAt)
            return {
              ...s,
              preparedness: {
                ...s.preparedness,
                lastVisitAt: new Date().toISOString(),
                // Back on the Guide: the out-doing-a-step marker is done its job.
                activeStepId: undefined,
              },
            }
          const prep = emptyPreparedness()
          // Credit life: steps the binder already satisfies don't fire a
          // celebration barrage on the first visit.
          prep.celebrated = STEPS.filter((st) => stepDone(s, st)).map((st) => st.id)
          return withAudit({ ...s, preparedness: prep }, 'You opened your Getting Ready path')
        }),
      completeStep: (stepId) =>
        set((s) => {
          const step = STEPS.find((st) => st.id === stepId)
          if (!step) return s
          const prep = ensurePrep(s)
          if (prep.steps[stepId]?.status === 'done') return s
          const together = prep.togetherWithId
          const who = together ? s.people.find((p) => p.id === together)?.name : undefined
          return withAudit(
            {
              ...s,
              preparedness: {
                ...prep,
                lastStepId: stepId,
                lastVisitAt: new Date().toISOString(),
                activeStepId: prep.activeStepId === stepId ? undefined : prep.activeStepId,
                steps: {
                  ...prep.steps,
                  [stepId]: { status: 'done', at: new Date().toISOString(), together: Boolean(together) },
                },
              },
            },
            who ? `You and ${who} finished “${step.title}”` : `You finished “${step.title}”`,
          )
        }),
      skipStep: (stepId) =>
        set((s) => {
          const prep = ensurePrep(s)
          if (prep.steps[stepId]?.status === 'done') return s
          // "Not today" is remembered, never audited — no shame trail.
          return {
            ...s,
            preparedness: {
              ...prep,
              lastStepId: stepId,
              lastVisitAt: new Date().toISOString(),
              steps: { ...prep.steps, [stepId]: { status: 'skipped', at: new Date().toISOString() } },
            },
          }
        }),
      setActiveStep: (stepId) =>
        set((s) => ({ ...s, preparedness: { ...ensurePrep(s), activeStepId: stepId } })),
      setPace: (pace) =>
        set((s) =>
          withAudit(
            { ...s, preparedness: { ...ensurePrep(s), pace } },
            pace === 'bites'
              ? 'You chose to take the path in little bites'
              : 'You chose to see the whole path at once',
          ),
        ),
      setTogether: (personId) =>
        set((s) => {
          const prep = ensurePrep(s)
          const who = personId ? s.people.find((p) => p.id === personId)?.name : undefined
          const next = { ...s, preparedness: { ...prep, togetherWithId: personId } }
          return who ? withAudit(next, `You started a visit together with ${who}`) : next
        }),
      markCelebrated: (stepId) =>
        set((s) => {
          const prep = ensurePrep(s)
          if (prep.celebrated.includes(stepId)) return s
          return { ...s, preparedness: { ...prep, celebrated: [...prep.celebrated, stepId] } }
        }),
      logEvent: (action) => set((s) => withAudit(s, action)),
      replaceBinder: (next) => {
        activeSlot.current = 'main'
        void externalizePhotos({ ...next, isDemo: false }).then((moved) =>
          setState(withAudit(purgeTrash(moved), 'You restored this binder from a backup file')),
        )
      },
      otherTabWrote,
      resetDemo: () => {
        activeSlot.current = 'demo'
        setState(seedState)
      },
      viewExample: () => {
        // Always pristine: a walkthrough that went off-script starts clean.
        activeSlot.current = 'demo'
        setState(seedState)
      },
      exitExample: async () => {
        const main = await repo.current!.load('main').catch(() => null)
        if (!main) return false
        activeSlot.current = 'main'
        setState(purgeTrash(main))
        return true
      },
      startFresh: (ownerName, opts) => {
        activeSlot.current = 'main'
        setState(emptyBinder(ownerName, opts))
      },
      itemById: (itemId) => state.items.find((it) => it.id === itemId),
      personById: (personId) => state.people.find((p) => p.id === personId),
      roomById: (roomId) => state.rooms.find((r) => r.id === roomId),
      itemsInRoom: (roomId) => state.items.filter((it) => it.roomId === roomId),
    }
  }, [state, saveError, otherTabWrote])

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
