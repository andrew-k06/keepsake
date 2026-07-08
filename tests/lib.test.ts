import { describe, it, expect } from 'vitest'
import { migrate } from '../src/data/repository'
import { currentValuation, bestAmount, makeValuation } from '../src/lib/value'
import { routeAppraisal, reconcileAppraisalStatus } from '../src/lib/appraise'
import { marketSnapshot, trendWords } from '../src/lib/market'
import {
  STEPS,
  stepDone,
  prepareProgress,
  pendingCelebration,
  emptyPreparedness,
} from '../src/lib/prepare'
import type { BinderState, Item } from '../src/types'

// ---- fixtures ---------------------------------------------------------------

const baseItem = (over: Partial<Item> = {}): Item => ({
  id: 'i-1',
  name: 'Thing',
  category: 'Other',
  roomId: 'living',
  story: '',
  valuations: [],
  appraisalStatus: 'none',
  documents: [],
  ...over,
})

const baseState = (over: Partial<BinderState> = {}): BinderState => ({
  ownerName: 'Ruth',
  binderName: "Ruth's Binder",
  plan: { tier: 'starter' },
  rooms: [{ id: 'living', name: 'Living Room' }],
  items: [],
  trash: [],
  people: [{ id: 'p-self', name: 'Ruth', relationship: 'Me', role: 'owner', color: '#c2603d' }],
  emergency: [],
  audit: [],
  ...over,
})

// ---- migrate ----------------------------------------------------------------

describe('migrate', () => {
  it('folds v2 estValue/appraisedValue scalars into the valuations history', () => {
    const v2 = {
      ownerName: 'M',
      binderName: 'B',
      rooms: [{ id: 'r', name: 'Room' }],
      items: [
        {
          id: 'i-x',
          name: 'Ring',
          category: 'Jewelry',
          roomId: 'r',
          story: 's',
          estValue: 1000,
          appraisedValue: 1200,
          appraisalStatus: 'appraised',
          documents: [],
          emoji: '💍',
        },
      ],
      people: [],
      emergency: [],
    }
    const out = migrate(v2)!
    const item = out.items[0]
    expect(item.valuations).toHaveLength(2)
    expect(item.valuations.map((v) => v.source).sort()).toEqual(['in-person-appraisal', 'owner'])
    expect((item as Record<string, unknown>).estValue).toBeUndefined()
    expect((item as Record<string, unknown>).emoji).toBeUndefined()
    // idempotent: running the migrated shape through again changes nothing material
    const again = migrate(JSON.parse(JSON.stringify(out)))!
    expect(again.items[0].valuations).toHaveLength(2)
  })

  it('rejects garbage and defaults missing collections', () => {
    expect(migrate(null)).toBeNull()
    expect(migrate('nope')).toBeNull()
    expect(migrate({ items: [], rooms: [] })).toBeNull()

    const sparse = {
      ownerName: 'M',
      rooms: [{ id: 'r', name: 'Room' }],
      items: [{ id: 'i', name: 'X', category: 'Other', roomId: 'r' }],
      preparedness: { startedAt: '2026-01-01T00:00:00.000Z' }, // no steps/celebrated
    }
    const out = migrate(sparse)!
    expect(out.items[0].documents).toEqual([])
    expect(out.items[0].story).toBe('')
    expect(out.items[0].appraisalStatus).toBe('none')
    expect(out.audit).toEqual([])
    expect(out.preparedness!.steps).toEqual({})
    expect(out.preparedness!.celebrated).toEqual([])
  })

  it('folds legacy executor person-roles to viewer (the designation card is the mechanism)', () => {
    const out = migrate({
      ownerName: 'M',
      rooms: [{ id: 'r', name: 'Room' }],
      items: [],
      people: [{ id: 'p', name: 'D', relationship: 'Son', role: 'executor', color: '#000' }],
    })!
    expect(out.people[0].role).toBe('viewer')
  })
})

// ---- value precedence ---------------------------------------------------------

describe('currentValuation', () => {
  it('an in-person appraisal beats a NEWER owner estimate', () => {
    const item = baseItem({
      valuations: [
        { id: 'a', source: 'owner', low: 900, high: 900, date: '2026-06-01' },
        { id: 'b', source: 'in-person-appraisal', low: 500, high: 500, date: '2026-01-01' },
      ],
    })
    expect(currentValuation(item)!.source).toBe('in-person-appraisal')
    expect(bestAmount(item)).toBe(500)
  })

  it('latest date wins within a source; empty history is null', () => {
    const item = baseItem({
      valuations: [
        { id: 'a', source: 'owner', low: 100, high: 100, date: '2026-01-01' },
        { id: 'b', source: 'owner', low: 200, high: 200, date: '2026-02-01' },
      ],
    })
    expect(bestAmount(item)).toBe(200)
    expect(currentValuation(baseItem())).toBeNull()
    expect(bestAmount(baseItem())).toBeNull()
  })
})

// ---- appraisal routing ----------------------------------------------------------

describe('routeAppraisal', () => {
  const withValue = (category: string, amount: number | null) =>
    baseItem({
      category,
      valuations: amount == null ? [] : [makeValuation('owner', amount)],
    })

  it('touch-to-verify categories go in person at ANY value', () => {
    expect(routeAppraisal(withValue('Jewelry', 50)).tier).toBe('in-person')
    expect(routeAppraisal(withValue('Coins', null)).tier).toBe('in-person')
    expect(routeAppraisal(withValue('Watches', 10000)).tier).toBe('in-person')
  })

  it('under $500 un-appraised: you likely don’t need to pay anyone', () => {
    expect(routeAppraisal(withValue('Furniture', 200)).tier).toBe('none-needed')
  })

  it('over $5000 goes in person; the middle gets a photo review', () => {
    expect(routeAppraisal(withValue('Art', 8000)).tier).toBe('in-person')
    expect(routeAppraisal(withValue('Art', 2000)).tier).toBe('photo-review')
    expect(routeAppraisal(withValue('Furniture', null)).tier).toBe('photo-review')
  })
})

describe('reconcileAppraisalStatus', () => {
  it('a professional valuation makes the item appraised regardless of stale status', () => {
    const item = baseItem({
      appraisalStatus: 'photo-review',
      valuations: [makeValuation('photo-appraisal', 100, 200)],
    })
    expect(reconcileAppraisalStatus(item)).toBe('appraised')
    expect(reconcileAppraisalStatus(baseItem({ appraisalStatus: 'photo-review' }))).toBe(
      'photo-review',
    )
  })
})

// ---- market ---------------------------------------------------------------------

describe('marketSnapshot', () => {
  it('is deterministic per item id and null without a value', () => {
    const item = baseItem({ id: 'i-china', category: 'China & Silver', valuations: [makeValuation('owner', 1800)] })
    const a = marketSnapshot(item)!
    const b = marketSnapshot(item)!
    expect(a).toEqual(b)
    expect(a.trend).toBe('down')
    expect(a.low).toBeLessThan(a.high)
    expect(a.low % 5).toBe(0)
    expect(marketSnapshot(baseItem())).toBeNull()
  })

  it('trend words follow the boundaries', () => {
    expect(trendWords('steady', 0)).toBe('holding steady')
    expect(trendWords('down', -40)).toBe('down quite a bit')
    expect(trendWords('down', -10)).toBe('gently down')
    expect(trendWords('up', 45)).toBe('up quite a bit')
    expect(trendWords('up', 12)).toBe('gently up')
  })
})

// ---- getting-ready path ------------------------------------------------------------

const storyItems = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => baseItem({ id: `i-${i}`, story: 'a story' }))

describe('prepareProgress', () => {
  it('derives completion from the binder itself', () => {
    const s = baseState({ items: storyItems(5) })
    const first = STEPS.find((st) => st.id === 'story-first')!
    const five = STEPS.find((st) => st.id === 'story-five')!
    expect(stepDone(s, first)).toBe(true)
    expect(stepDone(s, five)).toBe(true)
    expect(stepDone(baseState(), five)).toBe(false)
  })

  it('coreDone excludes the ongoing chapter', () => {
    // Everything except the ongoing offer-check step
    const s = baseState({
      items: storyItems(5).map((it, i) => ({ ...it, beneficiaryId: i < 3 ? 'p-x' : undefined })),
      people: [
        { id: 'p-self', name: 'R', relationship: 'Me', role: 'owner', color: '#000' },
        { id: 'p-x', name: 'S', relationship: 'Daughter', role: 'viewer', color: '#000' },
      ],
      emergency: [
        { id: 'e1', label: 'Where my important papers are', detail: 'desk' },
        { id: 'e2', label: 'Who to call first', detail: 'call Sarah' },
        { id: 'e3', label: 'My doctor & medications', detail: 'fridge' },
        { id: 'e4', label: 'How the house works', detail: 'water shut-off in garage' },
      ],
      executorAccess: { personId: 'p-x', protocol: 'verified-documents', waitDays: 14 },
      preparedness: {
        ...emptyPreparedness(),
        steps: {
          'share-summary': { status: 'done', at: '2026-01-01' },
          'have-talk': { status: 'done', at: '2026-01-02' },
        },
      },
    })
    const progress = prepareProgress(s)
    expect(progress.coreDone).toBe(true)
    // ongoing step remains offerable
    expect(progress.nextStep?.id).toBe('offer-check-try')
  })

  it('a skipped step is remembered and the next offer changes CHAPTER', () => {
    const s = baseState({
      preparedness: {
        ...emptyPreparedness(),
        lastStepId: 'story-first',
        steps: { 'story-first': { status: 'skipped', at: '2026-01-01' } },
      },
    })
    const progress = prepareProgress(s)
    // declining "save a story" must not be answered with "five stories"
    expect(progress.nextStep!.id).not.toBe('story-five')
    expect(progress.nextStep!.chapter).not.toBe('things')
  })

  it('after a heavy skip the next offer is a light step', () => {
    const s = baseState({
      items: storyItems(5),
      emergency: [
        { id: 'e1', label: 'papers', detail: 'will and deed in the desk' },
        { id: 'e2', label: 'call', detail: 'call Sarah' },
        { id: 'e3', label: 'medical', detail: 'doctor list' },
        { id: 'e4', label: 'house', detail: 'water valve' },
      ],
      preparedness: {
        ...emptyPreparedness(),
        lastStepId: 'trusted-contact',
        steps: { 'trusted-contact': { status: 'skipped', at: '2026-01-01' } },
      },
    })
    const next = prepareProgress(s).nextStep!
    expect(next.heavy).not.toBe(true)
  })
})

describe('pendingCelebration', () => {
  it('never fires before the path has started', () => {
    const s = baseState({ items: storyItems(5) })
    expect(pendingCelebration(s)).toBeNull()
  })

  it('fires once per newly-done step, and pre-credited steps stay quiet', () => {
    const started = baseState({
      items: storyItems(1),
      preparedness: { ...emptyPreparedness(), celebrated: ['story-first'] },
    })
    expect(pendingCelebration(started)).toBeNull()
    const uncredited = baseState({
      items: storyItems(1),
      preparedness: { ...emptyPreparedness(), celebrated: [] },
    })
    expect(pendingCelebration(uncredited)?.id).toBe('story-first')
  })
})
