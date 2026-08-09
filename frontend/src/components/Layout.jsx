import { History, LayoutDashboard, LogOut, Settings, ChevronDown, Plus, Wrench, FlaskConical, Zap, Sun, Moon } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Modal from './ui/Modal'
import AnimatedBackground from './AnimatedBackground'
import Logo from './Logo'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { workspaces, activeWorkspace, changeWorkspace, createWorkspace } = useWorkspace()

  const [showWsDropdown, setShowWsDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const wsDropdownRef = useRef(null)
  const userDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target)) {
        setShowWsDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const [showNewWsModal, setShowNewWsModal] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [isSubmittingWs, setIsSubmittingWs] = useState(false)

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

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    setIsSubmittingWs(true)
    try {
      await createWorkspace(newWsName)
      setShowNewWsModal(false)
      setNewWsName('')
      setShowWsDropdown(false)
    } catch (err) {
      // Toast is handled in context
    } finally {
      setIsSubmittingWs(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Analyze', path: '/app/analyze', icon: Zap },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'AI Tools', path: '/app/tools', icon: Wrench },
    { name: 'A/B Tracker', path: '/app/tests', icon: FlaskConical },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ]

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative flex min-h-screen bg-bgbase text-textprimary font-sans selection:bg-brand-500/30 transition-colors duration-300" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Background Blobs matching the landing page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="landing-blob bg-brand-500/20 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
        <div className="landing-blob bg-purple-500/10 w-[500px] h-[500px] bottom-[10%] right-[-10%]" style={{ animationDelay: '-5s' }} />
        <div className="landing-blob bg-blue-500/10 w-[400px] h-[400px] top-[40%] left-[40%]" style={{ animationDelay: '-10s' }} />
      </div>

      <AnimatedBackground density="low" showKite={false} />
      <div className="grain-overlay print:hidden" />
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-bgpanel border-r border-borderwarm z-10 relative print:hidden">
        <div className="flex h-20 items-center px-6 border-b border-borderwarm relative z-10">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-brand-500" />
            <span className="text-xl font-bold tracking-tight text-textprimary">AdMind</span>
          </div>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2 relative z-10">
          {navItems.map((item) => {
            const isActive = item.path === '/app' 
              ? location.pathname === '/app' 
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                    : "text-textmuted hover:bg-bgpanelhover hover:text-textprimary"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-brand-600 dark:text-brand-400" : "text-textmuted group-hover:text-textprimary transition-colors")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        <header className="h-24 flex items-center justify-between px-10 shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {location.pathname === '/app' 
              ? 'Campaign Dashboard' 
              : location.pathname.startsWith('/app/history/')
              ? 'Detailed Analysis Report'
              : location.pathname === '/app/history'
              ? 'Analysis History'
              : location.pathname.startsWith('/app/tools')
              ? 'AI Marketing Tools'
              : location.pathname.startsWith('/app/tests')
              ? 'A/B Test Tracking'
              : location.pathname === '/app/settings'
              ? 'System Settings'
              : 'Overview'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-bgpanelhover hover:bg-bgpanel border border-borderwarm text-textmuted hover:text-textprimary transition-all duration-300"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={wsDropdownRef}>
              <button 
                onClick={() => { setShowWsDropdown(!showWsDropdown); setShowUserDropdown(false) }}
                className="flex items-center gap-2 bg-bgpanelhover hover:bg-bgpanel border border-borderwarm px-4 py-2.5 rounded-xl text-sm font-medium text-textprimary transition-colors"
              >
                {activeWorkspace ? activeWorkspace.name : 'Loading...'}
                <ChevronDown size={16} className="text-textmuted" />
              </button>
              
              {showWsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-bgpanel border border-borderwarm rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    {workspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          changeWorkspace(ws.id)
                          setShowWsDropdown(false)
                        }}
                        className={clsx(
                          "w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors",
                          activeWorkspace?.id === ws.id
                            ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium" 
                            : "text-textmuted hover:bg-bgpanelhover"
                        )}
                      >
                        {ws.name}
                      </button>
                    ))}
                    <div className="h-px bg-borderwarm my-2" />
                    <button
                      onClick={() => setShowNewWsModal(true)}
                      className="w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-xl text-sm text-textmuted hover:bg-bgpanelhover transition-colors"
                    >
                      <Plus size={16} /> New Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userDropdownRef}>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowUserDropdown(!showUserDropdown); setShowWsDropdown(false) }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-bgpanel border border-borderwarm font-bold text-textprimary hover:bg-bgpanelhover transition-colors"
              >
                {userInitial}
              </motion.button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-bgpanel border border-borderwarm rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-borderwarm">
                    <p className="text-sm font-bold text-textprimary truncate">{user?.email || 'User'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full h-full overflow-auto print:p-0 print:h-auto print:overflow-visible print:max-w-none print:block">
          <Outlet />
        </div>
      </main>

      <Modal isOpen={showNewWsModal} onClose={() => setShowNewWsModal(false)} title="Create Workspace">
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-textsecondary mb-1">Workspace Name</label>
            <input
              type="text"
              required
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Apex Agency"
              className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowNewWsModal(false)}
              className="px-4 py-2 text-sm font-medium text-textmuted hover:text-textprimary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingWs || !newWsName.trim()}
              className="btn-primary"
            >
              {isSubmittingWs ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
