import { LayoutDashboard, Users, BarChart3, Star, Briefcase, Activity, LogOut, Moon, Sun, ArrowLeft, MessageSquare, Mail } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Logo from './Logo'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analysis Jobs', path: '/admin/jobs', icon: BarChart3 },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Workspaces', path: '/admin/workspaces', icon: Briefcase },
    { name: 'Tickets', path: '/admin/tickets', icon: MessageSquare },
    { name: 'Activity Log', path: '/admin/activity', icon: Activity },
    { name: 'Email Analytics', path: '/admin/email-analytics', icon: Mail },
  ]

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'A'

  return (
    <div className="relative flex min-h-screen bg-bgbase text-textprimary font-sans selection:bg-orange-500/30 transition-colors duration-300">
      
      {/* Background Blobs (Orange/Red accent for Admin) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="landing-blob bg-orange-500/20 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
        <div className="landing-blob bg-red-500/10 w-[500px] h-[500px] bottom-[10%] right-[-10%]" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="grain-overlay" />

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-bgpanel/80 backdrop-blur-xl border-r border-borderwarm z-10 relative">
        <div className="flex h-20 items-center px-6 border-b border-borderwarm">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold tracking-tight text-textprimary">Admin</span>
            <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full font-bold ml-1">PRO</span>
          </div>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2 relative z-10 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border-l-2 border-orange-500"
                    : "text-textmuted hover:bg-bgpanelhover hover:text-textprimary border-l-2 border-transparent"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-orange-600 dark:text-orange-400" : "text-textmuted group-hover:text-textprimary transition-colors")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-borderwarm">
          <Link to="/app" className="flex items-center gap-2 text-sm text-textmuted hover:text-textprimary transition-colors mb-4 px-2">
            <ArrowLeft size={16} /> Back to User App
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors px-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-borderwarm/50 bg-bgbase/50 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-textprimary tracking-tight">
              {navItems.find(item => 
                 item.path === '/admin' 
                   ? location.pathname === '/admin' 
                   : location.pathname.startsWith(item.path)
              )?.name || 'Admin Panel'}
            </h1>
            <p className="text-sm text-textmuted">Superadmin Control Center</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-bgpanelhover hover:bg-bgpanel border border-borderwarm text-textmuted hover:text-textprimary transition-all duration-300"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-3 bg-bgpanel border border-borderwarm px-4 py-2 rounded-xl">
              <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                {userInitial}
              </div>
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
