import type { BinderState } from '../types'

// Seed binder — a realistic, warm sample so the app feels alive in a live demo.
// Item images are reliably-hosted Unsplash CDN photos (verified HTTP 200, image/jpeg).
export const seedState: BinderState = {
  ownerName: 'Margaret',
  binderName: "Margaret's Binder",
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
      invited: true,
    },
  ],
  emergency: [
    {
      id: 'e-1',
      label: 'Where my important papers are',
      detail:
        'The fireproof box in the bedroom closet holds my will, the deed to the house, and the insurance policies. The key is taped under the jewelry drawer.',
    },
    {
      id: 'e-2',
      label: 'My attorney',
      detail: 'James Porter, Porter & Cole — (555) 482-1190. He has the original will.',
    },
    {
      id: 'e-3',
      label: 'Home — water shut-off',
      detail: 'The main valve is in the garage, back-left corner behind the shelving. Turn it clockwise to close.',
    },
    {
      id: 'e-4',
      label: 'If something happens to me',
      detail:
        'Call Sarah first. My medications and doctor’s information are on the refrigerator. My advance directive is in the fireproof box.',
    },
  ],
  items: [
    {
      id: 'i-ring',
      name: "Grandmother's Engagement Ring",
      category: 'Jewelry',
      roomId: 'safe',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=70',
      story:
        'This was my mother Eleanor’s ring, given to her in 1948. The center diamond came from her own mother. I want Sarah to have it — she always loved the way it caught the light at Christmas.',
      estValue: 8500,
      acquired: '1948 (inherited 1991)',
      condition: 'Excellent',
      beneficiaryId: 'p-sarah',
      appraisalStatus: 'needs-in-person',
      documents: [{ id: 'd-1', type: 'photo', label: 'Close-up of hallmark' }],
      insured: true,
    },
    {
      id: 'i-painting',
      name: 'Coastal Landscape (oil)',
      category: 'Art',
      roomId: 'living',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=70',
      story:
        'Bought at a gallery in Maine on our 25th anniversary trip. Robert haggled the artist down a little, and we laughed about it the whole drive home.',
      estValue: 3200,
      acquired: '1998',
      condition: 'Good',
      beneficiaryId: 'p-david',
      appraisalStatus: 'appraised',
      appraisedValue: 3600,
      documents: [
        { id: 'd-2', type: 'appraisal', label: 'USPAP appraisal (2023)' },
        { id: 'd-3', type: 'receipt', label: 'Original gallery receipt' },
      ],
      insured: true,
    },
    {
      id: 'i-watch',
      name: 'Robert’s Omega Watch',
      category: 'Watches',
      roomId: 'safe',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=70',
      story:
        'My late husband wore this every day for thirty years, and it still keeps perfect time. David, this one is for you.',
      estValue: 4200,
      acquired: '1985',
      condition: 'Very good — recently serviced',
      beneficiaryId: 'p-david',
      appraisalStatus: 'requested',
      documents: [],
      insured: false,
    },
    {
      id: 'i-china',
      name: 'Wedgwood China Set (service for 12)',
      category: 'China & Silver',
      roomId: 'living',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=70',
      story:
        'Our wedding china. Every Thanksgiving for forty years was served on these plates. There are eleven dinner plates now — one broke in 1974 and we never replaced it, on purpose.',
      estValue: 1800,
      acquired: '1968',
      condition: 'Good',
      appraisalStatus: 'photo-review',
      documents: [],
      insured: false,
    },
    {
      id: 'i-clock',
      name: 'Grandfather Clock',
      category: 'Furniture',
      roomId: 'living',
      image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=70',
      story:
        'Built by Robert’s grandfather, a clockmaker in Vermont. Wind it once a week with the brass key kept in the bottom drawer. It chimes a little early — that’s its character.',
      estValue: 5500,
      acquired: '1952 (family piece)',
      condition: 'Excellent — fully working',
      beneficiaryId: 'p-sarah',
      appraisalStatus: 'none',
      documents: [{ id: 'd-4', type: 'manual', label: 'Winding instructions (handwritten)' }],
      insured: true,
    },
    {
      id: 'i-coins',
      name: 'Silver Dollar Collection',
      category: 'Collectibles',
      roomId: 'safe',
      image: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&w=800&q=70',
      story:
        'Robert started this collection with his father. Forty-two Morgan and Peace dollars sit in the blue folder. He always said the 1921 was the special one.',
      estValue: 2400,
      acquired: '1960s–2010',
      condition: 'Mixed',
      appraisalStatus: 'needs-in-person',
      documents: [],
      insured: false,
    },
  ],
}
