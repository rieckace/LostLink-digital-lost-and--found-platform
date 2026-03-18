import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageTransition } from '../components/PageTransition'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../layouts/Container'
import { formatDateShort } from '../lib/format'
import { useAuthStore } from '../stores/authStore'
import { useItemsStore } from '../stores/itemsStore'

export function MyFoundReportsPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const fetchMyItems = useItemsStore((s) => s.fetchMyItems)
  const myItems = useItemsStore((s) => s.myItems)
  const myReportsLocal = useItemsStore((s) => s.myReports)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!token) {
        if (mounted) setLoading(false)
        return
      }
      setLoading(true)
      await fetchMyItems(token, 'found')
      if (mounted) setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [fetchMyItems, token])

  if (user?.role === 'admin') return <Navigate to="/admin/claims" replace />

  const items = useMemo(() => {
    const merged = [...myItems, ...myReportsLocal]
    const byId = new Map<string, (typeof merged)[number]>()
    for (const it of merged) {
      if (it.type !== 'found') continue
      if (!byId.has(it.id)) byId.set(it.id, it)
    }
    return Array.from(byId.values())
  }, [myItems, myReportsLocal])

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My found reports</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Items you reported as found.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/report/found">Report Found</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {loading ? (
            <Card className="p-6">
              <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
            </Card>
          ) : items.length === 0 ? (
            <EmptyState title="No found reports" description="Report a found item to see it here." />
          ) : (
            items.map((it) => (
              <Link
                key={it.id}
                to={`/items/${encodeURIComponent(it.id)}`}
                className="block"
              >
                <Card className="p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{it.title}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {it.location} • {formatDateShort(it.dateISO)}
                      </div>
                    </div>
                    <Badge tone="success">Found</Badge>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </Container>
    </PageTransition>
  )
}
