import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import {
  BookHeart,
  Home,
  Users,
  BadgeCheck,
  LifeBuoy,
  HeartHandshake,
  Shield,
  Compass,
  type LucideIcon,
} from './icons'

interface NavEntry {
  to: string
  label: string
  short: string
  icon: LucideIcon
  /** Mobile bottom nav is already at capacity — some entries are sidebar-only
      (on mobile, the Home next-step card is the door to the Guide). */
  desktopOnly?: boolean
}

// Note: Appraisals deliberately does NOT use a magnifying-glass icon — that
// reads as "search" and earns mis-taps. Each short label is unique.
const nav: NavEntry[] = [
  { to: '/binder', label: 'My Binder', short: 'Binder', icon: Home },
  { to: '/guide', label: 'Getting Ready', short: 'Path', icon: Compass, desktopOnly: true },
  { to: '/family', label: 'Family', short: 'Family', icon: Users },
  { to: '/appraisals', label: 'Appraisals', short: 'Appraise', icon: BadgeCheck },
  { to: '/check', label: 'Before You Sell', short: 'Offers', icon: Shield },
  { to: '/emergency', label: 'In an Emergency', short: 'Emergency', icon: LifeBuoy },
  { to: '/summary', label: 'For My Family', short: 'Summary', icon: HeartHandshake },
]

export function Layout({ children }: { children: ReactNode }) {
  const { state, saveError, otherTabWrote, exitExample } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const leaveExample = async () => {
    const hadOwn = await exitExample()
    navigate(hadOwn ? '/binder' : '/start')
  }
  // Full-bleed screens (welcome, onboarding, printable documents) get no chrome.
  if (
    location.pathname === '/' ||
    location.pathname === '/start' ||
    location.pathname.startsWith('/print')
  )
    return <>{children}</>

  return (
    <div className="min-h-full md:flex">
      {saveError && (
        <div
          role="alert"
          className="print-hidden fixed inset-x-0 top-0 z-50 border-b-2 border-clay-dark bg-clay/10 px-5 py-3 text-center font-semibold text-clay-dark backdrop-blur"
        >
          {saveError}
        </div>
      )}
      {!saveError && otherTabWrote && (
        <div
          role="alert"
          className="print-hidden fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 border-b-2 border-amber-deep bg-amber/15 px-5 py-3 font-semibold text-amber-deep backdrop-blur"
        >
          <span>This binder was changed in another window.</span>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border-2 border-amber-deep px-3 py-1 hover:bg-amber/20"
          >
            Show the latest
          </button>
        </div>
      )}
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-line bg-white/70 backdrop-blur-sm p-5">
        <Brand />
        <nav className="mt-9 flex flex-col gap-1.5">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-line text-sm text-ink-soft">
          <p className="font-semibold text-ink">{state.binderName}</p>
          <p>{state.ownerName}’s binder, on this device</p>
          <NavLink to="/plan" className="mt-1 inline-block font-semibold text-clay-dark hover:underline">
            {state.plan.tier === 'starter'
              ? 'Free starter binder'
              : state.plan.tier === 'binder'
                ? 'Keepsake Binder — yours forever'
                : 'Family Plan'}
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Example-binder banner — honest at all times about whose binder this is */}
        {state.isDemo && (
          <div className="print-hidden flex flex-wrap items-center justify-center gap-3 border-b-2 border-sage/40 bg-sage/10 px-5 py-2.5 text-center font-semibold text-sage-deep">
            <span>You’re looking at Margaret’s example binder.</span>
            <button onClick={leaveExample} className="rounded-xl border-2 border-sage-deep px-3 py-1 hover:bg-sage/15">
              Leave the example
            </button>
          </div>
        )}
        {/* Mobile top bar — quick doors to the Guide and Plan (neither fits
            the six-item bottom nav; a monetization page must not be
            desktop-only) */}
        <header className="md:hidden flex items-center justify-between border-b border-line bg-white/80 backdrop-blur-sm px-5 py-4">
          <Brand small />
          <div className="flex items-center gap-2">
            <NavLink
              to="/guide"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-sage-deep"
            >
              <Compass className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              Path
            </NavLink>
            <NavLink
              to="/plan"
              className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold text-clay-dark"
            >
              {state.plan.tier === 'starter' ? 'Free plan' : 'Plan'}
            </NavLink>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-8 pb-28 md:pb-12">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex justify-around border-t border-line bg-white/95 backdrop-blur px-2 py-2">
          {nav.filter((n) => !n.desktopOnly).map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-xs font-semibold ${
                    isActive ? 'text-clay-dark' : 'text-ink-soft'
                  }`
                }
              >
                <Icon className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className="text-center leading-tight">{n.short}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <NavLink to="/binder" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-clay text-white shadow-soft">
        <BookHeart className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className={`font-serif leading-none ${small ? 'text-2xl' : 'text-3xl'}`}>Keepsake</span>
    </NavLink>
  )
}

function NavItem({ to, label, icon: Icon }: NavEntry) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-semibold transition ${
          isActive ? 'bg-clay text-white shadow-soft' : 'text-ink hover:bg-cream-deep'
        }`
      }
    >
      <Icon className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
