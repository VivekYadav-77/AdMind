import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, CheckCircle, AlertTriangle, Clock, Sun, Moon } from 'lucide-react'
import { API } from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

const RESEND_COOLDOWN_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = RESEND_COOLDOWN_MINUTES * 60;

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle, loading, success_found, success_not_found, error
  const [message, setMessage] = useState('')
  
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Timer logic for cooldown
  useEffect(() => {
    let interval = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  // Check initial cooldown when component loads or email changes after a send attempt
  useEffect(() => {
    if (email) {
      const lastSent = localStorage.getItem(`fp_last_sent_${email}`)
      if (lastSent) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
        if (elapsed < RESEND_COOLDOWN_SECONDS) {
          setCooldownSeconds(RESEND_COOLDOWN_SECONDS - elapsed);
        } else {
          setCooldownSeconds(0);
        }
      } else {
          setCooldownSeconds(0);
      }
    }
  }, [email]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    // If we're already in a success state and clicking resend, check cooldown
    if ((status === 'success_found' || status === 'success_not_found') && cooldownSeconds > 0) {
      return;
    }
    
    setLoading(true)
    setStatus('loading')
    
    try {
      const res = await API.forgotPassword(email)
      
      if (res.account_found) {
        setStatus('success_found')
        setMessage('Reset link sent to your email.')
        
        localStorage.setItem(`fp_last_sent_${email}`, Date.now().toString())
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
      } else {
        setStatus('success_not_found')
        setMessage('No account found with this email.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen bg-bgbase text-textprimary items-center justify-center relative p-4">
      <AnimatedBackground density="light" />
      <div className="grain-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
        
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-textmuted hover:text-textprimary transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back to login
        </Link>
        
        <div className="flex justify-center mb-6">
          <Logo className="h-12 w-12 text-brand-500" />
        </div>

        <h2 className="text-3xl font-serif text-textprimary text-center mb-2">Reset Password</h2>
        
        {(status === 'success_found' || status === 'success_not_found') ? (
          <div className="text-center py-6">
            {status === 'success_found' ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-textprimary font-medium mb-2">{message}</p>
                <p className="text-sm text-textmuted mb-8">Please check your inbox and spam folder.</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <p className="text-textprimary font-medium mb-2">{message}</p>
                <p className="text-sm text-textmuted mb-8">Please check the email address or sign up for a new account.</p>
              </>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading || (status === 'success_found' && cooldownSeconds > 0)}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                 'Sending...'
              ) : status === 'success_found' && cooldownSeconds > 0 ? (
                <>
                  <Clock size={18} />
                  Resend available in {formatTime(cooldownSeconds)}
                </>
              ) : (
                'Resend link'
              )}
            </button>
          </div>
        ) : (
          <>
            <p className="text-textmuted text-center mb-8">Enter your email address and we'll send you a link to reset your password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 font-medium">
                  {message}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-textsecondary">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textmuted" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-bgpanel border border-borderwarm rounded-xl pl-11 pr-4 py-3.5 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || status === 'loading'}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading || status === 'loading' ? 'Sending link...' : 'Send reset link'}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
