import { History, LayoutDashboard, LogOut, Settings, ChevronDown, Plus, Wrench, FlaskConical } from 'lucide-react'
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
    { name: 'A/B Tracker', path: '/tests', icon: FlaskConical },
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
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)
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
        <header className="h-24 flex items-center justify-between px-10 shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {location.pathname === '/' 
              ? 'Campaign Dashboard' 
              : location.pathname.startsWith('/history/')
              ? 'Detailed Analysis Report'
              : location.pathname === '/history'
              ? 'Analysis History'
              : location.pathname.startsWith('/tools')
              ? 'AI Marketing Tools'
              : location.pathname.startsWith('/tests')
              ? 'A/B Test Tracking'
              : location.pathname === '/settings'
              ? 'System Settings'
              : 'Overview'}
          </h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              {activeWorkspace ? activeWorkspace.name : 'Loading...'}
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111625] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-2 space-y-1">
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => handleWorkspaceChange(ws.id)}
                      className={clsx(
                        "w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors",
                        activeWorkspaceId?.toString() === ws.id.toString() 
                          ? "bg-blue-600/20 text-blue-400 font-bold" 
                          : "text-slate-300 hover:bg-white/5"
                      )}
                    >
                      {ws.name}
                    </button>
                  ))}
                  <div className="h-px bg-white/10 my-2" />
                  <button
                    onClick={handleNewWorkspace}
                    className="w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <Plus size={16} /> New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="p-10 pt-0 max-w-7xl mx-auto w-full h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
