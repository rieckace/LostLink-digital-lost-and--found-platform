import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useAuthStore } from '../stores/authStore'
import { Container } from '../layouts/Container'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { ProfileMenu } from './ProfileMenu'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/Button'

const links = [
  { to: '/', label: 'Home' },
  { to: '/report/lost', label: 'Report Lost' },
  { to: '/report/found', label: 'Report Found' },
  { to: '/browse', label: 'Browse Items' },
  { to: '/dashboard', label: 'Dashboard' },
]

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
          'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900',
          'dark:text-slate-200 dark:hover:bg-slate-900/50 dark:hover:text-white',
          isActive &&
            'bg-slate-100/80 text-slate-900 dark:bg-slate-900/60 dark:text-white',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function Navbar() {
  const token = useAuthStore((s) => s.token)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/40">
      <Container className="flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />

          {token ? (
            <ProfileMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            className="ml-1 h-10 w-10 rounded-xl p-0 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </Container>

      {mobileOpen ? (
        <div className="border-t border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/50 md:hidden">
          <Container className="py-3">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavItem
                  key={l.to}
                  to={l.to}
                  label={l.label}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              {!token ? (
                <div className="mt-2 flex gap-2">
                  <Button asChild variant="secondary" className="flex-1">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
