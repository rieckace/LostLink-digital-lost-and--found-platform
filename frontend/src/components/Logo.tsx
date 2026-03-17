import { Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold',
        'text-slate-900 hover:bg-slate-100/70 dark:text-slate-100 dark:hover:bg-slate-900/50',
        className,
      )}
      aria-label="LostLink Home"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
        <Link2 className="h-5 w-5" />
      </span>
      <span className="text-base tracking-tight">LostLink</span>
    </Link>
  )
}
