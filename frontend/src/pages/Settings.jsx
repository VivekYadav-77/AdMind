import { useState } from 'react'
import { User, Shield, Sliders, Cpu, KeyRound, Check, AlertCircle, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  
  // States for Settings forms
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [aiSettings, setAiSettings] = useState({
    model: 'gemini-1.5-pro',
    temperature: 0.2,
    maxTokens: 2048
  })

  const [thresholds, setThresholds] = useState({
    wasteAlertPercent: 15,
    minRoasTarget: 2.5
  })

  const [passwordStatus, setPasswordStatus] = useState(null) // { type: 'success'|'error', message: '' }
  const [settingsSaved, setSettingsSaved] = useState(false)
  
  const [branding, setBranding] = useState(() => {
    return {
      agencyName: localStorage.getItem('agencyName') || '',
      logoUrl: localStorage.getItem('logoUrl') || ''
    }
  })
  const [brandingSaved, setBrandingSaved] = useState(false)

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All password fields are required.' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    
    // Simulate successful password update
    setPasswordStatus({ type: 'success', message: 'Password updated successfully!' })
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    
    setTimeout(() => {
      setPasswordStatus(null)
    }, 4000)
  }

  const handleSaveSettings = () => {
    setSettingsSaved(true)
    setTimeout(() => {
      setSettingsSaved(false)
    }, 3000)
  }

  const handleSaveBranding = () => {
    localStorage.setItem('agencyName', branding.agencyName)
    localStorage.setItem('logoUrl', branding.logoUrl)
    setBrandingSaved(true)
    setTimeout(() => {
      setBrandingSaved(false)
    }, 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16"
    >
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left side: Profile & Account Information */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border-borderwarm relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(217,119,87,0.3)]">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 rounded-full border-4 border-bgpanel shadow-md" />
            </div>
            
            <h2 className="text-xl font-serif text-textprimary tracking-tight">{user?.email || 'User Account'}</h2>
            <p className="text-sm text-textmuted mt-1">Enterprise Developer</p>
            
            <div className="mt-6 pt-6 border-t border-borderwarm w-full space-y-3 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-textmuted">Account Tier</span>
                <span className="text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded-md text-xs">Premium Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textmuted">Database Engine</span>
                <span className="text-textsecondary">SQLite v3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textmuted">API Connection</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border-borderwarm">
            <h3 className="text-base font-bold text-textprimary mb-4 flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              Security Information
            </h3>
            <p className="text-xs text-textmuted leading-relaxed">
              Your connection is encrypted using SSL, and tokens are safely stored in your local security scope. Never share your authorization tokens or credentials with anyone.
            </p>
          </div>
        </div>

        {/* Right side: App & Model Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section: AI Configurations */}
          <div className="glass-panel rounded-3xl p-8 border-borderwarm">
            <h3 className="text-lg font-serif text-textprimary mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-amber-400" />
              AI Analysis Configurations
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-2">Gemini Analysis Model</label>
                <select
                  value={aiSettings.model}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-3 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
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
                      className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
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
                      className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
                    />
                    <span className="text-textmuted font-bold text-sm">x</span>
                  </div>
                  <span className="text-[10px] text-textmuted mt-1 block">Flags campaigns yielding lower target returns.</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-borderwarm pt-6">
                <button
                  onClick={handleSaveSettings}
                  className="btn-primary flex items-center gap-2"
                >
                  Save Configurations
                </button>
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

          {/* Section: White-Label Reporting */}
          <div className="glass-panel rounded-3xl p-8 border-borderwarm">
            <h3 className="text-lg font-serif text-textprimary mb-6 flex items-center gap-2">
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
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="e.g., Apex Growth Agency"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textsecondary mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex items-center justify-between border-t border-borderwarm pt-6 mt-6">
                <button
                  onClick={handleSaveBranding}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white rounded-xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                >
                  Save Branding
                </button>
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

          {/* Section: Change Password */}
          <div className="glass-panel rounded-3xl p-8 border-borderwarm">
            <h3 className="text-lg font-serif text-textprimary mb-6 flex items-center gap-2">
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
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
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
                    className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textsecondary mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-2.5 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-borderwarm">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </motion.div>
  )
}
