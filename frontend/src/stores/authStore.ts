import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../lib/types'
import { resolveApiBase } from '../lib/apiBase'

type AuthState = {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  hydrateUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: async (email, password) => {
        const API_URL = await resolveApiBase()
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to login')
        set({ token: data.token, user: { ...data.user, role: data.user?.role ?? 'user' } })
      },
      signup: async (name, email, password) => {
        const API_URL = await resolveApiBase()
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to sign up')
        set({ token: data.token, user: { ...data.user, role: data.user?.role ?? 'user' } })
      },
      logout: () => set({ token: null, user: null }),
      hydrateUser: async () => {
        const { token } = get()
        if (!token) return
        try {
          const API_URL = await resolveApiBase()
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            set({ user: { ...data.user, role: data.user?.role ?? 'user' } })
          } else {
            set({ token: null, user: null })
          }
        } catch {
          set({ token: null, user: null })
        }
      }
    }),
    {
      name: 'lostlink-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
)
