import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Container } from '../layouts/Container'
import { resolveApiBase } from '../lib/apiBase'
import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'

type Asset = {
  id: string
  name: string
  category: string
  description?: string
  qrToken: string
  createdAt?: string
}

export function MyAssetsPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (user?.role === 'admin') return <Navigate to="/admin/claims" replace />

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const assetUrlBase = useMemo(() => {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }, [])

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/assets/my`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load assets')
      setAssets(Array.isArray(data?.assets) ? data.assets : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = async () => {
    if (!name.trim() || !category.trim()) {
      setError('Name and category are required')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          description: description.trim() ? description.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create asset')

      setName('')
      setCategory('')
      setDescription('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create asset')
    } finally {
      setCreating(false)
    }
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My QR tags</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Register valuables and generate a QR sticker. If someone scans it, you get notified.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold">Register an asset</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Example: Laptop, ID card, Camera.
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <div className="mt-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Dell Inspiron Laptop" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="mt-2">
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Electronics" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <div className="mt-2">
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any identifying details (do not include OTP/passwords)." />
                </div>
              </div>
              <Button type="button" onClick={create} disabled={creating}>
                {creating ? 'Creating…' : 'Generate QR'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Your tags</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {loading ? 'Loading…' : `${assets.length} asset(s)`}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {assets.map((a) => {
                const url = `${assetUrlBase}/qr/${a.qrToken}`
                return (
                  <div key={a.id} className="rounded-2xl bg-slate-100/70 p-4 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{a.name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.category}</div>
                        {a.description ? (
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">{a.description}</div>
                        ) : null}
                        <div className="mt-2 text-[11px] break-all text-slate-500 dark:text-slate-400">{url}</div>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                        <QRCodeCanvas value={url} size={120} includeMargin />
                      </div>
                    </div>
                  </div>
                )
              })}

              {!loading && assets.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  No QR tags yet. Register your first asset.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </Container>
    </PageTransition>
  )
}
