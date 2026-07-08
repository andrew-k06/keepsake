import { useEffect, useState } from 'react'
import type { Item } from '../types'
import { photoStore } from '../data/repository'
import { CategoryIcon } from './icons'

/** Resolve a stored photo id to its data URL (cache-first, then IndexedDB). */
function usePhoto(photoId?: string): string | undefined {
  const [src, setSrc] = useState<string | undefined>(() =>
    photoId ? photoStore.cached(photoId) : undefined,
  )
  useEffect(() => {
    if (!photoId) {
      setSrc(undefined)
      return
    }
    const hit = photoStore.cached(photoId)
    if (hit) {
      setSrc(hit)
      return
    }
    let alive = true
    photoStore
      .get(photoId)
      .then((v) => {
        if (alive && v) setSrc(v)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [photoId])
  return src
}

/**
 * ItemVisual — the single, canonical way to render an item's picture.
 *
 * Resolution order:
 *   1. item.photo  — a real photo the user added (data URL)
 *   2. item.image  — a hosted photographic image (seed data)
 *   3. fallback    — a tasteful tile with the category's lucide icon centered
 *                    on a soft cream-deep background (never an emoji)
 *
 * Drop this in anywhere an item picture is needed. The component fills its
 * parent: give the PARENT the aspect ratio / size and pass rounding via
 * `rounded` (defaults to "rounded-3xl"). Use `className` for extra classes.
 */
export function ItemVisual({
  item,
  className = '',
  rounded = 'rounded-3xl',
  eager = false,
}: {
  item: Item
  className?: string
  rounded?: string
  /** Load immediately — required on printable views so photos aren't blank on paper. */
  eager?: boolean
}) {
  const stored = usePhoto(item.photoId)
  const src = stored ?? item.photo ?? item.image

  if (src) {
    return (
      <img
        src={src}
        alt={item.name}
        loading={eager ? 'eager' : 'lazy'}
        className={`h-full w-full object-cover ${rounded} ${className}`}
      />
    )
  }

  return (
    <div
      className={`grid h-full w-full place-items-center bg-cream-deep text-clay-dark/80 ${rounded} ${className}`}
      role="img"
      aria-label={`${item.category} — no photo yet`}
    >
      <CategoryIcon category={item.category} className="h-[38%] w-[38%] min-h-8 min-w-8" />
    </div>
  )
}
