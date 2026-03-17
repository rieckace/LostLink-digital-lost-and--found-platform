import type React from 'react'
import { cn } from '../../lib/cn'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800/60',
        className,
      )}
      {...props}
    />
  )
}
