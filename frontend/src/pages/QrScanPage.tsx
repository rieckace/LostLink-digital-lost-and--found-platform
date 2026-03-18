import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Container } from '../layouts/Container'
import { resolveApiBase } from '../lib/apiBase'

type PublicAsset = {
  id: string
  name: string
  category: string
  description?: string
  qrToken: string
}

export function QrScanPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [asset, setAsset] = useState<PublicAsset | null>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const run = async () => {
      setError(null)
      setLoading(true)
      try {
        if (!token) throw new Error('Invalid QR')
        const API_URL = await resolveApiBase()
        const res = await fetch(`${API_URL}/assets/public/${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'QR not recognized')
        setAsset(data?.asset ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load QR')
        setAsset(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [token])

  const notifyOwner = async () => {
    if (!token) return
    setSending(true)
    setError(null)
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/assets/public/${encodeURIComponent(token)}/found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLabel: locationLabel.trim() ? locationLabel.trim() : undefined,
          note: note.trim() ? note.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to notify owner')
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to notify owner')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageTransition>
      <Container className="py-10">
        <h1 className="text-2xl font-semibold tracking-tight">QR scan</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          If you found this item, notify the owner.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold">Item</div>
            <div className="mt-4">
              {loading ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
              ) : asset ? (
                <div>
                  <div className="text-lg font-semibold">{asset.name}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{asset.category}</div>
                  {asset.description ? (
                    <div className="mt-3 text-sm text-slate-700 dark:text-slate-200">{asset.description}</div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">QR not recognized.</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">Notify owner</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Share where you found it and any details.
            </div>

            {sent ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800">
                Owner notified successfully.
              </div>
            ) : null}

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-medium">Found location (optional)</label>
                <div className="mt-2">
                  <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="e.g., Library reception" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Note (optional)</label>
                <div className="mt-2">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any useful info to help the owner confirm." />
                </div>
              </div>
              <Button type="button" onClick={notifyOwner} disabled={sending || !asset}>
                {sending ? 'Sending…' : 'Notify owner'}
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </PageTransition>
  )
}
