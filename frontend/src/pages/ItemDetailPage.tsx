import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { EmptyState } from '../components/EmptyState'
import { FileUploadField } from '../components/FileUploadField'
import { MatchMeter } from '../components/MatchMeter'
import { PageTransition } from '../components/PageTransition'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Container } from '../layouts/Container'
import { cn } from '../lib/cn'
import { formatDateShort } from '../lib/format'
import { getMatchInsights } from '../lib/ai'
import { useAuthStore } from '../stores/authStore'
import { useItemsStore } from '../stores/itemsStore'

const claimSchema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  details: z.string().min(10, 'Add some proof details'),
})

type ClaimValues = z.infer<typeof claimSchema>

export function ItemDetailPage() {
  const { id } = useParams()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const submitClaim = useItemsStore((s) => s.submitClaim)
  const items = useItemsStore((s) => s.items)
  const myReports = useItemsStore((s) => s.myReports)

  const item = useMemo(() => {
    if (!id) return null
    return items.find((x) => x.id === id) ?? myReports.find((x) => x.id === id) ?? null
  }, [id, items, myReports])

  const matching = useMemo(() => new Set(item?.matchingTags ?? []), [item?.matchingTags])
  const insights = useMemo(() => (item ? getMatchInsights(item) : null), [item])

  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      details: '',
    },
  })

  if (!item) {
    return (
      <PageTransition>
        <Container className="py-10">
          <EmptyState
            title="Item not found"
            description="Try browsing items again."
          />
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link to="/browse">
                <ArrowLeft className="h-4 w-4" /> Back to Browse
              </Link>
            </Button>
          </div>
        </Container>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost">
            <Link to="/browse">
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Badge tone={item.type === 'found' ? 'success' : 'warning'}>
              {item.type === 'found' ? 'Found' : 'Lost'}
            </Badge>
            <MatchMeter value={item.matchScore ?? 0} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="overflow-hidden lg:col-span-3">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-[340px] w-full object-cover"
            />
            <div className="p-6">
              <div className="text-xl font-semibold tracking-tight">{item.title}</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </div>

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
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
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
            </div>
          </Card>

          <div className="lg:col-span-2">
            {insights ? (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Match insights</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Based on tags, category, and location.
                    </div>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                  {insights.reasons.slice(0, 3).map((r) => (
                    <div key={r} className="rounded-xl bg-slate-100/70 px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                      {r}
                    </div>
                  ))}
                </div>

                {insights.matchingTags.length ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Matching tags
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {insights.matchingTags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Claim this item</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Submit proof details to start the claim process.
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              {!token ? (
                <div className="mt-5 rounded-2xl bg-slate-100/70 p-4 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700">
                  Please login to submit a claim.
                  <div className="mt-3">
                    <Button asChild>
                      <Link to="/login">
                        Login <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  className="mt-5 grid gap-4"
                  onSubmit={handleSubmit(() => {
                    submitClaim(item)
                    setSubmitted(true)
                  })}
                >
                  {submitted ? (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800">
                      <div className="inline-flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Claim submitted
                      </div>
                      <div className="mt-2 text-sm">
                        Track status in your dashboard.
                      </div>
                      <div className="mt-3">
                        <Button asChild variant="secondary">
                          <Link to="/dashboard">Open Dashboard</Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="text-sm font-medium">Full name</label>
                    <div className="mt-2">
                      <Input {...register('fullName')} placeholder="Your name" />
                      {errors.fullName ? (
                        <div className="mt-1 text-xs text-rose-600">
                          {errors.fullName.message}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Proof details</label>
                    <div className="mt-2">
                      <Textarea
                        {...register('details')}
                        placeholder="Describe proof: serial number, unique marks, where it was last used..."
                      />
                      {errors.details ? (
                        <div className="mt-1 text-xs text-rose-600">
                          {errors.details.message}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <FileUploadField label="Upload proof image" onChange={setFile} />
                  {file ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Proof selected.
                    </div>
                  ) : null}

                  <Button type="submit" disabled={isSubmitting}>
                    Submit claim
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </PageTransition>
  )
}
