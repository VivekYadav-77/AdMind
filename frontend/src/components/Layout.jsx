import { History, LayoutDashboard, Settings } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md">
              A
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">AdMind</span>
          </div>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 flex items-center px-8 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
          </h1>
        </div>
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
