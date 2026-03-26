import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type User = {
  name: string
  email: string
}

type AuthState = {
  isAuthenticated: boolean
  user: User
  login: (email: string, password: string) => void
  logout: () => void
}

const initialUser: User = {
  name: '',
  email: '',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: initialUser,
      login: (email, password) => {
        const normalizedEmail = email.trim()
        const normalizedPassword = password.trim()

        if (!normalizedEmail || !normalizedPassword) {
          return
        }

        const name = normalizedEmail.split('@')[0] || 'User'

        set({
          isAuthenticated: true,
          user: {
            name,
            email: normalizedEmail,
          },
        })
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: initialUser,
        })
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
