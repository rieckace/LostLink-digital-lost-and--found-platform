import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../lib/types'

type AuthState = {
  token: string | null
  user: User | null
  login: (email: string, _password: string) => void
  signup: (name: string, email: string, _password: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (email) => {
        set({
          token: `demo.jwt.${btoa(email)}`,
          user: { id: 'u_demo', name: email.split('@')[0] ?? 'User', email },
        })
      },
      signup: (name, email) => {
        set({ token: `demo.jwt.${btoa(email)}`, user: { id: 'u_demo', name, email } })
      },
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'lostlink-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
)
