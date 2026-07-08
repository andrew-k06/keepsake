import type { ReactNode } from 'react'
import type { AppraisalStatus } from '../types'
import {
  CircleCheckBig,
  CircleAlert,
  Search,
  Camera,
  ShieldCheck,
  type LucideIcon,
} from './icons'

// ---- Button: large touch targets, warm styling ----
// Same name + prop shape as before. Added optional `icon` (lucide component)
// and `size` so pages can render an icon inside the button without emoji.
export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  full = false,
  disabled = false,
  icon: Icon,
  size = 'md',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  full?: boolean
  disabled?: boolean
  icon?: LucideIcon
  size?: 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center justify-center gap-2.5 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100'
  const sizes = {
    md: 'px-6 py-4 text-lg',
    lg: 'px-7 py-5 text-xl',
  }[size]
  const styles = {
    primary: 'bg-clay text-white hover:bg-clay-dark shadow-soft',
    secondary: 'bg-white text-ink border-2 border-line hover:border-clay',
    ghost: 'text-ink-soft hover:text-ink hover:bg-cream-deep',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes} ${styles} ${full ? 'w-full' : ''}`}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />}
      {children}
    </button>
  )
}

// ---- Card: soft, warm surface. Added optional `as` + interactive lift. ----
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-3xl bg-white border border-line shadow-soft ${className}`}>
      {children}
    </div>
  )
}

const appraisalMeta: Record<
  AppraisalStatus,
  { label: string; cls: string; icon: LucideIcon }
> = {
  none: { label: 'Not appraised', cls: 'bg-cream-deep text-ink-soft', icon: CircleAlert },
  requested: { label: 'Appraisal requested', cls: 'bg-amber/20 text-amber-deep', icon: Search },
  'photo-review': { label: 'In photo review', cls: 'bg-amber/20 text-amber-deep', icon: Camera },
  'needs-in-person': {
    label: 'Needs in-person visit',
    cls: 'bg-clay/15 text-clay-dark',
    icon: CircleAlert,
  },
  appraised: { label: 'Appraised', cls: 'bg-sage/15 text-sage-deep', icon: CircleCheckBig },
}

export function AppraisalBadge({ status }: { status: AppraisalStatus }) {
  const m = appraisalMeta[status]
  const Icon = m.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${m.cls}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {m.label}
    </span>
  )
}

// ---- Pill: small status chip. Added optional `icon`. ----
export function Pill({
  children,
  tone = 'neutral',
  icon: Icon,
}: {
  children: ReactNode
  tone?: 'neutral' | 'sage' | 'clay' | 'amber'
  icon?: LucideIcon
}) {
  const cls = {
    neutral: 'bg-cream-deep text-ink-soft',
    sage: 'bg-sage/15 text-sage-deep',
    clay: 'bg-clay/15 text-clay-dark',
    amber: 'bg-amber/20 text-amber-deep',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${cls}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />}
      {children}
    </span>
  )
}

// ---- Avatar: colored initials. Added optional `size`. ----
export function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const dim = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-lg',
  }[size]
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full text-white font-semibold ring-2 ring-white shadow-soft`}
      style={{ background: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// Convenience: the insured chip. The app never *asserts* coverage — insurance
// status is always something the owner told us, and the label says so.
export function InsuredBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 text-sm font-semibold text-white shadow-soft">
      <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      Insured (noted by you)
    </span>
  )
}

// ---- Shared form primitives (previously copy-pasted across pages) ----
export const inputClass =
  'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-clay outline-none'

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      {error && <InlineError>{error}</InlineError>}
    </label>
  )
}

/** A form problem the user can actually see — never a silent no-op. */
export function InlineError({ children }: { children: ReactNode }) {
  return (
    <span
      aria-live="polite"
      className="mt-2 flex items-center gap-1.5 rounded-xl bg-clay/10 px-3 py-2 text-sm font-semibold text-clay-dark"
    >
      <CircleAlert className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {children}
    </span>
  )
}

/** Small tag for anything simulated in this preview build — the app never
    pretends demo behavior is the real service. */
export function DemoTag({ children = 'Preview' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line-strong bg-cream-deep px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {children}
    </span>
  )
}
