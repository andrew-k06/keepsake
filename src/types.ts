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
      through a verified process — never a live grant, never legal authority. */
  role: 'owner' | 'collaborator' | 'viewer' | 'executor'
  email?: string
  color: string // avatar accent
}

export interface ItemDocument {
  id: string
  type: 'receipt' | 'appraisal' | 'warranty' | 'manual' | 'certificate' | 'photo'
  label: string
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
  estValue: number | null
  acquired?: string
  serial?: string
  condition?: string
  beneficiaryId?: string // Person the owner WISHES to receive this (never a legal transfer)
  appraisalStatus: AppraisalStatus
  appraisedValue?: number
  documents: ItemDocument[]
  /** Insurance is always owner-attested — the app never asserts coverage. */
  insured?: boolean
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

export interface BinderState {
  ownerName: string
  binderName: string
  rooms: Room[]
  items: Item[]
  /** Soft-deleted items, restorable for 30 days. */
  trash?: Item[]
  people: Person[]
  emergency: EmergencyEntry[]
}

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
