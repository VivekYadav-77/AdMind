import { History, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass-panel m-4 rounded-3xl z-10 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="flex h-24 items-center px-8 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              A
            </div>
            <span className="text-xl font-black tracking-tight text-white glow-text">AdMind</span>
          </div>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2 relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-blue-400" : "text-slate-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 relative z-10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        <header className="h-24 flex items-center px-10 shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {location.pathname === '/' ? 'Overview' : location.pathname.substring(1)}
          </h1>
        </header>
        <div className="p-10 pt-0 max-w-7xl mx-auto w-full h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
