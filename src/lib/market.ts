// Market trends — "is this trending up or down?" — delivered kindly.
//
// Design rules from the review, encoded here so every surface obeys them:
//   1. Always a SOLD-PRICE RANGE with receipts, never a bare number.
//   2. Words, not stock tickers: "gently down", "holding steady", "up quite a bit".
//   3. Truth + dignity + agency for falling values: lead with today's fact,
//      blame the market (not their taste), then separate market price from
//      family meaning — the story lives on the same card.
//
// This build uses example category profiles (clearly labeled in the UI); the
// full app swaps this module for a comps service (eBay sold listings, auction
// records) behind the same function signature.

import type { Item } from '../types'
import { bestAmount } from './value'

export interface Comp {
  label: string
  price: number
  when: string
  where: string
}

export interface MarketSnapshot {
  trend: 'up' | 'steady' | 'down'
  /** Signed % change over windowYears. */
  changePct: number
  windowYears: number
  low: number
  high: number
  /** Today's fact, first: "Sets like this sell for $860–$1,300 today." */
  headline: string
  /** The market's fault, never theirs. */
  context: string
  /** Only for declines: market price is not family value. */
  meaning?: string
  comps: Comp[]
  basis: string
}

interface Profile {
  changePct: number
  context: string
}

const PROFILES: Record<string, Profile> = {
  'China & Silver': {
    changePct: -40,
    context:
      'Fewer families set a formal table now, so prices for fine china have come down quite a bit — that’s true for nearly everyone’s set, not just yours.',
  },
  Antiques: {
    changePct: -25,
    context:
      'Formal antiques are out of fashion with younger buyers at the moment, which has pulled prices down across the board.',
  },
  Furniture: {
    changePct: -10,
    context:
      'Traditional furniture has softened a little, though well-made pieces with a story still find good homes.',
  },
  Watches: {
    changePct: 45,
    context: 'Collectors have fallen back in love with mechanical watches — good ones sell for more every year.',
  },
  Jewelry: {
    changePct: 22,
    context: 'Gold and diamond prices have risen, which lifts fine jewelry with them.',
  },
  Coins: {
    changePct: 12,
    context: 'Silver content puts a rising floor under older U.S. dollars, and collectors pay extra for the scarce dates.',
  },
  Art: {
    changePct: 0,
    context: 'Original art tends to hold its value when it’s well cared for; individual artists vary a great deal.',
  },
  Instruments: {
    changePct: 5,
    context: 'Well-kept instruments hold their value; players always need them.',
  },
  Collectibles: {
    changePct: 0,
    context: 'Collectible prices depend a great deal on the exact piece and its condition.',
  },
  'Rugs & Textiles': {
    changePct: -15,
    context:
      'Hand-made rugs and textiles have softened with changing tastes — though fine older pieces still find devoted buyers.',
  },
  'Décor & Cultural Pieces': {
    changePct: 0,
    context:
      'Value varies widely with the maker and the piece’s history — the story you keep with it does real work here.',
  },
  Other: {
    changePct: 0,
    context: 'Prices for pieces like this vary — condition and maker matter most.',
  },
}

/** Small deterministic hash so demo numbers are stable per item. */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const STATES = ['Ohio', 'Vermont', 'Oregon', 'North Carolina', 'Iowa', 'Maine', 'Arizona']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June']

export function trendWords(trend: MarketSnapshot['trend'], changePct: number): string {
  if (trend === 'steady') return 'holding steady'
  if (trend === 'down') return Math.abs(changePct) >= 25 ? 'down quite a bit' : 'gently down'
  return changePct >= 25 ? 'up quite a bit' : 'gently up'
}

export function marketSnapshot(item: Item): MarketSnapshot | null {
  const amount = bestAmount(item)
  if (amount == null) return null
  const profile = PROFILES[item.category] ?? PROFILES.Other
  const h = hash(item.id)

  // The number in the owner's head is often years old; today's sold range
  // reflects the category's decade-long drift.
  const todayMid = Math.max(25, Math.round((amount * (100 + profile.changePct)) / 100))
  const low = round5(todayMid * 0.8)
  const high = round5(todayMid * 1.2)
  const trend: MarketSnapshot['trend'] =
    profile.changePct > 4 ? 'up' : profile.changePct < -4 ? 'down' : 'steady'

  const salesCount = 8 + (h % 13)
  const comps: Comp[] = [0, 1, 2].map((i) => {
    const price = round5(low + ((high - low) * ((h >> (i * 3)) % 100)) / 100)
    return {
      label: i === 0 ? `A ${item.category.toLowerCase()} piece like yours` : `Another, in similar condition`,
      price,
      when: MONTHS[(h >> (i * 2)) % MONTHS.length],
      where: STATES[(h >> (i * 4)) % STATES.length],
    }
  })

  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`
  return {
    trend,
    changePct: profile.changePct,
    windowYears: 10,
    low,
    high,
    headline: `Pieces like this sell for about ${fmt(low)}–${fmt(high)} today.`,
    context: profile.context,
    meaning:
      trend === 'down'
        ? 'Its market price is not its value to your family — the story you’ve kept with it is exactly what makes it an heirloom.'
        : undefined,
    comps,
    basis: `Based on ${salesCount} completed sales in the last 12 months (example data in this preview).`,
  }
}

function round5(n: number): number {
  return Math.max(5, Math.round(n / 5) * 5)
}
