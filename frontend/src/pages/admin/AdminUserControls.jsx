import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminApi } from '../../services/adminApi'

function AdminUserControls() {
  const { id } = useParams()
  const [controls, setControls] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchControls()
  }, [id])

  const fetchControls = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUserControls(id)
      setControls(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeature = async (feature, currentBlocked) => {
    try {
      setUpdating(feature)
      const newBlocked = !currentBlocked
      const reason = newBlocked ? prompt("Optional: Enter a reason for blocking this feature:") : null
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

  if (loading) return <div className="text-gray-400">Loading controls...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!controls) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="text-blue-500 hover:text-blue-400">
          &larr; Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-white">Feature Controls</h1>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">User Details</h2>
          <p className="text-gray-400">Email: {controls.email}</p>
          <p className="text-gray-400">ID: {controls.user_id}</p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Global Blocks</h2>
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-medium">Login Access</div>
              <div className="text-sm text-gray-400">Prevent this user from logging in</div>
            </div>
            <button
              onClick={handleToggleLogin}
              disabled={updating === 'login'}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                controls.login_blocked
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
              }`}
            >
              {updating === 'login' ? 'Updating...' : controls.login_blocked ? 'Login Blocked' : 'Login Allowed'}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-medium">Email Sending</div>
              <div className="text-sm text-gray-400">Prevent this user from receiving platform emails (e.g., resets, verification)</div>
            </div>
            <button
              onClick={handleToggleEmail}
              disabled={updating === 'email'}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                controls.email_blocked
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
              }`}
            >
              {updating === 'email' ? 'Updating...' : controls.email_blocked ? 'Emails Blocked' : 'Emails Allowed'}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Feature Toggles</h2>
        <div className="space-y-4">
          {Object.entries(controls.features).map(([feature, state]) => (
            <div key={feature} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-900 rounded-lg gap-4">
              <div>
                <div className="text-white font-medium capitalize">{feature.replace('_', ' ')}</div>
                {state.reason && (
                  <div className="text-sm text-red-400 mt-1">Block reason: {state.reason}</div>
                )}
              </div>
              <button
                onClick={() => handleToggleFeature(feature, state.blocked)}
                disabled={updating === feature}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors shrink-0 ${
                  state.blocked
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                }`}
              >
                {updating === feature ? 'Updating...' : state.blocked ? 'Blocked' : 'Allowed'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminUserControls
