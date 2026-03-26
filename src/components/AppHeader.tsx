import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

type AppHeaderProps = {
  title: string
}

function AppHeader({ title }: AppHeaderProps) {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <Button
        type="button"
        variant="outline"
        className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </header>
  )
}

export default AppHeader
