import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import {
  BookHeart,
  Home,
  Users,
  Search,
  LifeBuoy,
  HeartHandshake,
  type LucideIcon,
} from './icons'

interface NavEntry {
  to: string
  label: string
  short: string
  icon: LucideIcon
}

const nav: NavEntry[] = [
  { to: '/binder', label: 'My Binder', short: 'Binder', icon: Home },
  { to: '/family', label: 'Family', short: 'Family', icon: Users },
  { to: '/appraisals', label: 'Appraisals', short: 'Appraise', icon: Search },
  { to: '/emergency', label: 'In an Emergency', short: 'Emergency', icon: LifeBuoy },
  { to: '/summary', label: 'For My Family', short: 'Family', icon: HeartHandshake },
]

export function Layout({ children }: { children: ReactNode }) {
  const { state } = useStore()
  const location = useLocation()
  // The welcome screen is full-bleed, no chrome.
  if (location.pathname === '/') return <>{children}</>

  return (
    <div className="min-h-full md:flex">
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
          <p>Signed in as {state.ownerName}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between border-b border-line bg-white/80 backdrop-blur-sm px-5 py-4">
          <Brand small />
        </header>

        <main className="mx-auto max-w-4xl px-5 py-8 pb-28 md:pb-12">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex justify-around border-t border-line bg-white/95 backdrop-blur px-2 py-2">
          {nav.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-xs font-semibold ${
                    isActive ? 'text-clay' : 'text-ink-soft'
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
