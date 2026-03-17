import { cn } from '../lib/cn'
import { clamp01, percent } from '../lib/format'

export function MatchMeter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const v = clamp01(value)
  const r = 16
  const c = 2 * Math.PI * r
  const dash = c * v

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <svg width="42" height="42" viewBox="0 0 42 42" className="shrink-0">
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="6"
        />
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          strokeLinecap="round"
          className="stroke-sky-500 dark:stroke-sky-400"
          strokeWidth="6"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 21 21)"
        />
      </svg>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Match</div>
        <div className="text-sm font-semibold">{percent(v)}</div>
      </div>
    </div>
  )
}
