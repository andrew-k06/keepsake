import type { ReactNode } from 'react'
import type { AppraisalStatus } from '../types'

// ---- Button: large touch targets, warm styling ----
export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  full = false,
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  full?: boolean
  disabled?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100'
  const styles = {
    primary: 'bg-clay text-white hover:bg-clay-dark shadow-sm',
    secondary: 'bg-white text-ink border-2 border-line hover:border-clay',
    ghost: 'text-ink-soft hover:text-ink hover:bg-cream-deep',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white border border-line shadow-sm ${className}`}>{children}</div>
  )
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-3xl">{children}</h2>
      {sub && <p className="text-ink-soft mt-1 text-lg">{sub}</p>}
    </div>
  )
}

const appraisalMeta: Record<AppraisalStatus, { label: string; cls: string }> = {
  none: { label: 'Not appraised', cls: 'bg-cream-deep text-ink-soft' },
  requested: { label: 'Appraisal requested', cls: 'bg-amber/20 text-[#9a6a14]' },
  'photo-review': { label: 'In photo review', cls: 'bg-amber/20 text-[#9a6a14]' },
  'needs-in-person': { label: 'Needs in-person visit', cls: 'bg-clay/15 text-clay-dark' },
  appraised: { label: 'Appraised', cls: 'bg-sage/15 text-sage-deep' },
}

export function AppraisalBadge({ status }: { status: AppraisalStatus }) {
  const m = appraisalMeta[status]
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${m.cls}`}>
      {m.label}
    </span>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'sage' | 'clay' }) {
  const cls = {
    neutral: 'bg-cream-deep text-ink-soft',
    sage: 'bg-sage/15 text-sage-deep',
    clay: 'bg-clay/15 text-clay-dark',
  }[tone]
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{children}</span>
}

export function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white font-semibold"
      style={{ background: color }}
    >
      {initials}
    </span>
  )
}
