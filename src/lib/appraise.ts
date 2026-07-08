// Appraisal routing — "when is AI enough, and when is a human worth paying for?"
//
// Explicit, explainable threshold logic (replaces a hardcoded category list
// buried in a page). Two rules make it senior-trustworthy: always show the WHY,
// and always show the COST-BENEFIT — including "you don't need to pay anyone
// for this one", said against Keepsake's own referral interest.

import type { Item } from '../types'
import { bestAmount, isAppraised } from './value'

/** Categories where authenticity is established by touch, weight, or testing —
    a photo can't verify a gemstone, a coin's grade, or a movement. */
const TOUCH_CATEGORIES = new Set(['Jewelry', 'Watches', 'Coins'])

export type AppraisalTier = 'none-needed' | 'photo-review' | 'in-person'

export interface AppraisalRoute {
  tier: AppraisalTier
  /** Plain-language reason for the recommendation. */
  why: string
  /** What it costs vs. what being wrong could cost. */
  costBenefit: string
  /** Typical price for the recommended step. */
  priceLabel: string
}

export function routeAppraisal(item: Item): AppraisalRoute {
  const amount = bestAmount(item)
  const touch = TOUCH_CATEGORIES.has(item.category)

  if (touch) {
    return {
      tier: 'in-person',
      why:
        item.category === 'Coins'
          ? 'Coins have to be weighed and graded in hand — a photo can’t tell a collector-grade dollar from an ordinary one.'
          : item.category === 'Watches'
            ? 'A watch’s movement and originality have to be opened and inspected — that can’t be done from a photo.'
            : 'Real gemstones can’t be verified from a photo — a gemologist tests the stone itself.',
      costBenefit: `An in-person appraisal usually runs $150–$350. Being wrong about ${
        amount ? `a piece near $${amount.toLocaleString()}` : 'a piece like this'
      } could cost far more.`,
      priceLabel: 'Typically $150–$350, in person',
    }
  }

  if (amount != null && amount < 500 && !isAppraised(item)) {
    return {
      tier: 'none-needed',
      why: 'Items in this range usually sell for less than a paid appraisal costs — you likely don’t need to pay anyone for this one.',
      costBenefit: 'A paid appraisal (about $30 and up) would likely cost more than it adds here.',
      priceLabel: 'No appraisal needed',
    }
  }

  if (amount != null && amount > 5000) {
    return {
      tier: 'in-person',
      why: 'For something this valuable, an accredited appraiser should see it in person — insurers and estates expect a written, signed appraisal.',
      costBenefit: `An in-person appraisal usually runs $150–$350 — small next to a piece near $${amount.toLocaleString()}.`,
      priceLabel: 'Typically $150–$350, in person',
    }
  }

  return {
    tier: 'photo-review',
    why: 'This one is worth a real expert’s eyes, and they can do it from your photos — no visit needed.',
    costBenefit: 'A photo review is usually about $30 — worth it for anything you might insure or pass on.',
    priceLabel: 'About $30, from your photos',
  }
}

/** Status should follow the evidence: once a professional valuation exists,
    the item IS appraised regardless of what the request flow last set. */
export function reconcileAppraisalStatus(item: Item): Item['appraisalStatus'] {
  if (isAppraised(item)) return 'appraised'
  return item.appraisalStatus
}

export const tierTitle: Record<AppraisalTier, string> = {
  'none-needed': 'You likely don’t need to pay for this one',
  'photo-review': 'A photo review is the right fit',
  'in-person': 'This one should be seen in person',
}
