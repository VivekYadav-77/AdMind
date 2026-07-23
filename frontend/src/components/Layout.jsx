import { History, LayoutDashboard, LogOut, Settings, ChevronDown, Plus, Wrench, GitCompare, Moon, Sun } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { API } from '../services/api'
import clsx from 'clsx'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    localStorage.getItem('activeWorkspaceId') || null
  )
  const [showDropdown, setShowDropdown] = useState(false)
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

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const data = await API.getWorkspaces()
        setWorkspaces(data)
        if (data.length > 0 && !activeWorkspaceId) {
          handleWorkspaceChange(data[0].id)
        }
      } catch (e) {
        console.error("Failed to load workspaces", e)
      }
    }
    loadWorkspaces()
  }, [])

  const handleWorkspaceChange = (id) => {
    setActiveWorkspaceId(id)
    localStorage.setItem('activeWorkspaceId', id.toString())
    setShowDropdown(false)
    // Optional: reload the page or trigger a context update to refresh data
    window.location.reload()
  }

  const handleNewWorkspace = async () => {
    const name = prompt("Enter new workspace name:")
    if (name) {
      try {
        const newWs = await API.createWorkspace(name)
        setWorkspaces([...workspaces, newWs])
        handleWorkspaceChange(newWs.id)
      } catch (e) {
        alert("Failed to create workspace")
      }
    }
  }

  const activeWorkspace = workspaces.find(w => w.id.toString() === activeWorkspaceId?.toString())

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'AI Tools', path: '/tools', icon: Wrench },
    { name: 'A/B Tracker', path: '/ab-tracker', icon: GitCompare },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  return (
    <div className="flex min-h-screen bg-bgbase text-textprimary font-sans selection:bg-brand-500/30 transition-colors duration-300" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <div className="grain-overlay print:hidden" />
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 dark:bg-brand-900/40 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-400/10 dark:bg-[#4A2518]/30 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col glass m-4 rounded-3xl z-10 relative overflow-hidden shadow-2xl border border-borderwarm print:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bgpanelhover/50 to-transparent pointer-events-none" />
        <div className="flex h-24 items-center px-8 border-b border-borderwarm relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white shadow-[0_0_15px_rgba(217,119,87,0.4)]">
              A
            </div>
            <span className="text-2xl font-serif tracking-tight text-textprimary glow-text">AdMind</span>
          </div>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2 relative z-10">
          {navItems.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-brand-500/10 text-brand-500 dark:text-brand-400 border-l-2 border-brand-500 shadow-[0_0_15px_rgba(217,119,87,0.05)]"
                    : "text-textmuted hover:bg-bgpanelhover hover:text-textprimary"
                )}
              >
                <item.icon size={18} className={clsx(isActive ? "text-brand-500 dark:text-brand-400" : "text-textmuted")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-borderwarm relative z-10 flex flex-col gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-textmuted hover:bg-bgpanelhover hover:text-textprimary transition-all duration-300 group"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-textmuted group-hover:text-brand-400 transition-colors" />
            ) : (
              <Moon size={18} className="text-textmuted group-hover:text-brand-500 transition-colors" />
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-textmuted hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={18} className="text-textmuted group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 print:h-auto print:overflow-visible print:block">
        <header className="h-24 flex items-center justify-between px-10 shrink-0 print:hidden">
          <h1 className="text-2xl font-serif text-textprimary tracking-tight">
            {location.pathname === '/' 
              ? 'Campaign Dashboard' 
              : location.pathname.startsWith('/history/')
              ? 'Detailed Analysis Report'
              : location.pathname === '/history'
              ? 'Analysis History'
              : location.pathname.startsWith('/tools')
              ? 'AI Marketing Tools'
              : location.pathname === '/settings'
              ? 'System Settings'
              : 'Overview'}
          </h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-bgpanelhover hover:bg-bgpanel border border-borderwarm px-4 py-2.5 rounded-xl text-sm font-medium text-textprimary transition-colors"
            >
              {activeWorkspace ? activeWorkspace.name : 'Loading...'}
              <ChevronDown size={16} className="text-textmuted" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-bgpanel border border-borderwarm rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-2 space-y-1">
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => handleWorkspaceChange(ws.id)}
                      className={clsx(
                        "w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors",
                        activeWorkspaceId?.toString() === ws.id.toString() 
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium" 
                          : "text-textmuted hover:bg-bgpanelhover"
                      )}
                    >
                      {ws.name}
                    </button>
                  ))}
                  <div className="h-px bg-borderwarm my-2" />
                  <button
                    onClick={handleNewWorkspace}
                    className="w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-xl text-sm text-textmuted hover:bg-bgpanelhover transition-colors"
                  >
                    <Plus size={16} /> New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="p-10 pt-0 max-w-7xl mx-auto w-full h-full overflow-auto print:p-0 print:h-auto print:overflow-visible print:max-w-none print:block">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
