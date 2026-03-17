import { ChevronDown, LayoutDashboard, LogOut, PackageSearch } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClickOutside } from '../hooks/useClickOutside'
import { cn } from '../lib/cn'
import { useAuthStore } from '../stores/authStore'
import { Card } from './ui/Card'

export function ProfileMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useClickOutside(ref, () => setOpen(false), open)

  const initials = (() => {
    if (!user?.name) return 'U'
    const parts = user.name.trim().split(/\s+/)
    return (parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '')
  })()

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium',
          'hover:bg-slate-100/70 dark:hover:bg-slate-900/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950',
        )}
        aria-label="Open user menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white dark:bg-slate-50 dark:text-slate-900">
          {initials.toUpperCase()}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block leading-4">{user.name}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {user.email}
          </span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block dark:text-slate-400" />
      </button>

      {open ? (
        <Card className="absolute right-0 z-50 mt-2 w-[240px] p-2">
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
              'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
            )}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
              'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
            )}
            onClick={() => setOpen(false)}
          >
            <PackageSearch className="h-4 w-4" />
            My Items
          </Link>
          <button
            type="button"
            className={cn(
              'mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm',
              'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
            )}
            onClick={() => {
              logout()
              setOpen(false)
              navigate('/')
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </Card>
      ) : null}
    </div>
  )
}
