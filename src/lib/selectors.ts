// Tiny shared derivations — one definition, used by pages and the guide alike.

import type { Item } from '../types'

export const storiesTold = (items: Item[]): number =>
  items.filter((it) => it.story.trim()).length
