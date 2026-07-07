// BinderRepository — the persistence seam.
//
// Pages never touch storage; the store talks to this interface. Today it's
// IndexedDB on-device (with a localStorage fallback for locked-down browsers);
// the production backend implements the same contract (async, fallible) so
// swapping it in changes this file's export — not the pages, not the store.

import type { BinderState, Item, Valuation } from '../types'

export interface BinderRepository {
  load(): Promise<BinderState | null>
  save(state: BinderState): Promise<void>
}

const DB_NAME = 'keepsake'
const STORE = 'binders'
const KEY = 'main'
const LEGACY_LS_KEYS = ['keepsake.binder.v3', 'keepsake.binder.v2']

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
    people: (s.people as BinderState['people']) ?? [],
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
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB unavailable'))
  })
}

class IndexedDbRepository implements BinderRepository {
  private db: Promise<IDBDatabase>

  constructor() {
    this.db = openDb()
  }

  async load(): Promise<BinderState | null> {
    const db = await this.db
    const stored = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    if (stored) return migrate(stored)

    // First run on this adapter: import any binder saved by earlier builds.
    for (const lsKey of LEGACY_LS_KEYS) {
      try {
        const raw = localStorage.getItem(lsKey)
        if (raw) {
          const migrated = migrate(JSON.parse(raw))
          if (migrated) {
            await this.save(migrated)
            return migrated
          }
        }
      } catch {
        /* keep trying older keys */
      }
    }
    return null
  }

  async save(state: BinderState): Promise<void> {
    const db = await this.db
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(state, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('save failed'))
      tx.onabort = () => reject(tx.error ?? new Error('save aborted'))
    })
  }
}

class LocalStorageRepository implements BinderRepository {
  async load(): Promise<BinderState | null> {
    for (const lsKey of LEGACY_LS_KEYS) {
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

  async save(state: BinderState): Promise<void> {
    localStorage.setItem('keepsake.binder.v3', JSON.stringify(state))
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
