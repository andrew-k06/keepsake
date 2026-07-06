// Explainable identification — the "show your work" card.
//
// The design rule that moves AI from spooky to trusted for this audience:
// state the visual EVIDENCE, give confidence in WORDS (never percentages),
// ask for the disambiguating photo, and always yield the last word to the
// user with an equal-weight "No, let me tell you what it is."
//
// In this preview the suggestions are examples (and the UI says so); the full
// app swaps this module for a Claude vision call returning the same shape.

export interface IdSuggestion {
  name: string
  category: string
  low: number
  high: number
  /** What the eye caught: "a gold band with a single clear stone…" */
  evidence: string
  confidence: 'guessing' | 'fairly sure'
  /** The photo that would settle it, and where to point the camera. */
  followUp: string
}

const EXAMPLES: IdSuggestion[] = [
  {
    name: 'Diamond Ring',
    category: 'Jewelry',
    low: 3800,
    high: 5200,
    evidence: 'a gold band with a single clear stone — usually an engagement ring',
    confidence: 'fairly sure',
    followUp: 'a close-up of any tiny marks stamped inside the band',
  },
  {
    name: 'Framed Oil Painting',
    category: 'Art',
    low: 800,
    high: 1600,
    evidence: 'visible brushwork and a period frame — an original oil rather than a print',
    confidence: 'fairly sure',
    followUp: 'the artist’s signature, usually in a bottom corner',
  },
  {
    name: 'Vintage Wristwatch',
    category: 'Watches',
    low: 1600,
    high: 2800,
    evidence: 'an acrylic crystal and aged dial — a mechanical watch from mid-century',
    confidence: 'fairly sure',
    followUp: 'the case back, where the maker stamps the model number',
  },
  {
    name: 'Porcelain Vase',
    category: 'Antiques',
    low: 400,
    high: 1400,
    evidence: 'a hand-painted glaze — makers mark these pieces underneath, like a signature',
    confidence: 'guessing',
    followUp: 'the underside of the base, where the maker’s stamp would be',
  },
  {
    name: 'Pearl Necklace',
    category: 'Jewelry',
    low: 900,
    high: 2300,
    evidence: 'a knotted strand with a decorated clasp — knots between pearls usually mean the real thing',
    confidence: 'fairly sure',
    followUp: 'a close-up of the clasp, where the metal is marked',
  },
  {
    name: 'Carved Wooden Chair',
    category: 'Furniture',
    low: 300,
    high: 1100,
    evidence: 'hand-carved detail and joinery you don’t see in factory pieces',
    confidence: 'guessing',
    followUp: 'the underside of the seat, where makers sometimes stamp or label',
  },
  {
    name: 'Violin',
    category: 'Instruments',
    low: 1200,
    high: 4800,
    evidence: 'a spruce top with visible grain — the label inside tells the real story',
    confidence: 'guessing',
    followUp: 'the paper label inside, visible through the left f-hole',
  },
  {
    name: 'Film Camera',
    category: 'Collectibles',
    low: 200,
    high: 800,
    evidence: 'a metal-bodied film camera — collectors care most about the exact model and lens',
    confidence: 'fairly sure',
    followUp: 'the top plate, where the model name and serial number are engraved',
  },
]

/** Deterministic example pick (stable within a session moment). */
export function exampleIdentification(seed: number): IdSuggestion {
  return EXAMPLES[Math.abs(Math.floor(seed)) % EXAMPLES.length]
}
