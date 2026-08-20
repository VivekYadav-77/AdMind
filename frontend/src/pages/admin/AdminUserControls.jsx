import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminApi } from '../../services/adminApi'
import { ArrowLeft, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function PromptModal({ isOpen, onClose, onConfirm, feature }) {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-bgpanel border border-borderwarm rounded-3xl shadow-2xl relative z-[101] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-textprimary">Block Feature</h3>
              <button onClick={onClose} className="text-textmuted hover:text-textprimary">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-textmuted mb-4">
              You are about to block access to <strong className="text-textprimary capitalize">{feature.replace('_', ' ')}</strong>.
              <br />
              Optional: Provide a reason for the block. This will be shown to the user.
            </p>
            <input
              type="text"
              placeholder="e.g., Abuse of limits, Terms violation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 text-textprimary placeholder:text-textmuted focus:outline-none focus:border-brand-500 mb-6"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-textprimary hover:bg-bgpanelhover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
              >
                Block Feature
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function AdminUserControls() {
  const { id } = useParams()
  const [controls, setControls] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)

  const [promptConfig, setPromptConfig] = useState({ isOpen: false, feature: null })

  useEffect(() => {
    fetchControls()
  }, [id])

  const fetchControls = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminApi.getUserControls(id)
      setControls(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeature = async (feature, currentBlocked) => {
    if (!currentBlocked) {
      // Opening modal for blocking
      setPromptConfig({ isOpen: true, feature })
    } else {
      // Unblocking immediately
      executeToggleFeature(feature, false, null)
    }
  }

  const executeToggleFeature = async (feature, newBlocked, reason) => {
    try {
      setUpdating(feature)
      setPromptConfig({ isOpen: false, feature: null })
      await adminApi.updateUserControl(id, feature, newBlocked, reason)
      await fetchControls()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleLogin = async () => {
    try {
      setUpdating('login')
      await adminApi.toggleUserLoginBlock(id)
      await fetchControls()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleEmail = async () => {
    try {
      setUpdating('email')
      await adminApi.toggleUserEmailBlock(id)
      await fetchControls()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-textmuted">
        Loading controls...
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-textmuted hover:text-textprimary transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-500 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-textprimary mb-2">Failed to load controls</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={fetchControls}
            className="px-6 py-2 bg-bgpanel border border-borderwarm hover:bg-bgpanelhover text-textprimary rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!controls) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 border-b border-borderwarm pb-4">
        <Link to="/admin/users" className="p-2 -ml-2 rounded-xl text-textmuted hover:text-textprimary hover:bg-bgpanel transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-textprimary tracking-tight">Feature Controls</h1>
          <p className="text-sm text-textmuted mt-1">Manage granular access for {controls.email}</p>
        </div>
      </div>

      <div className="bg-bgpanel rounded-2xl p-6 md:p-8 border border-borderwarm shadow-sm">
        <h2 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
          Global Blocks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="flex flex-col justify-between p-5 bg-bgbase rounded-xl border border-borderwarm">
            <div className="mb-4">
              <div className="text-textprimary font-bold text-lg">Login Access</div>
              <div className="text-sm text-textmuted mt-1">Prevent this user from logging into the platform entirely.</div>
            </div>
            <button
              onClick={handleToggleLogin}
              disabled={updating === 'login'}
              className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                controls.login_blocked
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-bgpanelhover text-textprimary hover:bg-borderwarm'
              } disabled:opacity-50`}
            >
              {updating === 'login' ? 'Updating...' : controls.login_blocked ? 'Login is Blocked' : 'Block Login'}
            </button>
          </div>

          <div className="flex flex-col justify-between p-5 bg-bgbase rounded-xl border border-borderwarm">
            <div className="mb-4">
              <div className="text-textprimary font-bold text-lg">Email Sending</div>
              <div className="text-sm text-textmuted mt-1">Prevent this user from receiving verification or password reset emails.</div>
            </div>
            <button
              onClick={handleToggleEmail}
              disabled={updating === 'email'}
              className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                controls.email_blocked
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-bgpanelhover text-textprimary hover:bg-borderwarm'
              } disabled:opacity-50`}
            >
              {updating === 'email' ? 'Updating...' : controls.email_blocked ? 'Emails are Blocked' : 'Block Emails'}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-textprimary mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
          Feature Toggles
        </h2>
        <div className="space-y-3">
          {Object.entries(controls.features).map(([feature, state]) => (
            <div key={feature} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bgbase border border-borderwarm rounded-xl gap-4 transition-all hover:border-borderwarm/80">
              <div>
                <div className="text-textprimary font-semibold capitalize text-base">{feature.replace('_', ' ')}</div>
                {state.reason && (
                  <div className="text-sm text-red-400/90 mt-1.5 flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-md w-fit">
                    <AlertTriangle size={14} /> {state.reason}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggleFeature(feature, state.blocked)}
                disabled={updating === feature}
                className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shrink-0 ${
                  state.blocked
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20'
                    : 'bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20'
                } disabled:opacity-50 min-w-[120px]`}
              >
                {updating === feature ? 'Updating...' : state.blocked ? 'Blocked' : 'Allowed'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <PromptModal
        isOpen={promptConfig.isOpen}
        feature={promptConfig.feature || ''}
        onClose={() => setPromptConfig({ isOpen: false, feature: null })}
        onConfirm={(reason) => executeToggleFeature(promptConfig.feature, true, reason)}
      />
    </div>
  )
}

export default AdminUserControls
