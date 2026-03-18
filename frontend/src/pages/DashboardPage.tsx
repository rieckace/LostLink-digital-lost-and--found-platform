import { FilePlus2, PackageSearch, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageTransition } from '../components/PageTransition'
import { StatusBadge } from '../components/StatusBadge'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Container } from '../layouts/Container'
import { formatDateShort } from '../lib/format'
import { useAuthStore } from '../stores/authStore'
import { useItemsStore } from '../stores/itemsStore'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const myReports = useItemsStore((s) => s.myReports)
  const myClaims = useItemsStore((s) => s.myClaims)

  if (user?.role === 'admin') {
    return <Navigate to="/admin/claims" replace />
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {user?.name ? `Hi, ${user.name}. ` : ''}Track your reports and claims.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/report/lost">
                <FilePlus2 className="h-4 w-4" /> Report Lost
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/assets">
                <QrCode className="h-4 w-4" /> My QR Tags
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/browse">
                <PackageSearch className="h-4 w-4" /> Browse
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold">My items</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Items you reported.
            </div>

            <div className="mt-5 space-y-3">
              {myReports.length === 0 ? (
                <EmptyState
                  title="No reports yet"
                  description="Report a lost or found item to get started."
                />
              ) : (
                myReports.map((it) => (
                  <Link
                    key={it.id}
                    to={`/items/${it.id}`}
                    className="block rounded-2xl p-4 ring-1 ring-slate-200 transition-colors hover:bg-slate-100/70 dark:ring-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{it.title}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {it.location} • {formatDateShort(it.dateISO)}
                        </div>
                      </div>
                      <Badge tone={it.type === 'found' ? 'success' : 'warning'}>
                        {it.type === 'found' ? 'Found' : 'Lost'}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">My claims</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Claims you submitted.
            </div>

            <div className="mt-5 space-y-3">
              {myClaims.length === 0 ? (
                <EmptyState
                  title="No claims yet"
                  description="Open an item and submit a claim."
                />
              ) : (
                myClaims.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl p-4 ring-1 ring-slate-200 dark:ring-slate-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{c.itemTitle}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Submitted {formatDateShort(c.submittedAtISO)}
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </Container>
    </PageTransition>
  )
}
