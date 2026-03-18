import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../layouts/Container'
import { formatDateShort } from '../lib/format'
import { resolveApiBase } from '../lib/apiBase'
import { useAuthStore } from '../stores/authStore'

type AdminClaim = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  proofText: string
  createdAt: string
  aiScore?: number
  aiReasons?: string[]
  aiBreakdown?: Record<string, number>
  isFlagged?: boolean
  flagReason?: string
  flaggedAt?: string
  claimer?: { id: string; name?: string; email?: string; role?: 'user' | 'admin'; isBanned?: boolean }
}

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
  description?: string
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

export function AdminItemReviewPage() {
  const { id } = useParams()
  const token = useAuthStore((s) => s.token)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<AdminItem | null>(null)
  const [claims, setClaims] = useState<AdminClaim[]>([])

  const load = async () => {
    if (!id) return
    setError(null)
    setLoading(true)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/items/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load item')
      setItem(data?.item ?? null)
      setClaims(Array.isArray(data?.claims) ? data.claims : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load item')
      setItem(null)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const pending = useMemo(() => claims.filter((c) => c.status === 'PENDING'), [claims])

  const updateClaimStatus = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/claims/${encodeURIComponent(claimId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update claim')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update claim')
    }
  }

  const flagClaim = async (claimId: string) => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/claims/${encodeURIComponent(claimId)}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ reason: 'Suspicious / potentially false claim' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to flag claim')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to flag claim')
    }
  }

  const banUser = async (userId: string, isBanned: boolean) => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ isBanned, reason: isBanned ? 'False/suspicious claims' : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update user')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update user')
    }
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="secondary">
            <Link to="/admin/items">Back to Review</Link>
          </Button>
          <Button type="button" variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Card className="mt-6 p-6">
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
          </Card>
        ) : !item ? (
          <Card className="mt-6 p-6">
            <div className="text-sm font-semibold">Item not found</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Try going back to the review list.
            </div>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card className="overflow-hidden lg:col-span-3">
              <img
                src={
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1520975682031-a9271c85c1f5?auto=format&fit=crop&w=1200&q=70'
                }
                alt={item.title}
                className="h-[340px] w-full object-cover"
              />
              <div className="p-6">
                <div className="text-xl font-semibold tracking-tight">{item.title}</div>
                {item.description ? (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                    {item.category}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                    {item.location}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                    {formatDateShort(item.dateISO)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                  Reporter: {item.reporter?.email ? maskEmail(item.reporter.email) : '—'}
                </div>
              </div>
            </Card>

            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="text-sm font-semibold">Pending claims</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Approve, reject, or flag suspicious claims.
                </div>

                <div className="mt-5 grid gap-3">
                  {pending.map((c) => {
                    const ai = typeof c.aiScore === 'number' ? c.aiScore : 0
                    const canApprove = ai >= 75
                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl bg-slate-100/70 p-4 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold">
                              {c.claimer?.name ?? 'Unknown claimer'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {c.claimer?.email ? maskEmail(c.claimer.email) : '—'} • AI: {ai}%
                              {c.isFlagged ? ' • Flagged' : ''}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={() => updateClaimStatus(c.id, 'APPROVED')}
                              disabled={!canApprove}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => updateClaimStatus(c.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                          {c.proofText}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => flagClaim(c.id)}>
                            Flag suspicious
                          </Button>
                          {c.claimer?.id ? (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => banUser(c.claimer!.id, true)}
                            >
                              Ban user
                            </Button>
                          ) : null}
                        </div>

                        {!canApprove ? (
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            Approve disabled: AI score below 75%.
                          </div>
                        ) : null}
                      </div>
                    )
                  })}

                  {!pending.length ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      No pending claims for this item.
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </PageTransition>
  )
}
