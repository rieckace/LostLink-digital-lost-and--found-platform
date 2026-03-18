import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../layouts/Container'
import { formatDateShort } from '../lib/format'
import { resolveApiBase } from '../lib/apiBase'
import { useAuthStore } from '../stores/authStore'

type AdminItem = {
  id: string
  title: string
  category: string
  location: string
  locationLabel?: string
  dateISO: string
  type: 'lost' | 'found'
  status: 'ACTIVE' | 'CLAIMED'
  imageUrl?: string
  reporter?: { id: string; name?: string; email?: string }
}

const maskEmail = (email: string) => {
  const trimmed = email.trim()
  const at = trimmed.indexOf('@')
  if (at <= 1) return '••••'
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const localMasked = `${local.slice(0, 1)}•••${local.slice(-1)}`
  const domainParts = domain.split('.')
  const domainHead = domainParts[0] ? `${domainParts[0].slice(0, 1)}•••` : '•••'
  const domainTail = domainParts.length > 1 ? `.${domainParts.slice(1).join('.')}` : ''
  return `${localMasked}@${domainHead}${domainTail}`
}

export function AdminItemsPage() {
  const token = useAuthStore((s) => s.token)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminItem[]>([])

  const summary = useMemo(() => {
    const total = items.length
    const active = items.filter((i) => (i.status ?? '').toUpperCase() === 'ACTIVE').length
    const claimed = items.filter((i) => (i.status ?? '').toUpperCase() === 'CLAIMED').length
    return { total, active, claimed }
  }, [items])

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/items?limit=500`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load items')
      setItems(Array.isArray(data?.items) ? data.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Review items</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Browse reported items for review. Open an item to review its claims.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={load}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <Card className="p-5 lg:col-span-4">
            <div className="text-sm font-semibold">Items</div>
            <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              Total: {summary.total}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Active: {summary.active} • Claimed: {summary.claimed}
            </div>
          </Card>
          <Card className="p-5 lg:col-span-8">
            <div className="text-sm font-semibold">Review workflow</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Open an item to approve/reject/flag claims and moderate users.
            </div>
          </Card>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {items.map((it) => (
            <Link
              key={it.id}
              to={`/admin/items/${encodeURIComponent(it.id)}`}
              className="block"
            >
              <Card className="p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{it.title}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {it.category} • {it.location}
                      {it.locationLabel ? ` • ${it.locationLabel}` : ''}
                      {it.reporter?.email ? ` • Reporter: ${maskEmail(it.reporter.email)}` : ''}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatDateShort(it.dateISO)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={it.type === 'found' ? 'success' : 'warning'}>
                      {it.type === 'found' ? 'Found' : 'Lost'}
                    </Badge>
                    <div className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700">
                      {it.status}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {!loading && items.length === 0 ? (
            <Card className="p-6">
              <div className="text-sm font-semibold">No items found</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Once users report items, they appear here for review.
              </div>
            </Card>
          ) : null}

          {loading ? (
            <Card className="p-6">
              <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
            </Card>
          ) : null}
        </div>
      </Container>
    </PageTransition>
  )
}
