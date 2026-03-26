import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/onboarding', label: 'Onboarding', icon: CheckCircle2 },
  { to: '/approval', label: 'Approval', icon: ShieldCheck },
]

const pageTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/onboarding': 'Onboarding',
  '/approval': 'Approval',
}

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/approval/')) {
      return 'Approval Case'
    }

    return pageTitleMap[location.pathname] ?? 'Dashboard'
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 h-screen self-start overflow-y-auto border-r border-slate-200/80 bg-white/90 px-4 py-5 backdrop-blur transition-all duration-200',
            isCollapsed ? 'w-20' : 'w-64',
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Collateral Suite
              </p>
            </div>
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setIsCollapsed((current) => !current)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-slate-900 text-white shadow-[0_6px_16px_rgba(15,23,42,0.18)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  <Icon size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 px-6 py-4 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
