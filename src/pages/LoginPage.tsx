import { Navigate } from 'react-router-dom'

import LoginForm from '@/components/LoginForm'
import { useAuthStore } from '@/store/authStore'

function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8">
      <LoginForm />
    </main>
  )
}

export default LoginPage
