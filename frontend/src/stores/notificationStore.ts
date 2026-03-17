import { create } from 'zustand'

export type Notification = {
  id: string
  title: string
  message: string
  createdAtISO: string
  read: boolean
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: () => number
  markRead: (id: string) => void
  markAllRead: () => void
}

const seed: Notification[] = [
  {
    id: 'n_1',
    title: 'Potential match found',
    message: 'A found item matches your "Grey Backpack" report (85%).',
    createdAtISO: '2026-03-12',
    read: false,
  },
  {
    id: 'n_2',
    title: 'Claim update',
    message: 'Your claim is pending review. We’ll notify you soon.',
    createdAtISO: '2026-03-11',
    read: false,
  },
  {
    id: 'n_3',
    title: 'Tip',
    message: 'Add more tags to improve match accuracy.',
    createdAtISO: '2026-03-08',
    read: true,
  },
]

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: seed,
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  markRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }),
  markAllRead: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),
}))
