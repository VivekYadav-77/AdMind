import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, ArrowRight } from 'lucide-react'
import { API } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await API.login(email, password)
      login(data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-darkbg text-[#E5E0D8]">
      <div className="grain-overlay" />
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#151513] border-r border-borderwarm flex-col justify-between p-16 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#3A2216]/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#4A2518]/20 blur-[100px]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white shadow-[0_0_15px_rgba(217,119,87,0.4)]">
              A
            </div>
            <span className="text-2xl font-serif tracking-tight text-[#FAF4EC] glow-text">AdMind</span>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-serif text-[#FAF4EC] leading-tight mb-6">
              Amplify your <br />
              <span className="text-brand-500 italic">marketing strategy</span>
            </h1>
            <p className="text-lg text-[#A39E93] max-w-md leading-relaxed">
              Log in to access powerful AI-driven insights, craft tailored audience segments, and outsmart competitor campaigns in seconds.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 text-sm text-[#8A857A]">
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
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white shadow-[0_0_15px_rgba(217,119,87,0.4)]">
              A
            </div>
            <span className="text-2xl font-serif tracking-tight text-[#FAF4EC]">AdMind</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-serif text-[#FAF4EC] mb-2">Welcome back</h2>
            <p className="text-[#A39E93]">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E5E0D8]">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-[#151513] border border-borderwarm rounded-xl px-4 py-3.5 text-[#FAF4EC] focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-[#6A655A]"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E5E0D8]">Password</label>
              <input
                type="password"
                required
                className="w-full bg-[#151513] border border-borderwarm rounded-xl px-4 py-3.5 text-[#FAF4EC] focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-[#6A655A]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#A39E93] mt-10">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
