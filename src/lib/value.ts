// The single way to read an item's value. Values live as a HISTORY of ranged
// valuations (types.ts); nothing in the UI reads a raw number off the item.

import type { Item, Valuation, ValuationSource } from '../types'

const PRECEDENCE: ValuationSource[] = ['in-person-appraisal', 'photo-appraisal', 'owner', 'ai']

/** The valuation the app should currently stand behind, or null. */
export function currentValuation(item: Item): Valuation | null {
  const vals = item.valuations ?? []
  for (const source of PRECEDENCE) {
    const ofSource = vals.filter((v) => v.source === source)
    if (ofSource.length > 0) {
      return ofSource.reduce((a, b) => (a.date >= b.date ? a : b))
    }
  }
  return null
}

/** A single display number (midpoint of the current range), or null. */
export function bestAmount(item: Item): number | null {
  const v = currentValuation(item)
  if (!v) return null
  return Math.round((v.low + v.high) / 2)
}

/** Human label for where the shown value comes from. */
export function valueSourceLabel(item: Item): string {
  const v = currentValuation(item)
  if (!v) return 'no value recorded'
  switch (v.source) {
    case 'in-person-appraisal':
      return 'appraised in person'
    case 'photo-appraisal':
      return 'appraised from photos'
    case 'owner':
      return 'your estimate'
    case 'ai':
      return 'suggested range'
  }
}

/** True when the shown value is a professional appraisal. */
export function isAppraised(item: Item): boolean {
  const v = currentValuation(item)
  return v?.source === 'in-person-appraisal' || v?.source === 'photo-appraisal'
}

export function makeValuation(
  source: ValuationSource,
  low: number,
  high: number = low,
  extras: Partial<Pick<Valuation, 'confidence' | 'basis'>> = {},
): Valuation {
  return {
    id: `v-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    source,
    low,
    high,
    date: new Date().toISOString(),
    ...extras,
  }
}
