import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { API } from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await API.resetPassword(token, password)
      navigate('/login', { state: { message: 'Password reset successfully! You can now log in.' } })
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link might be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-bgbase text-textprimary items-center justify-center relative p-4">
      <AnimatedBackground density="light" />
      <div className="grain-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-bgpanel border border-borderwarm p-8 rounded-2xl shadow-xl z-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
        
        <button 
          onClick={() => setIsDark(!isDark)} 
          className="absolute top-6 right-6 p-2 text-textmuted hover:text-brand-500 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="flex justify-center mb-6">
          <Logo className="h-12 w-12 text-brand-500" />
        </div>

        <h2 className="text-3xl font-serif text-textprimary text-center mb-2">Create New Password</h2>
        <p className="text-textmuted text-center mb-8">Enter your new password below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-textsecondary">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-bgpanel border border-borderwarm rounded-xl pl-11 pr-12 py-3.5 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textmuted hover:text-textprimary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-textsecondary">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-bgpanel border border-borderwarm rounded-xl pl-11 pr-12 py-3.5 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !token}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
