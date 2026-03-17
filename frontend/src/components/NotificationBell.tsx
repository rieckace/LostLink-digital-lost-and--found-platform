import { Bell } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import { formatDateShort } from '../lib/format'
import { cn } from '../lib/cn'
import { useNotificationStore } from '../stores/notificationStore'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useClickOutside(ref, () => setOpen(false), open)

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount())
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime(),
      ),
    [notifications],
  )

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative h-10 w-10 rounded-xl p-0"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <Card className="absolute right-0 z-50 mt-2 w-[360px] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Notifications</div>
            <button
              type="button"
              className={cn(
                'text-xs font-medium text-slate-600 hover:text-slate-900',
                'dark:text-slate-300 dark:hover:text-white',
              )}
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {sorted.length === 0 ? (
              <div className="rounded-xl bg-slate-100/70 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                You’re all caught up.
              </div>
            ) : (
              sorted.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    'w-full rounded-xl p-3 text-left transition-colors',
                    'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{n.title}</div>
                        {!n.read ? <Badge tone="info">New</Badge> : null}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {n.message}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      {formatDateShort(n.createdAtISO)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
