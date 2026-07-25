import { useState, useEffect } from 'react'
import { Shield, Cpu, KeyRound, Check, AlertCircle, Briefcase, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { API } from '../services/api'

export default function Settings() {
  const { user } = useAuth()

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [aiSettings, setAiSettings] = useState(() => ({
    model: localStorage.getItem('ai_model') || 'gemini-1.5-pro',
    temperature: parseFloat(localStorage.getItem('ai_temperature')) || 0.2,
  }))

  const [thresholds, setThresholds] = useState(() => ({
    wasteAlertPercent: parseInt(localStorage.getItem('threshold_wasteAlert')) || 15,
    minRoasTarget: parseFloat(localStorage.getItem('threshold_minRoas')) || 2.5
  }))

  const [passwordStatus, setPasswordStatus] = useState(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

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

  const handleSaveSettings = () => {
    localStorage.setItem('ai_model', aiSettings.model)
    localStorage.setItem('ai_temperature', aiSettings.temperature.toString())
    localStorage.setItem('threshold_wasteAlert', thresholds.wasteAlertPercent.toString())
    localStorage.setItem('threshold_minRoas', thresholds.minRoasTarget.toString())
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
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
        <p className="text-textmuted font-medium">Configure your AdMind experience</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {/* Left: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-bgpanel rounded-2xl p-6 border border-borderwarm shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 text-3xl font-bold shadow-sm border border-brand-100 dark:border-brand-500/20">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-4 border-bgpanel transition-colors ${
                apiStatus === 'online' ? 'bg-emerald-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
              }`} />
            </div>

            <h2 className="text-xl font-bold text-textprimary tracking-tight">{user?.email || 'User Account'}</h2>

            <div className="mt-6 pt-6 border-t border-borderwarm w-full space-y-3 text-left text-sm">
              <div className="flex justify-between items-center">
                <span className="text-textmuted">Member Since</span>
                <span className="text-textsecondary font-medium">{memberSince}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-textmuted">Plan</span>
                <span className="text-textmuted font-medium bg-white/5 px-2 py-0.5 rounded-md text-xs border border-borderwarm">Free Plan</span>
              </div>
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
            </div>
          </div>

          <div className="bg-bgpanel rounded-2xl p-6 border border-borderwarm shadow-sm">
            <h3 className="text-base font-bold text-textprimary mb-4 flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              Security Information
            </h3>
            <p className="text-xs text-textmuted leading-relaxed">
              Your connection is encrypted using SSL, and tokens are safely stored in your local security scope. Never share your authorization tokens or credentials with anyone.
            </p>
          </div>
        </div>

        {/* Right: App Settings */}
        <div className="md:col-span-2 space-y-6">

          {/* AI Configurations */}
          <div className="bg-bgpanel rounded-2xl p-8 border border-borderwarm shadow-sm">
            <h3 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-amber-400" />
              AI Analysis Configurations
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-2">Gemini Analysis Model</label>
                <select
                  value={aiSettings.model}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Default - High Speed)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Precision Analytics)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Advanced Performance)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-textsecondary mb-2">
                  <label>LLM Creativity (Temperature)</label>
                  <span className="text-amber-400 font-bold">{aiSettings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiSettings.temperature}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-brand-500 bg-white/5 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-textmuted mt-1 block">Lower values ensure structured strategy recommendations, while higher values generate creative ad copywriting variations.</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-borderwarm pt-6">
                <div>
                  <label className="block text-sm font-semibold text-textsecondary mb-2">Budget Waste Threshold</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={thresholds.wasteAlertPercent}
                      onChange={(e) => setThresholds(prev => ({ ...prev, wasteAlertPercent: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                    <span className="text-textmuted font-bold text-sm">%</span>
                  </div>
                  <span className="text-[10px] text-textmuted mt-1 block">Highlight keywords wasting more than this budget ratio.</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textsecondary mb-2">Target ROAS Warning</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10"
                      value={thresholds.minRoasTarget}
                      onChange={(e) => setThresholds(prev => ({ ...prev, minRoasTarget: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                    <span className="text-textmuted font-bold text-sm">x</span>
                  </div>
                  <span className="text-[10px] text-textmuted mt-1 block">Flags campaigns yielding lower target returns.</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-borderwarm pt-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveSettings}
                  className="btn-primary flex items-center gap-2"
                >
                  Save Configurations
                </motion.button>
                {settingsSaved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1"
                  >
                    <Check size={16} /> Saved Successfully
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* White-Label Reporting */}
          <div className="bg-bgpanel rounded-2xl p-8 border border-borderwarm shadow-sm">
            <h3 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-emerald-400" />
              White-Label Reporting
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Agency Name</label>
                <input
                  type="text"
                  value={branding.agencyName}
                  onChange={(e) => setBranding(prev => ({ ...prev, agencyName: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="e.g., Apex Growth Agency"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex items-center justify-between border-t border-borderwarm pt-6 mt-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveBranding}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
                >
                  Save Branding
                </motion.button>
                {brandingSaved && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1"
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
              <KeyRound size={20} className="text-brand-400" />
              Update Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 text-xs font-semibold ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
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

              <div className="grid sm:grid-cols-2 gap-4">
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

              <div className="pt-4 border-t border-borderwarm">
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

        </div>
      </div>
    </motion.div>
  )
}
