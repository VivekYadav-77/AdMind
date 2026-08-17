import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, ArrowRight, ArrowLeft, Sun, Moon, Eye, EyeOff } from 'lucide-react'
import { API } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await API.register(name, email, password)
      navigate('/login', { state: { message: 'Account created! Please check your inbox (and spam) for the verification link before logging in.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-bgbase text-textprimary relative selection:bg-brand-500/30">
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl bg-bgpanel/80 hover:bg-bgpanel border border-borderwarm text-textmuted hover:text-brand-500 transition-all duration-300 shadow-sm backdrop-blur-sm"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <AnimatedBackground density="full" showKite={true} />
      <div className="grain-overlay" />
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-bgpanel border-r border-borderwarm flex-col justify-between p-16 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/20 blur-[100px]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Logo className="h-12 w-12 text-brand-500" />
            <span className="text-2xl font-serif tracking-tight text-textprimary glow-text">AdMind</span>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-serif text-textprimary leading-tight mb-6">
              Start your <br />
              <span className="text-brand-500 italic">growth journey</span>
            </h1>
            <p className="text-lg text-textmuted max-w-md leading-relaxed">
              Create an account to unlock full-stack AI campaign analysis. Stop guessing and start scaling with precision data insights today.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 text-sm text-textmuted">
          &copy; {new Date().getFullYear()} AdMind Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-textmuted hover:text-textprimary transition-colors mb-8 group w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Logo className="h-10 w-10 text-brand-500" />
            <span className="text-2xl font-serif tracking-tight text-textprimary">AdMind</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-serif text-textprimary mb-2">Create Account</h2>
            <p className="text-textmuted">Join AdMind and optimize your campaigns.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-textsecondary">Full Name</label>
              <input
                type="text"
                className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-3.5 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                placeholder="Insert name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-textsecondary">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-3.5 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-textsecondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl px-4 py-3.5 pr-12 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textmuted hover:text-textprimary transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Creating account...' : (
                <>
                  Sign Up <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-textmuted mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
