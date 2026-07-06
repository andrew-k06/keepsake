// Example appraiser directory (preview data).
//
// The credentialing bar this models, from the compliance review: verified
// accreditation (ISA / ASA / AAA — there is no government "certification" for
// personal property), current USPAP course, E&O insurance, and the industry's
// own gold-standard conflict rule: an appraiser NEVER buys what they appraise.

export interface Appraiser {
  id: string
  name: string
  credentials: string
  specialties: string[]
  distance: string
  photoFee: number
  visitFee: string
  yearsExperience: number
}

export const APPRAISERS: Appraiser[] = [
  {
    id: 'ap-reyes',
    name: 'Eleanor Reyes',
    credentials: 'ISA CAPP · USPAP current · insured',
    specialties: ['Jewelry', 'Watches', 'Silver'],
    distance: '12 miles away',
    photoFee: 30,
    visitFee: '$225 flat, up to 10 items',
    yearsExperience: 24,
  },
  {
    id: 'ap-okafor',
    name: 'Samuel Okafor',
    credentials: 'ASA, Personal Property · USPAP current · insured',
    specialties: ['Art', 'Antiques', 'Furniture'],
    distance: '18 miles away',
    photoFee: 35,
    visitFee: '$190/hour, most homes 1–2 hours',
    yearsExperience: 17,
  },
  {
    id: 'ap-lindqvist',
    name: 'Astrid Lindqvist',
    credentials: 'AAA Certified Member · USPAP current · insured',
    specialties: ['Coins', 'Collectibles', 'Instruments'],
    distance: '25 miles away',
    photoFee: 25,
    visitFee: '$250 flat, up to 12 items',
    yearsExperience: 31,
  },
]
