import { SearchX } from 'lucide-react'
import { cn } from '../lib/cn'

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl bg-white/70 p-8 text-center ring-1 ring-slate-200 backdrop-blur',
        'dark:bg-slate-900/50 dark:ring-slate-800',
        className,
      )}
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
        <SearchX className="h-5 w-5" />
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </div>
      ) : null}
    </div>
  )
}
