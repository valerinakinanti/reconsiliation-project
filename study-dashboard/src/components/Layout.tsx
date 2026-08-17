import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { ConfirmDialog } from '@/components/ConfirmDialog'

function NavTab({ to, children, end }: { to: string; children: React.ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand text-paper-raised' : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout() {
  const user = useStore((s) => s.user)
  const signOut = useStore((s) => s.signOut)
  const resetAllData = useStore((s) => s.resetAllData)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper-raised font-display text-sm font-semibold text-ink"
              aria-label="Semester Notebook"
            >
              §
            </div>
            <span className="hidden whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ink sm:inline">
              Semester Notebook
            </span>
          </div>

          <nav className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-paper-raised p-1">
            <NavTab to="/" end>
              Overview
            </NavTab>
            <NavTab to="/compare">
              <span className="sm:hidden">Compare</span>
              <span className="hidden sm:inline">Compare weeks</span>
            </NavTab>
          </nav>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
              aria-label="Account menu"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                <path d="M10 10.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3.5 17a6.5 6.5 0 0113 0 .75.75 0 01-.75.75h-11.5a.75.75 0 01-.75-.75z" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-12 w-56 rounded-card border border-line bg-paper-raised p-2 shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <p className="truncate px-2 py-1.5 text-xs text-ink-faint">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmReset(true)
                  }}
                  className="min-h-11 w-full rounded-md px-2 text-left text-sm text-status-needs-self-study hover:bg-status-needs-self-study-tint"
                >
                  Reset all data&hellip;
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="min-h-11 w-full rounded-md px-2 text-left text-sm text-ink-soft hover:bg-paper-sunken"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        description="This permanently deletes every course, week, chapter, session, and deadline. This can't be undone."
        confirmLabel="Delete everything"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          void resetAllData()
        }}
      />
    </div>
  )
}
