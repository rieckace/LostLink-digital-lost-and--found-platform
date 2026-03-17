import type React from 'react'
import { cn } from '../../lib/cn'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: Props) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-xl bg-white/70 px-3 text-sm text-slate-900 ring-1 ring-slate-200',
        'focus:outline-none focus:ring-2 focus:ring-sky-400/70 transition-colors duration-200',
        'dark:bg-slate-900/60 dark:text-slate-100 dark:ring-slate-800',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
