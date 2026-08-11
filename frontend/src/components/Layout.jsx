import { History, LayoutDashboard, LogOut, Settings, ChevronDown, Plus, Wrench, FlaskConical, Zap, Sun, Moon, MessageSquare, Menu, X } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from './ui/Modal'
import AnimatedBackground from './AnimatedBackground'
import Logo from './Logo'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user, isAdmin } = useAuth()
  const { workspaces, activeWorkspace, changeWorkspace, createWorkspace } = useWorkspace()

  const [showWsDropdown, setShowWsDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const wsDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target)) {
        setShowWsDropdown(false)
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
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Analyze', path: '/app/analyze', icon: Zap },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'AI Tools', path: '/app/tools', icon: Wrench },
    { name: 'A/B Tracker', path: '/app/tests', icon: FlaskConical },
    { name: 'Community', path: '/community', icon: MessageSquare },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ]

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative flex flex-col min-h-screen bg-bgbase text-textprimary font-sans selection:bg-brand-500/30 transition-colors duration-300" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Background Blobs matching the landing page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="landing-blob bg-brand-500/20 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
        <div className="landing-blob bg-purple-500/10 w-[500px] h-[500px] bottom-[10%] right-[-10%]" style={{ animationDelay: '-5s' }} />
        <div className="landing-blob bg-blue-500/10 w-[400px] h-[400px] top-[40%] left-[40%]" style={{ animationDelay: '-10s' }} />
      </div>

      <AnimatedBackground density="low" showKite={false} />
      <div className="grain-overlay print:hidden" />
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-bgpanel/80 backdrop-blur-md border-b border-borderwarm print:hidden transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8 text-brand-500" />
              <span className="text-xl font-bold tracking-tight text-textprimary hidden sm:block">AdMind</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-center px-4 xl:px-8 overflow-hidden">
              <div className="flex space-x-1 lg:space-x-2">
                {navItems.map((item) => {
                  const isActive = item.path === '/app' 
                    ? location.pathname === '/app' 
                    : location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                          : "text-textmuted hover:bg-bgpanelhover hover:text-textprimary"
                      )}
                    >
                      <item.icon size={16} className={clsx(isActive ? "text-brand-600 dark:text-brand-400" : "text-textmuted")} />
                      <span className="hidden xl:inline">{item.name}</span>
                      {/* Show icon only on smaller desktop screens to save space if needed, or hide text for some */}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-bgpanelhover hover:bg-bgpanel border border-borderwarm text-textmuted hover:text-textprimary transition-all duration-300"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="relative" ref={wsDropdownRef}>
                <button 
                  onClick={() => setShowWsDropdown(!showWsDropdown)}
                  className="flex items-center gap-2 bg-bgpanelhover hover:bg-bgpanel border border-borderwarm px-4 py-2 rounded-xl text-sm font-medium text-textprimary transition-colors"
                >
                  <span className="truncate max-w-[120px]">{activeWorkspace ? activeWorkspace.name : 'Loading...'}</span>
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

              <div>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate('/app/settings')
                    setShowWsDropdown(false)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bgpanel border border-borderwarm font-bold text-textprimary hover:bg-bgpanelhover transition-colors"
                  title="Go to Settings"
                >
                  {userInitial}
                </motion.button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-textmuted hover:text-textprimary"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-textmuted hover:text-textprimary bg-bgpanelhover transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-bgpanel border-b border-borderwarm overflow-hidden shadow-lg"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = item.path === '/app' 
                    ? location.pathname === '/app' 
                    : location.pathname.startsWith(item.path)
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                        isActive
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                          : "text-textmuted hover:bg-bgpanelhover hover:text-textprimary"
                      )}
                    >
                      <item.icon size={18} className={clsx(isActive ? "text-brand-600 dark:text-brand-400" : "text-textmuted")} />
                      {item.name}
                    </Link>
                  )
                })}
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="h-px bg-borderwarm my-2" />
                
                {/* Mobile Workspace Selection */}
                <div className="px-4 py-2">
                  <div className="text-xs font-semibold text-textmuted uppercase tracking-wider mb-2">Workspace</div>
                  <div className="flex flex-wrap gap-2">
                    {workspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          changeWorkspace(ws.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors border",
                          activeWorkspace?.id === ws.id
                            ? "bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400" 
                            : "bg-bgbase border-borderwarm text-textmuted"
                        )}
                      >
                        {ws.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowNewWsModal(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm transition-colors border border-dashed border-borderwarm text-textmuted hover:text-textprimary flex items-center gap-1"
                    >
                      <Plus size={14} /> New
                    </button>
                  </div>
                </div>
                
                <div className="h-px bg-borderwarm my-2" />
                
                <Link
                  to="/app/settings"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-textmuted hover:bg-bgpanelhover hover:text-textprimary"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bgbase border border-borderwarm font-bold text-xs text-textprimary">
                    {userInitial}
                  </div>
                  Account Settings
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex-1 print:p-0 print:block overflow-auto">
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
