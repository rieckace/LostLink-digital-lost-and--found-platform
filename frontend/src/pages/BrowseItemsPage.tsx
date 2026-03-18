import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageTransition } from '../components/PageTransition'
import { Container } from '../layouts/Container'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ItemCard } from '../components/ItemCard'
import { EmptyState } from '../components/EmptyState'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useClickOutside } from '../hooks/useClickOutside'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { categories, commonLocations } from '../data/mockItems'
import { cn } from '../lib/cn'
import { useItemsStore } from '../stores/itemsStore'

const dateOptions = ['Any', 'Last 7 days'] as const

export function BrowseItemsPage() {
  const storeItems = useItemsStore((s) => s.items)
  const filters = useItemsStore((s) => s.filters)
  const setFilter = useItemsStore((s) => s.setFilter)
  const fetchItems = useItemsStore((s) => s.fetchItems)

  const [suggestOpen, setSuggestOpen] = useState(false)
  const suggestRef = useRef<HTMLDivElement | null>(null)
  useClickOutside(suggestRef, () => setSuggestOpen(false), suggestOpen)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchItems().finally(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [fetchItems])

  const debouncedQuery = useDebouncedValue(filters.query, 150)

  const items = useMemo(() => {
    const { query, category, location, date } = filters
    const q = query.trim().toLowerCase()
    const allItems = storeItems

    return allItems.filter((it) => {
      const matchesQuery =
        !q ||
        (it.title ?? '').toLowerCase().includes(q) ||
        (it.description ?? '').toLowerCase().includes(q) ||
        (it.location ?? '').toLowerCase().includes(q) ||
        (it.tags ?? []).some((t) => (t ?? '').toLowerCase().includes(q))

      const matchesCategory = category === 'All' || it.category === category
      const matchesLocation = location === 'All' || it.location === location

      const matchesDate =
        date === 'Any'
          ? true
          : date === 'Last 7 days'
            ? new Date(it.dateISO).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
            : true

      return matchesQuery && matchesCategory && matchesLocation && matchesDate
    })
  }, [filters, storeItems])

  const suggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    const all = storeItems

    if (!q) {
      const pool = new Set<string>()

      for (const it of all) {
        for (const tag of it.tags ?? []) pool.add(tag)
      }
      for (const it of all) {
        if (it.location) pool.add(it.location)
      }
      for (const it of all) {
        if (it.title) pool.add(it.title)
      }

      return Array.from(pool).slice(0, 6)
    }

    const pool = new Set<string>()
    for (const it of all) {
      const title = it.title ?? ''
      const location = it.location ?? ''
      if (title.toLowerCase().includes(q)) pool.add(title)
      if (location.toLowerCase().includes(q)) pool.add(location)
      for (const tag of it.tags ?? []) {
        if ((tag ?? '').toLowerCase().includes(q)) pool.add(tag)
      }
    }

    return Array.from(pool).slice(0, 6)
  }, [debouncedQuery, storeItems])

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse items</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Search by item, tag, or location. Use filters to narrow results.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div ref={suggestRef} className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                value={filters.query}
                onChange={(e) => {
                  setFilter('query', e.target.value)
                  setSuggestOpen(true)
                }}
                onFocus={() => setSuggestOpen(true)}
                placeholder="Try 'AirPods', 'wallet', 'library'"
                className="pl-10"
                aria-label="Search"
              />

              {suggestOpen && suggestions.length > 0 ? (
                <Card className="absolute z-40 mt-2 w-full overflow-hidden p-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Suggestions
                  </div>
                  <div className="mt-2 grid gap-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={cn(
                          'rounded-xl px-3 py-2 text-left text-sm',
                          'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
                        )}
                        onClick={() => {
                          setFilter('query', s)
                          setSuggestOpen(false)
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Select
              value={filters.location}
              onChange={(e) => setFilter('location', e.target.value)}
              aria-label="Filter by location"
            >
              <option value="All">Location: All</option>
              {commonLocations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Select
              value={filters.date}
              onChange={(e) => setFilter('date', e.target.value)}
              aria-label="Filter by date"
            >
              {dateOptions.map((d) => (
                <option key={d} value={d}>
                  Date: {d}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No items found"
              description="Try a different search or loosen filters."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </PageTransition>
  )
}
