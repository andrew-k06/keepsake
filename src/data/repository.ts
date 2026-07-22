// BinderRepository — the persistence seam.
//
// Pages never touch storage; the store talks to this interface. Today it's
// IndexedDB on-device (with a localStorage fallback for locked-down browsers);
// the production backend implements the same contract (async, fallible) so
// swapping it in changes this file's export — not the pages, not the store.

import type { BinderState, Item, Valuation } from '../types'

/** Storage slot: the user's binder vs. Margaret's example. Keeping them in
    separate slots means viewing the example can never clobber real data. */
export type BinderSlot = 'main' | 'demo'

export interface BinderRepository {
  load(slot?: BinderSlot): Promise<BinderState | null>
  save(state: BinderState, slot?: BinderSlot): Promise<void>
}

/** Thrown when another tab/window has saved a newer revision — the caller
    must stop writing and offer a reload. Kills last-writer-wins clobbering. */
export class StaleWriteError extends Error {
  constructor() {
    super('A newer revision of the binder exists in storage.')
    this.name = 'StaleWriteError'
  }
}

const DB_NAME = 'keepsake'
const STORE = 'binders'
const PHOTO_STORE = 'photos'
const LEGACY_LS_KEYS = ['keepsake.binder.v3', 'keepsake.binder.v2']

// ---- Photo records --------------------------------------------------------
//
// Photos live OUTSIDE the binder blob. Serializing a ~300KB data URL per item
// into every whole-binder save meant ~15MB structured-cloned per keystroke at
// 50 items; as separate records, a save touches only the binder's text.

const photoCache = new Map<string, string>()

export const photoStoreAvailable = typeof indexedDB !== 'undefined'

export const photoStore = {
  prime(id: string, dataUrl: string): void {
    photoCache.set(id, dataUrl)
  },
  cached(id: string): string | undefined {
    return photoCache.get(id)
  },
  async put(id: string, dataUrl: string): Promise<void> {
    photoCache.set(id, dataUrl)
    const db = await sharedDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite')
      tx.objectStore(PHOTO_STORE).put(dataUrl, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('photo save failed'))
    })
  },
  async get(id: string): Promise<string | null> {
    const hit = photoCache.get(id)
    if (hit) return hit
    const db = await sharedDb()
    const value = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly')
      const req = tx.objectStore(PHOTO_STORE).get(id)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    if (typeof value === 'string') {
      photoCache.set(id, value)
      return value
    }
    return null
  },
}

let dbPromise: Promise<IDBDatabase> | null = null
function sharedDb(): Promise<IDBDatabase> {
  if (!dbPromise) dbPromise = openDb()
  return dbPromise
}

/** Move inline photo data URLs into the photo store (boot + import path).
    No-op where IndexedDB is unavailable — photos stay inline there. */
export async function externalizePhotos(state: BinderState): Promise<BinderState> {
  if (!photoStoreAvailable) return state
  const moveAll = async (items: Item[]): Promise<Item[]> =>
    Promise.all(
      items.map(async (it) => {
        if (it.photo?.startsWith('data:')) {
          const pid = it.photoId ?? `ph-${it.id}`
          await photoStore.put(pid, it.photo).catch(() => undefined)
          return { ...it, photo: undefined, photoId: pid }
        }
        return it
      }),
    )
  return {
    ...state,
    items: await moveAll(state.items),
    trash: state.trash ? await moveAll(state.trash) : state.trash,
  }
}

/** Inline stored photos back into the state (backup export — the file the
    user holds must be complete on its own). */
export async function inlinePhotos(state: BinderState): Promise<BinderState> {
  const fill = async (items: Item[]): Promise<Item[]> =>
    Promise.all(
      items.map(async (it) => {
        if (it.photoId && !it.photo) {
          const dataUrl = await photoStore.get(it.photoId).catch(() => null)
          if (dataUrl) return { ...it, photo: dataUrl, photoId: undefined }
        }
        return it
      }),
    )
  return {
    ...state,
    items: await fill(state.items),
    trash: state.trash ? await fill(state.trash) : state.trash,
  }
}

// ---- Migration: any older stored shape -> the current BinderState ----------

/** Upgrade older persisted binders in place. Idempotent. */
export function migrate(raw: unknown): BinderState | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (!Array.isArray(s.items) || !Array.isArray(s.rooms) || (s.rooms as unknown[]).length === 0) {
    return null
  }

  const items = (s.items as Array<Record<string, unknown>>).map(migrateItem)
  const trash = Array.isArray(s.trash) ? (s.trash as Array<Record<string, unknown>>).map(migrateItem) : []

  // Partial preparedness (from builds before celebrations/steps shipped) must
  // never crash later dereferences — default every field.
  let preparedness: BinderState['preparedness']
  if (s.preparedness && typeof s.preparedness === 'object') {
    const p = s.preparedness as Record<string, unknown>
    preparedness = {
      startedAt: typeof p.startedAt === 'string' ? p.startedAt : undefined,
      lastVisitAt: typeof p.lastVisitAt === 'string' ? p.lastVisitAt : undefined,
      lastStepId: typeof p.lastStepId === 'string' ? p.lastStepId : undefined,
      togetherWithId: typeof p.togetherWithId === 'string' ? p.togetherWithId : undefined,
      activeStepId: typeof p.activeStepId === 'string' ? p.activeStepId : undefined,
      steps: (p.steps && typeof p.steps === 'object' ? p.steps : {}) as NonNullable<
        BinderState['preparedness']
      >['steps'],
      celebrated: Array.isArray(p.celebrated) ? (p.celebrated as string[]) : [],
    }
  }

  return {
    isDemo: s.isDemo === true,
    ownerName: String(s.ownerName ?? 'Friend'),
    binderName: String(s.binderName ?? 'My Binder'),
    plan: (s.plan as BinderState['plan']) ?? { tier: 'starter' },
    rooms: s.rooms as BinderState['rooms'],
    items,
    trash,
    people: ((s.people as BinderState['people']) ?? []).map((p2) =>
      p2.role === 'executor' ? { ...p2, role: 'viewer' as const } : p2,
    ),
    emergency: (s.emergency as BinderState['emergency']) ?? [],
    audit: Array.isArray(s.audit) ? (s.audit as BinderState['audit']) : [],
    executorAccess: s.executorAccess as BinderState['executorAccess'],
    preparedness,
  }
}

/** v2 items carried estValue / appraisedValue scalars; fold them into the
    valuations history so value provenance survives the upgrade. */
function migrateItem(it: Record<string, unknown>): Item {
  const valuations: Valuation[] = Array.isArray(it.valuations) ? (it.valuations as Valuation[]) : []
  if (valuations.length === 0) {
    const est = it.estValue
    const app = it.appraisedValue
    if (typeof est === 'number') {
      valuations.push({
        id: `v-mig-est-${it.id}`,
        source: 'owner',
        low: est,
        high: est,
        date: '2026-01-01T00:00:00.000Z',
      })
    }
    if (typeof app === 'number') {
      valuations.push({
        id: `v-mig-app-${it.id}`,
        source: 'in-person-appraisal',
        low: app,
        high: app,
        date: '2026-01-02T00:00:00.000Z',
      })
    }
  }
  // photoId passthrough is implicit via rest-spread below.
  // Drop deprecated fields; default anything the UI dereferences.
  const { estValue: _e, appraisedValue: _a, emoji: _emoji, ...rest } = it
  const item = rest as unknown as Item
  return {
    ...item,
    valuations,
    documents: Array.isArray(item.documents) ? item.documents : [],
    memories: Array.isArray(item.memories) ? item.memories : undefined,
    appraisalStatus: item.appraisalStatus ?? 'none',
    story: typeof item.story === 'string' ? item.story : '',
  }
}

// ---- IndexedDB adapter ------------------------------------------------------

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
      if (!req.result.objectStoreNames.contains(PHOTO_STORE))
        req.result.createObjectStore(PHOTO_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB unavailable'))
  })
}

class IndexedDbRepository implements BinderRepository {
  private db: Promise<IDBDatabase>
  /** Last revision this tab loaded or wrote, per slot (CAS token). */
  private rev: Record<string, number> = {}

  constructor() {
    this.db = sharedDb()
  }

  async load(slot: BinderSlot = 'main'): Promise<BinderState | null> {
    const db = await this.db
    const stored = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(slot)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    if (stored) {
      this.rev[slot] = (stored as { _rev?: number })._rev ?? 0
      return migrate(stored)
    }

    // First run on this adapter: import any binder saved by earlier builds
    // (they predate slots, so legacy data belongs to 'main').
    if (slot === 'main') {
      for (const lsKey of LEGACY_LS_KEYS) {
        try {
          const raw = localStorage.getItem(lsKey)
          if (raw) {
            const migrated = migrate(JSON.parse(raw))
            if (migrated) {
              await this.save(migrated, slot)
              return migrated
            }
          }
        } catch {
          /* keep trying older keys */
        }
      }
    }
    return null
  }

  async save(state: BinderState, slot: BinderSlot = 'main'): Promise<void> {
    const db = await this.db
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      // Compare-and-swap within the transaction: if storage holds a newer
      // revision than this tab last saw, another window wrote — refuse.
      const getReq = store.get(slot)
      getReq.onsuccess = () => {
        const storedRev = (getReq.result as { _rev?: number } | undefined)?._rev ?? 0
        const myRev = this.rev[slot] ?? 0
        if (storedRev > myRev) {
          tx.abort()
          reject(new StaleWriteError())
          return
        }
        const nextRev = storedRev + 1
        store.put({ ...state, _rev: nextRev }, slot)
        this.rev[slot] = nextRev
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('save failed'))
      tx.onabort = () => {
        /* reject already called for stale writes; other aborts: */
        reject(tx.error ?? new StaleWriteError())
      }
    })
  }
}

class LocalStorageRepository implements BinderRepository {
  async load(slot: BinderSlot = 'main'): Promise<BinderState | null> {
    const keys = slot === 'main' ? LEGACY_LS_KEYS : [`keepsake.binder.${slot}`]
    for (const lsKey of keys) {
      try {
        const raw = localStorage.getItem(lsKey)
        if (raw) {
          const migrated = migrate(JSON.parse(raw))
          if (migrated) return migrated
        }
      } catch {
        /* try next */
      }
    }
    return null
  }

  async save(state: BinderState, slot: BinderSlot = 'main'): Promise<void> {
    const key = slot === 'main' ? 'keepsake.binder.v3' : `keepsake.binder.${slot}`
    localStorage.setItem(key, JSON.stringify(state))
  }
}

export function createRepository(): BinderRepository {
  if (typeof indexedDB !== 'undefined') {
    try {
      return new IndexedDbRepository()
    } catch {
      /* private mode / locked-down browsers */
    }
  }
  return new LocalStorageRepository()
}
