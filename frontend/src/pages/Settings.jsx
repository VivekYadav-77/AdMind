import { useState, useEffect } from 'react'
import { KeyRound, Check, AlertCircle, Briefcase, Wifi, WifiOff, LogOut, MessageSquare, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { API } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordStatus, setPasswordStatus] = useState(null) // { type: 'success'|'error', message: '' }
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [branding, setBranding] = useState(() => ({
    agencyName: localStorage.getItem('agencyName') || '',
    logoUrl: localStorage.getItem('logoUrl') || ''
  }))
  const [brandingSaved, setBrandingSaved] = useState(false)

  const [apiStatus, setApiStatus] = useState('checking')

  const memberSince = (() => {
    if (user?.iat) {
      return new Date(user.iat * 1000).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }
    return 'N/A'
  })()

  useEffect(() => {
    let cancelled = false
    const checkApiStatus = async () => {
      try {
        await API.getWorkspaces()
        if (!cancelled) setApiStatus('online')
      } catch {
        if (!cancelled) setApiStatus('offline')
      }
    }
    checkApiStatus()
    return () => { cancelled = true }
  }, [])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All password fields are required.' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' })
      return
    }
    setPasswordLoading(true)
    setPasswordStatus(null)
    try {
      await API.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordStatus(null), 4000)
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveBranding = () => {
    localStorage.setItem('agencyName', branding.agencyName)
    localStorage.setItem('logoUrl', branding.logoUrl)
    setBrandingSaved(true)
    setTimeout(() => setBrandingSaved(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textprimary tracking-tight mb-2">System Settings</h1>
        <p className="text-textmuted font-medium">Manage your account and preferences</p>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        
        {/* Left: Profile Card */}
        <div className="space-y-6">
          <div className="bg-bgpanel rounded-2xl p-6 border border-borderwarm shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 text-3xl font-bold shadow-sm border border-brand-100 dark:border-brand-500/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-bgpanel transition-colors ${
                apiStatus === 'online' ? 'bg-emerald-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
              }`} />
            </div>

            <h2 className="text-xl font-bold text-textprimary tracking-tight truncate w-full px-2" title={user?.name || user?.email || 'User Account'}>
              {user?.name || user?.email || 'User Account'}
            </h2>

            <div className="mt-6 pt-6 border-t border-borderwarm w-full space-y-3 text-left text-sm">
              
              
              <div className="flex justify-between items-center">
                <span className="text-textmuted">API Status</span>
                {apiStatus === 'checking' && (
                  <span className="text-amber-400 font-medium flex items-center gap-1.5 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                    Checking
                  </span>
                )}
                {apiStatus === 'online' && (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-xs">
                    <Wifi size={12} />
                    Connected
                  </span>
                )}
                {apiStatus === 'offline' && (
                  <span className="text-red-400 font-medium flex items-center gap-1.5 text-xs">
                    <WifiOff size={12} />
                    Unreachable
                  </span>
                )}
              </div>
              <div className="pt-3">
                <p className="text-[11px] text-textmuted leading-relaxed mb-4">
                  Your connection is encrypted. Never share your credentials with anyone.
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors font-medium border border-red-500/20"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings Sections */}
        <div className="space-y-6">

          {/* White-Label Reporting */}
          <div className="bg-bgpanel rounded-2xl p-8 border border-borderwarm shadow-sm">
            <h3 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-brand-500" />
              White-Label Reporting
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Agency Name</label>
                <input
                  type="text"
                  value={branding.agencyName}
                  onChange={(e) => setBranding(prev => ({ ...prev, agencyName: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="e.g., Apex Growth Agency"
                />
                <span className="text-[11px] text-textmuted mt-1.5 block">Appears on exported PDF reports.</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="https://example.com/logo.png"
                />
                <span className="text-[11px] text-textmuted mt-1.5 block">Image URL for PDF reports.</span>
              </div>

              <div className="flex items-center justify-between border-t border-borderwarm pt-6 mt-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveBranding}
                  className="btn-primary"
                >
                  Save Branding
                </motion.button>
                {brandingSaved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-brand-500 font-bold text-sm flex items-center gap-1"
                  >
                    <Check size={16} /> Saved Successfully
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-bgpanel rounded-2xl p-8 border border-borderwarm shadow-sm">
            <h3 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
              <KeyRound size={20} className="text-brand-500" />
              Update Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {passwordStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 text-xs font-semibold ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {passwordStatus.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {passwordStatus.message}
                  </span>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-textsecondary mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textsecondary mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-borderwarm mt-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Updating…' : 'Update Credentials'}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Share Feedback / Community */}
          <div className="bg-bgpanel rounded-2xl p-8 border border-borderwarm shadow-sm">
            <h3 className="text-lg font-bold text-textprimary mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-500" />
              Community & Feedback
            </h3>
            <p className="text-sm text-textmuted mb-6 leading-relaxed">
              Help us improve and let other marketers know how AdMind has impacted your campaigns. Your feedback means the world to us!
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/community')}
                className="btn-secondary px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
              >
                <Star size={16} className="text-amber-400" fill="currentColor" />
                Write a Review
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
