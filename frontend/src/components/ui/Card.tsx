import type React from 'react'
import { cn } from '../../lib/cn'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/70 ring-1 ring-slate-200 backdrop-blur',
        'shadow-sm shadow-slate-900/5 dark:bg-slate-900/50 dark:ring-slate-800',
        className,
      )}
      {...props}
    />
  )
}
