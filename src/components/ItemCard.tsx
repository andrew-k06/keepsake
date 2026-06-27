import { Link } from 'react-router-dom'
import type { Item } from '../types'
import { useStore, money } from '../store'
import { AppraisalBadge, InsuredBadge } from './ui'
import { ItemVisual } from './ItemVisual'

export function ItemCard({ item }: { item: Item }) {
  const { personById } = useStore()
  const heir = item.beneficiaryId ? personById(item.beneficiaryId) : undefined
  return (
    <Link
      to={`/item/${item.id}`}
      className="group block overflow-hidden rounded-3xl bg-white border border-line shadow-soft transition duration-200 hover:shadow-lift hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep">
        <ItemVisual item={item} rounded="rounded-none" className="transition duration-300 group-hover:scale-[1.03]" />
        {item.insured && (
          <span className="absolute top-3 right-3">
            <InsuredBadge />
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl leading-tight">{item.name}</h3>
        <p className="mt-1 text-ink-soft">{item.category}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-ink">{money(item.estValue)}</span>
          <AppraisalBadge status={item.appraisalStatus} />
        </div>
        {heir && (
          <p className="mt-3 text-sm text-ink-soft">
            For <span className="font-semibold text-clay">{heir.name}</span>
          </p>
        )}
      </div>
    </Link>
  )
}
