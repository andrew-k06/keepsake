import { describe, it, expect } from 'vitest'
import { emptyBinder, ensurePrep, purgeTrash } from '../src/store'
import { STEPS, stepDone } from '../src/lib/prepare'
import type { Item } from '../src/types'

describe('emptyBinder', () => {
  it('derives the first name and starts on the free tier', () => {
    const b = emptyBinder('Harold Finch')
    expect(b.ownerName).toBe('Harold')
    expect(b.binderName).toBe("Harold's Binder")
    expect(b.plan.tier).toBe('starter')
    expect(b.isDemo).toBeUndefined()
  })

  it('the gift path adds the giver as a helper, activates the binder tier, and opens Together', () => {
    const b = emptyBinder('Dorothy', { giftFrom: 'Michael' })
    expect(b.plan.tier).toBe('binder')
    expect(b.plan.giftFrom).toBe('Michael')
    const helper = b.people.find((p) => p.id === 'p-gifter')!
    expect(helper.name).toBe('Michael')
    expect(helper.role).toBe('collaborator')
    expect(b.preparedness?.togetherWithId).toBe('p-gifter')
    expect(b.audit.some((a) => a.action.includes('gift'))).toBe(true)
  })
})

describe('ensurePrep (celebration-barrage regression)', () => {
  it('pre-credits everything the binder already satisfies when created lazily', () => {
    const b = emptyBinder('Ruth')
    b.items = [
      {
        id: 'i-1',
        name: 'Vase',
        category: 'Other',
        roomId: 'living',
        story: 'from the fair',
        valuations: [],
        appraisalStatus: 'none',
        documents: [],
      },
    ]
    const prep = ensurePrep(b)
    const alreadyDone = STEPS.filter((st) => stepDone(b, st)).map((st) => st.id)
    expect(alreadyDone).toContain('story-first')
    // Every derived-done step must be pre-celebrated — a later first Guide
    // visit fires nothing for work life already did.
    for (const id of alreadyDone) expect(prep.celebrated).toContain(id)
  })

  it('returns the existing slice untouched when one exists', () => {
    const b = emptyBinder('Ruth', { giftFrom: 'S' })
    expect(ensurePrep(b)).toBe(b.preparedness)
  })
})

describe('purgeTrash', () => {
  const trashed = (daysAgo: number): Item => ({
    id: `i-${daysAgo}`,
    name: 'X',
    category: 'Other',
    roomId: 'living',
    story: '',
    valuations: [],
    appraisalStatus: 'none',
    documents: [],
    deletedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  })

  it('keeps items inside the 30-day window and drops the rest', () => {
    const b = emptyBinder('Ruth')
    b.trash = [trashed(5), trashed(29), trashed(31)]
    const out = purgeTrash(b)
    expect(out.trash!.map((t) => t.id)).toEqual(['i-5', 'i-29'])
  })
})
