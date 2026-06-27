import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store'

const nav = [
  { to: '/binder', label: 'My Binder', icon: '🏠' },
  { to: '/family', label: 'Family', icon: '👪' },
  { to: '/appraisals', label: 'Appraisals', icon: '🔎' },
  { to: '/emergency', label: 'In an Emergency', icon: '🆘' },
  { to: '/summary', label: 'For My Family', icon: '💌' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { state } = useStore()
  const location = useLocation()
  // The welcome screen is full-bleed, no chrome.
  if (location.pathname === '/') return <>{children}</>

  return (
    <div className="min-h-full md:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-line bg-white/60 p-5">
        <Brand />
        <nav className="mt-8 flex flex-col gap-2">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <div className="mt-auto pt-6 text-sm text-ink-soft">
          <p className="font-semibold text-ink">{state.binderName}</p>
          <p>Signed in as {state.ownerName}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between border-b border-line bg-white/70 px-5 py-4">
          <Brand small />
        </header>

        <main className="mx-auto max-w-4xl px-5 py-8 pb-28 md:pb-12">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex justify-around border-t border-line bg-white px-2 py-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  isActive ? 'text-clay' : 'text-ink-soft'
                }`
              }
            >
              <span className="text-xl">{n.icon}</span>
              {n.label.split(' ')[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <NavLink to="/binder" className="flex items-center gap-2">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-clay text-white text-xl">❦</span>
      <span className={`font-serif ${small ? 'text-2xl' : 'text-3xl'}`} style={{ fontFamily: 'Georgia, serif' }}>
        Keepsake
      </span>
    </NavLink>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-lg font-semibold transition ${
          isActive ? 'bg-clay text-white' : 'text-ink hover:bg-cream-deep'
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      {label}
    </NavLink>
  )
}
