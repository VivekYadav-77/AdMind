import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, XCircle, Sun, Moon } from 'lucide-react'
import { API } from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

export default function CheckEmail() {
  const location = useLocation()
  const email = location.state?.email || ''
  const [resendStatus, setResendStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

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
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // If no email in state, this was accessed directly, but we still show the page
  // just without the specific email.

  const handleResend = async () => {
    if (!email) {
      setErrorMessage("We don't have your email address. Please try signing up again.")
      setResendStatus('error')
      return
    }

    setResendStatus('loading')
    try {
      const response = await API.resendVerification(email)
      setSuccessMessage(response.message || 'Verification email sent. Check your inbox.')
      setCooldown(60)
      setResendStatus('success')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend verification email.')
      setResendStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen bg-bgbase text-textprimary items-center justify-center relative">
      <AnimatedBackground density="light" />
      <div className="grain-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-bgpanel border border-borderwarm p-10 rounded-2xl shadow-xl z-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
        
        <button 
          onClick={() => setIsDark(!isDark)} 
          className="absolute top-6 right-6 p-2 text-textmuted hover:text-brand-500 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-brand-500" />
          </div>
        </div>

        <h2 className="text-3xl font-serif text-textprimary mb-4">Check your email</h2>
        
        <p className="text-textmuted mb-6 leading-relaxed">
          We've sent a verification link to<br />
          <span className="text-textprimary font-medium">{email || 'your email address'}</span>.
          <br /><br />
          Please click the link in the email to verify your account before logging in. Don't forget to check your spam folder!
        </p>

        <div className="space-y-4">
          <Link 
            to="/login"
            className="w-full btn-primary flex items-center justify-center py-3"
          >
            Go to Login
          </Link>

          <div className="pt-4 border-t border-borderwarm">
            {resendStatus === 'idle' && (
              <p className="text-sm text-textmuted">
                Didn't receive the email?{' '}
                <button 
                  onClick={handleResend}
                  className="text-brand-400 hover:text-brand-300 font-medium transition-colors focus:outline-none"
                >
                  Click to resend
                </button>
              </p>
            )}

            {resendStatus === 'loading' && (
              <div className="flex items-center justify-center gap-2 text-sm text-brand-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </div>
            )}

            {resendStatus === 'success' && (
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-brand-500">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                {cooldown > 0 ? (
                  <p className="text-xs text-textmuted">
                    You can resend again in {cooldown}s
                  </p>
                ) : (
                  <button 
                    onClick={handleResend} 
                    className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Resend again
                  </button>
                )}
              </div>
            )}

            {resendStatus === 'error' && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                  <XCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
                <button 
                  onClick={() => setResendStatus('idle')}
                  className="text-sm text-brand-400 hover:text-brand-300 underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-borderwarm">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-sm text-textmuted hover:text-textprimary transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
        </div>

      </motion.div>
    </div>
  )
}
