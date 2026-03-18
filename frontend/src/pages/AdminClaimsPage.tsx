import { useEffect, useMemo, useState } from 'react'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../layouts/Container'
import { useAuthStore } from '../stores/authStore'
import { resolveApiBase } from '../lib/apiBase'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AdminUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isBanned?: boolean
  banReason?: string
}

type AdminFlag = {
  id: string
  reason: string
  status: 'OPEN' | 'RESOLVED'
  createdAt: string
  item?: { id: string; title?: string; type?: string; location?: string }
  reporter?: { id: string; name?: string; email?: string }
}

type Dispute = {
  itemId: string
  claimCount: number
  item?: { id: string; title?: string; type?: string; location?: string; dateISO?: string }
  claims: AdminClaim[]
}

type AdminClaim = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  proofText: string
  createdAt: string
  resolvedAt?: string
  aiScore?: number
  aiReasons?: string[]
  aiBreakdown?: Record<string, number>
  item?: {
    id: string
    title: string
    category: string
    location: string
    dateISO: string
    type: 'lost' | 'found'
    userId: string
  }
  claimer?: {
    id: string
    name: string
    email: string
  }
  resolver?: {
    id: string
    name: string
    email: string
  }
}

type AdminMetrics = {
  users: { total: number; active: number; banned: number }
  items: {
    activeLost: number
    activeFound: number
    claimed: number
    total: number
    recoveryRate: number
  }
  moderation: { pendingClaims: number; openFlags: number; disputesOpen: number }
}

export function AdminClaimsPage() {
  const token = useAuthStore((s) => s.token)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claims, setClaims] = useState<AdminClaim[]>([])
  const [status, setStatus] = useState<'All' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  const [items, setItems] = useState<any[]>([])
  const [flags, setFlags] = useState<AdminFlag[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userQuery, setUserQuery] = useState('')

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [auditClaims, setAuditClaims] = useState<AdminClaim[]>([])

  const [revealedEmailKeys, setRevealedEmailKeys] = useState<Set<string>>(() => new Set())

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

  const renderEmail = (email: string | undefined, key: string) => {
    if (!email) return <span>—</span>
    const revealed = revealedEmailKeys.has(key)
    return (
      <span className="inline-flex items-center gap-2">
        <span>{revealed ? email : maskEmail(email)}</span>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
          onClick={() => {
            setRevealedEmailKeys((prev) => {
              const next = new Set(prev)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              return next
            })
          }}
        >
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      </span>
    )
  }

  const loadDashboard = async () => {
    setError(null)
    setLoading(true)
    try {
      const API_URL = await resolveApiBase()
      const qs = status === 'All' ? '' : `?status=${encodeURIComponent(status)}`

      const [claimsRes, itemsRes] = await Promise.all([
        fetch(`${API_URL}/admin/claims${qs}`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }),
        fetch(`${API_URL}/admin/items?limit=500`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }),
      ])

      const claimsData = await claimsRes.json()
      const itemsData = await itemsRes.json()

      if (!claimsRes.ok) throw new Error(claimsData?.error || 'Failed to load claims')
      if (!itemsRes.ok) throw new Error(itemsData?.error || 'Failed to load reports')

      setClaims(Array.isArray(claimsData?.claims) ? claimsData.claims : [])
      setItems(Array.isArray(itemsData?.items) ? itemsData.items : [])

      // Moderation data (don’t fail whole dashboard if one fails)
      const [flagsRes, disputesRes, usersRes, metricsRes, auditRes] = await Promise.all([
        fetch(`${API_URL}/admin/flags?status=OPEN`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }).catch(() => null as any),
        fetch(`${API_URL}/admin/disputes`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }).catch(() => null as any),
        fetch(`${API_URL}/admin/users${userQuery.trim() ? `?q=${encodeURIComponent(userQuery.trim())}` : ''}`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }).catch(() => null as any),
        fetch(`${API_URL}/admin/metrics`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }).catch(() => null as any),
        fetch(`${API_URL}/admin/claims/audit?limit=10`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        }).catch(() => null as any),
      ])

      if (flagsRes && flagsRes.ok) {
        const d = await flagsRes.json()
        setFlags(Array.isArray(d?.flags) ? d.flags : [])
      }
      if (disputesRes && disputesRes.ok) {
        const d = await disputesRes.json()
        setDisputes(Array.isArray(d?.disputes) ? d.disputes : [])
      }
      if (usersRes && usersRes.ok) {
        const d = await usersRes.json()
        setUsers(Array.isArray(d?.users) ? d.users : [])
      }

      if (metricsRes && metricsRes.ok) {
        const d = await metricsRes.json()
        setMetrics(d?.metrics ?? null)
      }

      if (auditRes && auditRes.ok) {
        const d = await auditRes.json()
        setAuditClaims(Array.isArray(d?.claims) ? d.claims : [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const pendingCount = useMemo(() => claims.filter((c) => c.status === 'PENDING').length, [claims])
  const approvedCount = useMemo(() => claims.filter((c) => c.status === 'APPROVED').length, [claims])
  const rejectedCount = useMemo(() => claims.filter((c) => c.status === 'REJECTED').length, [claims])

  const reportsSummary = useMemo(() => {
    const total = items.length
    const lost = items.filter((i) => (i?.type ?? '').toLowerCase() === 'lost').length
    const found = items.filter((i) => (i?.type ?? '').toLowerCase() === 'found').length
    const claimed = items.filter((i) => (i?.status ?? '').toUpperCase() === 'CLAIMED').length
    const active = items.filter((i) => (i?.status ?? '').toUpperCase() === 'ACTIVE').length
    return { total, lost, found, active, claimed }
  }, [items])

  const resolveFlag = async (flagId: string) => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/flags/${encodeURIComponent(flagId)}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ resolutionNote: 'Reviewed' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to resolve flag')
      await loadDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resolve flag')
    }
  }

  const setBan = async (userId: string, isBanned: boolean) => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/users/${encodeURIComponent(userId)}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ isBanned, reason: isBanned ? 'Moderator action' : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update ban')
      await loadDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update ban')
    }
  }

  const reportsByDate = useMemo(() => {
    const days = 14
    const today = new Date()
    const labels: string[] = []
    const series: { dateISO: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateISO = d.toISOString().slice(0, 10)
      labels.push(dateISO)
    }

    const counts = new Map<string, number>()
    for (const it of items) {
      const dateISO = String(it?.dateISO ?? '').slice(0, 10)
      if (!dateISO) continue
      counts.set(dateISO, (counts.get(dateISO) ?? 0) + 1)
    }

    for (const dateISO of labels) {
      series.push({ dateISO, count: counts.get(dateISO) ?? 0 })
    }

    const max = Math.max(1, ...series.map((s) => s.count))
    return { series, max }
  }, [items])

  const reportsChartData = useMemo(() => {
    return reportsByDate.series.map((s) => ({
      date: s.dateISO.slice(5),
      count: s.count,
    }))
  }, [reportsByDate.series])

  const updateStatus = async (claimId: string, next: 'APPROVED' | 'REJECTED') => {
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/admin/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update claim')
      await loadDashboard()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update claim')
    }
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Reports analytics + claim review. AI score ≥ 75% is required to initiate and approve.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="All">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button variant="secondary" type="button" onClick={loadDashboard}>
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        {metrics ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-4">
              <div className="text-sm font-semibold">Users</div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Active: {metrics.users.active} / {metrics.users.total}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Banned: {metrics.users.banned}</div>
            </Card>
            <Card className="p-5 lg:col-span-4">
              <div className="text-sm font-semibold">Items</div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Active lost: {metrics.items.activeLost} • Active found: {metrics.items.activeFound}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Recovery rate: {(metrics.items.recoveryRate * 100).toFixed(1)}%
              </div>
            </Card>
            <Card className="p-5 lg:col-span-4">
              <div className="text-sm font-semibold">Moderation</div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Pending claims: {metrics.moderation.pendingClaims}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Open flags: {metrics.moderation.openFlags} • Disputes: {metrics.moderation.disputesOpen}
              </div>
            </Card>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="p-5">
              <div className="text-sm font-semibold">Reports analytics (last 14 days)</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Total reports: {reportsSummary.total} • Lost: {reportsSummary.lost} • Found: {reportsSummary.found} • Active: {reportsSummary.active} • Claimed: {reportsSummary.claimed}
              </div>

              <div className="mt-4">
                <div className="h-[220px] w-full text-slate-400 dark:text-slate-500">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="currentColor" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <div className="mt-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Recent reports</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Latest reported items (from backend)
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {loading ? 'Loading…' : `${items.length} loaded`}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {items.slice(0, 8).map((it) => (
                    <div key={String(it.id ?? it._id)} className="flex flex-col gap-1 rounded-xl bg-slate-100/70 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          {String(it.title ?? 'Untitled')}
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({String(it.type ?? '').toLowerCase() || 'lost'})</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {String(it.dateISO ?? '').slice(0, 10)} • {String(it.status ?? 'ACTIVE')}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {String(it.category ?? 'Other')} • {String(it.location ?? '—')}
                        {it.reporter?.email ? (
                          <>
                            {' • Reporter: '}
                            {renderEmail(String(it.reporter.email), `reporter-${String(it.id ?? it._id)}`)}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {!loading && items.length === 0 ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">No reports found.</div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Flagged items</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Items reported by users for moderator review.
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {flags.length} open
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {flags.slice(0, 6).map((f) => (
                    <div key={f.id} className="rounded-xl bg-slate-100/70 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium">{f.item?.title ?? 'Unknown item'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{String(f.createdAt ?? '').slice(0, 10)}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Reporter: {renderEmail(f.reporter?.email, `flag-${f.id}`)} • Reason: {f.reason}
                      </div>
                      <div className="mt-3">
                        <Button type="button" variant="secondary" onClick={() => resolveFlag(f.id)}>
                          Mark reviewed
                        </Button>
                      </div>
                    </div>
                  ))}
                  {flags.length === 0 ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">No open flags.</div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Disputes (multiple claims)</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Items with 2+ pending claims.
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{disputes.length}</div>
                </div>

                <div className="mt-4 grid gap-2">
                  {disputes.slice(0, 4).map((d) => (
                    <div key={d.itemId} className="rounded-xl bg-slate-100/70 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                      <div className="text-sm font-medium">{d.item?.title ?? 'Unknown item'}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Claims: {d.claimCount} • {d.item?.location ?? '—'} • {String(d.item?.dateISO ?? '').slice(0, 10)}
                      </div>
                      <div className="mt-3 grid gap-2">
                        {d.claims.slice(0, 2).map((c) => (
                          <div key={c.id} className="rounded-xl bg-white/70 p-2 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800">
                            {renderEmail(c.claimer?.email, `dispute-${d.itemId}-${c.id}`)} • AI: {(c.aiScore ?? 0)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {disputes.length === 0 ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">No disputes right now.</div>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-5">
              <div className="text-sm font-semibold">Claims review</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {loading
                  ? 'Loading claims…'
                  : `${claims.length} claim(s) loaded • ${pendingCount} pending • ${approvedCount} approved • ${rejectedCount} rejected`}
              </div>
            </Card>

            <div className="mt-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Resolved claims (audit)</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Latest approvals/rejections.
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{auditClaims.length}</div>
                </div>

                <div className="mt-4 grid gap-2">
                  {auditClaims.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl bg-slate-100/70 p-3 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{c.item?.title ?? 'Unknown item'}</div>
                        <div
                          className={
                            'rounded-full px-2 py-1 text-[11px] ring-1 ' +
                            (c.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800'
                              : 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800')
                          }
                        >
                          {c.status}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Claimer: {renderEmail(c.claimer?.email, `audit-claimer-${c.id}`)}
                        {' • Resolved: '}
                        {String(c.resolvedAt ?? '').slice(0, 10) || '—'}
                      </div>
                    </div>
                  ))}
                  {!loading && auditClaims.length === 0 ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">No resolved claims yet.</div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <Card className="p-5">
                <div className="text-sm font-semibold">User moderation</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Ban/unban malicious users.
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search users by name/email"
                  />
                  <Button type="button" variant="secondary" onClick={loadDashboard}>
                    Search
                  </Button>
                </div>

                <div className="mt-4 grid gap-2">
                  {users.slice(0, 6).map((u) => (
                    <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100/70 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                      <div>
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {renderEmail(u.email, `user-${u.id}`)}
                        </div>
                      </div>
                      {u.role === 'admin' ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400">Admin</div>
                      ) : (
                        <Button
                          type="button"
                          variant={u.isBanned ? 'secondary' : undefined}
                          onClick={() => setBan(u.id, !u.isBanned)}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                      )}
                    </div>
                  ))}
                  {users.length === 0 ? (
                    <div className="text-sm text-slate-600 dark:text-slate-300">No users found.</div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="mt-4 grid gap-4">
              {claims.map((c) => {
                const score = typeof c.aiScore === 'number' ? c.aiScore : 0
                const canApprove = score >= 75
                const breakdown = c.aiBreakdown ?? {}

                return (
                  <Card key={c.id} className="p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          {c.item?.title ?? 'Unknown item'}
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({c.item?.type ?? 'lost'})</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Claimer: {c.claimer?.name ?? 'Unknown'} ({renderEmail(c.claimer?.email, `claim-${c.id}`)})
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Location: {c.item?.location ?? '—'} • Date: {c.item?.dateISO ?? '—'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={
                            'rounded-full px-3 py-1 text-xs ring-1 ' +
                            (c.status === 'PENDING'
                              ? 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700'
                              : c.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800'
                                : 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800')
                          }
                        >
                          {c.status}
                        </div>
                        <div
                          className={
                            'rounded-full px-3 py-1 text-xs ring-1 ' +
                            (canApprove
                              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800'
                              : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700')
                          }
                        >
                          AI score: {score}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <div className="text-sm font-medium">AI breakdown</div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="rounded-xl bg-slate-100/70 p-2 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">Tags: {breakdown.tags ?? 0}%</div>
                        <div className="rounded-xl bg-slate-100/70 p-2 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">Location: {breakdown.location ?? 0}%</div>
                        <div className="rounded-xl bg-slate-100/70 p-2 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">Timing: {breakdown.timing ?? 0}%</div>
                        <div className="rounded-xl bg-slate-100/70 p-2 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">Proof: {breakdown.proof ?? 0}%</div>
                      </div>

                      {c.aiReasons?.length ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {c.aiReasons.slice(0, 4).join(' • ')}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div className="text-sm font-medium">Claim proof</div>
                      <div className="rounded-xl bg-slate-100/70 p-3 text-sm text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-slate-700">
                        {c.proofText}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => updateStatus(c.id, 'APPROVED')}
                        disabled={c.status !== 'PENDING' || !canApprove}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => updateStatus(c.id, 'REJECTED')}
                        disabled={c.status !== 'PENDING'}
                      >
                        Reject
                      </Button>
                    </div>

                    {!canApprove && c.status === 'PENDING' ? (
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Approval is disabled because AI score is below 75%.
                      </div>
                    ) : null}
                  </Card>
                )
              })}

              {!loading && claims.length === 0 ? (
                <Card className="p-6">
                  <div className="text-sm font-semibold">No claims found</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Try switching the status filter.
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </PageTransition>
  )
}
