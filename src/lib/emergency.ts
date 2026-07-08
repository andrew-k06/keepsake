// The emergency guide's sections — modeled on the real family planners this
// generation makes by hand (health directives, final arrangements, settling
// affairs, heirlooms & photographs), with Keepsake's safety rules kept:
// locations and names in plain words — never account numbers, codes, or
// passwords, and never the documents themselves (those belong with the
// professionals who made them).

export interface EmergencySection {
  id: string
  title: string
  sub: string
  /** Shown as a quiet rule inside the section's add-flow when present. */
  safety?: string
  /** Prompt chips — the questions a family actually asks. */
  prompts: string[]
}

export const EMERGENCY_SECTIONS: EmergencySection[] = [
  {
    id: 'health',
    title: 'My health & care',
    sub: 'The papers and people that speak for you if you can’t.',
    prompts: [
      'My health care directive & who speaks for me',
      'Power of attorney for finances — who & where',
      'Medical insurance & providers',
      'My doctor & medications',
    ],
  },
  {
    id: 'final',
    title: 'Final arrangements',
    sub: 'Your wishes, written down — so no one has to guess at the hardest moment.',
    prompts: [
      'Organ or body donation',
      'Burial or cremation — what I’d like',
      'Funeral or memorial wishes',
      'Notes for my obituary',
      'Who to call first',
    ],
  },
  {
    id: 'papers',
    title: 'Papers & legal',
    sub: 'Where the important papers live and who can reach them.',
    prompts: [
      'Where my will is & who has the original',
      'My attorney',
      'Insurance policies — where they live',
      'Taxes & who prepares them',
      'Deeds, real estate & vehicle titles',
    ],
  },
  {
    id: 'money',
    title: 'Money & accounts',
    sub: 'The names of the places, so nothing gets lost or forgotten.',
    safety: 'Names of institutions only — never write account numbers or balances here.',
    prompts: [
      'Banks & brokerages (names only)',
      'Retirement, pensions & Social Security',
      'Credit cards & debts',
      'Education accounts for the grandchildren',
      'Memberships & subscriptions that bill me',
    ],
  },
  {
    id: 'access',
    title: 'Secured places & passwords',
    sub: 'How your family would get in — described safely.',
    safety:
      'Describe where things live in words your family understands — never write the actual codes, combinations, or passwords.',
    prompts: ['Where my password list lives', 'Safe-deposit box — where & who can open it'],
  },
  {
    id: 'home',
    title: 'Home & everyday',
    sub: 'The house should never be a mystery to the people helping.',
    prompts: [
      'Water, gas & power shut-offs',
      'Service providers (plumber, furnace, yard)',
      'Pets — vet, food & who takes them',
      'Neighbors & spare-key arrangements',
    ],
  },
  {
    id: 'memory',
    title: 'Photographs & family history',
    sub: 'Where the memories live — the albums, the files, the family tree.',
    prompts: [
      'Where the family photographs live',
      'Heirlooms & genealogy records',
      'Recipes, letters & keepsake boxes',
    ],
  },
]

export const sectionById = (id?: string): EmergencySection | undefined =>
  EMERGENCY_SECTIONS.find((s) => s.id === id)
