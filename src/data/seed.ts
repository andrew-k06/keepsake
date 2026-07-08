import type { BinderState } from '../types'
import imgRing from '../assets/seed/ring.jpg'
import imgPainting from '../assets/seed/painting.jpg'
import imgWatch from '../assets/seed/watch.jpg'
import imgChina from '../assets/seed/china.jpg'
import imgClock from '../assets/seed/clock.jpg'
import imgCoins from '../assets/seed/coins.jpg'

// Seed binder — a realistic, warm sample so the app feels alive in a live demo.
// Item images are bundled locally so demos (and the printed binder) work offline.
export const seedState: BinderState = {
  isDemo: true,
  ownerName: 'Margaret',
  binderName: "Margaret's Binder",
  // The demo shows the full product — Sarah set it up as a gift and pays for
  // the Family Plan (market watching), so every feature is visible.
  plan: { tier: 'family', activatedAt: '2026-05-14T00:00:00.000Z', giftFrom: 'Sarah' },
  rooms: [
    { id: 'living', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'safe', name: 'The Safe' },
    { id: 'garage', name: 'Garage' },
  ],
  people: [
    { id: 'p-self', name: 'Margaret Ellison', relationship: 'Me', role: 'owner', color: '#c2603d' },
    {
      id: 'p-sarah',
      name: 'Sarah',
      relationship: 'Daughter',
      role: 'collaborator',
      email: 'sarah@example.com',
      color: '#4a7c6a',
    },
    {
      id: 'p-david',
      name: 'David',
      relationship: 'Son',
      role: 'viewer',
      email: 'david@example.com',
      color: '#d99a3f',
    },
  ],
  executorAccess: { personId: 'p-sarah', protocol: 'verified-documents', waitDays: 14 },
  // Margaret is partway along the Getting Ready path. Chapters 1–3 derive as
  // done from the binder itself (stories, notes, people, wishes); the next
  // step the demo shows is chapter 4 — print/share the summary. Derived-done
  // steps are pre-celebrated so the first visit doesn't fire a barrage.
  preparedness: {
    startedAt: '2026-06-01T00:00:00.000Z',
    lastVisitAt: '2026-06-28T00:00:00.000Z',
    steps: {},
    celebrated: [
      'story-first',
      'story-five',
      'note-papers',
      'note-first-call',
      'note-medical',
      'note-house',
      'person-add',
      'trusted-contact',
      'wish-three',
    ],
  },
  audit: [
    { id: 'a-1', at: '2026-06-28T15:20:00.000Z', action: 'Sarah added a memory to “Grandfather Clock”' },
    { id: 'a-2', at: '2026-06-25T10:05:00.000Z', action: 'You changed who “Grandmother’s Engagement Ring” goes to: Sarah' },
    { id: 'a-3', at: '2026-05-14T09:00:00.000Z', action: 'Sarah set this binder up as a gift' },
  ],
  emergency: [
    {
      id: 'e-1',
      label: 'Where my important papers are',
      detail:
        'The fireproof box in the bedroom closet holds my will, the deed to the house, and the insurance policies. Sarah knows how to open it.',
      sectionId: 'papers',
    },
    {
      id: 'e-2',
      label: 'My attorney',
      detail: 'James Porter, Porter & Cole — (555) 482-1190. He has the original will.',
      sectionId: 'papers',
    },
    {
      id: 'e-3',
      label: 'Home — water shut-off',
      detail: 'The main valve is in the garage, back-left corner behind the shelving. Turn it clockwise to close.',
      sectionId: 'home',
    },
    {
      id: 'e-4',
      label: 'If something happens to me',
      detail:
        'Call Sarah first. My medications and doctor’s information are on the refrigerator. My advance directive is in the fireproof box.',
      sectionId: 'health',
    },
    {
      id: 'e-5',
      label: 'Burial or cremation — what I’d like',
      detail:
        'Cremation, please, next to Robert at Riverview. Keep it simple — the hymn I love is “Be Thou My Vision,” and I’d rather you all told one funny story than wore black.',
      sectionId: 'final',
    },
    {
      id: 'e-6',
      label: 'Where the family photographs live',
      detail:
        'The albums are in the cedar chest; the boxes of loose photos are labeled by decade in the garage. Sarah has been scanning them to the family computer.',
      sectionId: 'memory',
    },
  ],
  items: [
    {
      id: 'i-ring',
      name: "Grandmother's Engagement Ring",
      category: 'Jewelry',
      roomId: 'safe',
      image: imgRing,
      story:
        'This was my mother Eleanor’s ring, given to her in 1948. The center diamond came from her own mother. I want Sarah to have it — she always loved the way it caught the light at Christmas.',
      significance:
        'Three generations of us have worn it. When I miss my mother, I put it on — it’s the closest thing I have to holding her hand.',
      valuations: [
        { id: 'v-ring-1', source: 'owner', low: 8500, high: 8500, date: '2026-05-20T00:00:00.000Z' },
      ],
      acquired: '1948 (inherited 1991)',
      condition: 'Excellent',
      beneficiaryId: 'p-sarah',
      appraisalStatus: 'needs-in-person',
      documents: [{ id: 'd-1', type: 'photo', label: 'Close-up of hallmark' }],
      insured: true,
      createdAt: '2026-05-14T00:00:00.000Z',
    },
    {
      id: 'i-painting',
      name: 'Coastal Landscape (oil)',
      category: 'Art',
      roomId: 'living',
      image: imgPainting,
      story:
        'Bought at a gallery in Maine on our 25th anniversary trip. Robert haggled the artist down a little, and we laughed about it the whole drive home.',
      valuations: [
        {
          id: 'v-painting-2',
          source: 'in-person-appraisal',
          low: 3600,
          high: 3600,
          basis: 'Written appraisal, R. Whitfield, ISA (2023)',
          date: '2026-05-22T00:00:00.000Z',
        },
        { id: 'v-painting-1', source: 'owner', low: 3200, high: 3200, date: '2026-05-15T00:00:00.000Z' },
      ],
      acquired: '1998',
      condition: 'Good',
      beneficiaryId: 'p-david',
      appraisalStatus: 'appraised',
      documents: [
        { id: 'd-2', type: 'appraisal', label: 'Certified written appraisal (2023)' },
        { id: 'd-3', type: 'receipt', label: 'Original gallery receipt' },
      ],
      insured: true,
      createdAt: '2026-05-15T00:00:00.000Z',
    },
    {
      id: 'i-watch',
      name: 'Robert’s Omega Watch',
      category: 'Watches',
      roomId: 'safe',
      image: imgWatch,
      story:
        'My late husband wore this every day for thirty years, and it still keeps perfect time. David, this one is for you.',
      significance:
        'It isn’t the watch — it’s that it never left his wrist. Winding it feels like keeping a small part of him going.',
      valuations: [
        { id: 'v-watch-1', source: 'owner', low: 4200, high: 4200, date: '2026-05-16T00:00:00.000Z' },
      ],
      acquired: '1985',
      condition: 'Very good — recently serviced',
      beneficiaryId: 'p-david',
      appraisalStatus: 'requested',
      documents: [],
      insured: false,
      createdAt: '2026-05-16T00:00:00.000Z',
      memories: [
        {
          id: 'm-watch-1',
          personId: 'p-david',
          text: 'Dad tapped this twice for luck before every road trip. I can still hear it.',
          date: '2026-06-20T00:00:00.000Z',
        },
      ],
    },
    {
      id: 'i-china',
      name: 'Wedgwood China Set (service for 12)',
      category: 'China & Silver',
      roomId: 'living',
      image: imgChina,
      story:
        'Our wedding china. Every Thanksgiving for forty years was served on these plates. There are eleven dinner plates now — one broke in 1974 and we never replaced it, on purpose.',
      valuations: [
        { id: 'v-china-1', source: 'owner', low: 1800, high: 1800, date: '2026-05-18T00:00:00.000Z' },
      ],
      acquired: '1968',
      condition: 'Good',
      appraisalStatus: 'photo-review',
      documents: [],
      insured: false,
      createdAt: '2026-05-18T00:00:00.000Z',
    },
    {
      id: 'i-clock',
      name: 'Grandfather Clock',
      category: 'Furniture',
      roomId: 'living',
      image: imgClock,
      story:
        'Built by Robert’s grandfather, a clockmaker in Vermont. Wind it once a week with the brass key kept in the bottom drawer. It chimes a little early — that’s its character.',
      valuations: [
        { id: 'v-clock-1', source: 'owner', low: 5500, high: 5500, date: '2026-05-19T00:00:00.000Z' },
      ],
      acquired: '1952 (family piece)',
      condition: 'Excellent — fully working',
      beneficiaryId: 'p-sarah',
      appraisalStatus: 'none',
      documents: [{ id: 'd-4', type: 'manual', label: 'Winding instructions (handwritten)' }],
      insured: true,
      createdAt: '2026-05-19T00:00:00.000Z',
      memories: [
        {
          id: 'm-clock-1',
          personId: 'p-sarah',
          text: 'Falling asleep to those early chimes is my whole childhood.',
          date: '2026-06-28T00:00:00.000Z',
        },
      ],
    },
    {
      id: 'i-coins',
      name: 'Silver Dollar Collection',
      category: 'Coins',
      roomId: 'safe',
      image: imgCoins,
      story:
        'Robert started this collection with his father. Forty-two Morgan and Peace dollars sit in the blue folder. He always said the 1921 was the special one.',
      valuations: [
        { id: 'v-coins-1', source: 'owner', low: 2400, high: 2400, date: '2026-05-20T00:00:00.000Z' },
      ],
      acquired: '1960s–2010',
      condition: 'Mixed',
      appraisalStatus: 'needs-in-person',
      documents: [],
      insured: false,
      createdAt: '2026-05-20T00:00:00.000Z',
    },
  ],
  trash: [],
}
