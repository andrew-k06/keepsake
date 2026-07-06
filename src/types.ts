// Core domain model for the Keepsake digital heirloom binder.
// Item-centric "star schema": everything hangs off Items, grouped by Rooms.

export type AppraisalStatus =
  | 'none'
  | 'requested'
  | 'photo-review' // can be appraised remotely from photos
  | 'needs-in-person' // jewelry/gems/watches/coins/firearms -> route to local appraiser
  | 'appraised'

export interface Person {
  id: string
  name: string
  relationship: string // "Daughter", "Son", "Spouse", "Friend"
  /** Access role. 'executor' = trusted contact whose access activates only
      through a verified process — never a live grant, never legal authority.
      (Server model splits access-membership from beneficiary-person; in this
      one-binder client the role lives here.) */
  role: 'owner' | 'collaborator' | 'viewer' | 'executor'
  email?: string
  color: string // avatar accent
}

export interface ItemDocument {
  id: string
  type: 'receipt' | 'appraisal' | 'warranty' | 'manual' | 'certificate' | 'photo'
  label: string
}

/** Where a value came from. Precedence when displaying:
    in-person appraisal > photo appraisal > owner's estimate > AI suggestion. */
export type ValuationSource = 'in-person-appraisal' | 'photo-appraisal' | 'owner' | 'ai'

/** One entry in an item's value HISTORY. Values are ranges — a single number
    implies certainty nobody has; low === high only for the owner's own figure. */
export interface Valuation {
  id: string
  source: ValuationSource
  low: number
  high: number
  /** Plain words, never percentages. */
  confidence?: 'guessing' | 'fairly sure' | 'confident'
  /** Where the number comes from, in a sentence (e.g. "Based on 14 completed sales"). */
  basis?: string
  date: string // ISO
}

/** A memory a family member attached to an item (Wave 3 collaboration). */
export interface ItemMemory {
  id: string
  personId: string
  text: string
  date: string
}

export interface Item {
  id: string
  name: string
  category: string
  roomId: string
  emoji?: string // DEPRECATED: legacy placeholder. No longer rendered — kept for back-compat.
  image?: string // hosted photographic image URL (e.g. seed data)
  photo?: string // data URL when the user adds a real photo of their own
  story: string // the provenance / "why it matters" narrative
  acquired?: string
  serial?: string
  condition?: string
  beneficiaryId?: string // Person the owner WISHES to receive this (never a legal transfer)
  appraisalStatus: AppraisalStatus
  /** Value history, newest first. Display via lib/value.ts, never directly. */
  valuations: Valuation[]
  documents: ItemDocument[]
  memories?: ItemMemory[]
  /** Insurance is always owner-attested — the app never asserts coverage. */
  insured?: boolean
  createdAt?: string
  updatedAt?: string
  /** Soft delete: set when removed; restorable for 30 days. */
  deletedAt?: string
}

export interface Room {
  id: string
  name: string
  emoji?: string // DEPRECATED: legacy placeholder. No longer rendered — kept for back-compat.
}

export interface EmergencyEntry {
  id: string
  label: string
  detail: string
}

/** One line in the binder's activity record. Backs the privacy promise
    ("see what has changed") and blunts quiet in-household edits. */
export interface AuditEntry {
  id: string
  at: string // ISO
  action: string // plain-language, e.g. 'Changed who the ring goes to: Sarah'
}

/** Plan simulation. 'starter' caps items; 'binder' is the one-time purchase
    (never a subscription for the owner); 'family' adds trend watching. */
export interface Plan {
  tier: 'starter' | 'binder' | 'family'
  activatedAt?: string
  /** Set when an adult child set this binder up as a gift. */
  giftFrom?: string
}

/** Trusted-contact (executor) release settings — dormant until verified. */
export interface ExecutorAccess {
  personId?: string
  /** How access would activate. Never automatic-on-a-guess. */
  protocol: 'owner-release' | 'verified-documents'
  /** Days between a verified request and access opening (owner can cancel). */
  waitDays: number
}

/** "Getting Ready" — the guided path. Most steps are DERIVED from the binder
    itself (the guide observes, it never asks users to claim work the app can
    verify); this slice records only the attested steps, skips, and session
    metadata. */
export interface PreparednessState {
  startedAt?: string
  lastVisitAt?: string
  /** Last step the user acted on — used for the "last time you…" welcome. */
  lastStepId?: string
  /** Person helping during a sit-together session. */
  togetherWithId?: string
  steps: Record<string, { status: 'done' | 'skipped'; at: string; together?: boolean }>
  /** Step ids whose one-time celebration has already shown. */
  celebrated: string[]
}

export interface BinderState {
  ownerName: string
  binderName: string
  plan: Plan
  rooms: Room[]
  items: Item[]
  /** Soft-deleted items, restorable for 30 days. */
  trash?: Item[]
  people: Person[]
  emergency: EmergencyEntry[]
  audit: AuditEntry[]
  executorAccess?: ExecutorAccess
  preparedness?: PreparednessState
}

export const STARTER_ITEM_LIMIT = 15

/** Curated categories — free text broke appraisal triage (case-sensitive
    string matching) and the icon map. "Other" is always available. */
export const CATEGORIES = [
  'Jewelry',
  'Watches',
  'Art',
  'China & Silver',
  'Furniture',
  'Collectibles',
  'Coins',
  'Antiques',
  'Instruments',
  'Other',
] as const
