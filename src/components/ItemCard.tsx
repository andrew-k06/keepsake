import { Link } from 'react-router-dom'
import type { Item } from '../types'
import { useStore, money } from '../store'
import { AppraisalBadge } from './ui'

export function ItemCard({ item }: { item: Item }) {
  const { personById } = useStore()
  const heir = item.beneficiaryId ? personById(item.beneficiaryId) : undefined
  return (
    <Link
      to={`/item/${item.id}`}
      className="group block overflow-hidden rounded-3xl bg-white border border-line shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep">
        {item.photo ? (
          <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-7xl">{item.emoji}</div>
        )}
        {item.insured && (
          <span className="absolute top-3 right-3 rounded-full bg-sage px-3 py-1 text-sm font-semibold text-white shadow">
            Insured
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          {item.name}
        </h3>
        <p className="mt-1 text-ink-soft">{item.category}</p>
        <div className="mt-3 flex items-center justify-between">
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
