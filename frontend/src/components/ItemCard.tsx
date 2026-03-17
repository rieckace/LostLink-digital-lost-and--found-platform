import { Link } from 'react-router-dom'
import type { LostFoundItem } from '../lib/types'
import { cn } from '../lib/cn'
import { formatDateShort, percent } from '../lib/format'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

export function ItemCard({ item }: { item: LostFoundItem }) {
  const score = item.matchScore ?? 0
  const matching = new Set(item.matchingTags ?? [])

  return (
    <Link to={`/items/${item.id}`} className="block">
      <Card className="group overflow-hidden transition-colors hover:bg-white dark:hover:bg-slate-900/70">
        <div className="relative">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Badge tone={item.type === 'found' ? 'success' : 'warning'}>
              {item.type === 'found' ? 'Found' : 'Lost'}
            </Badge>
            <Badge tone="info">{percent(score)}</Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </div>
              <div className="ll-clamp-2 mt-1 text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
              {item.category}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
              {item.location}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
              {formatDateShort(item.dateISO)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className={cn(
                  'rounded-full px-2 py-1 text-xs ring-1',
                  matching.has(t)
                    ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800'
                    : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700',
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
