import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('demo@bank.com')
  const [password, setPassword] = useState('1234')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      return
    }

    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
      '/dashboard'

    login(email, password)
    navigate(redirectTo, { replace: true })
  }

  return (
    <Card className="w-full max-w-md rounded-2xl p-8 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Secure Login
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400"
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Login
        </Button>
      </form>
    </Card>
  )
}

export default LoginForm
