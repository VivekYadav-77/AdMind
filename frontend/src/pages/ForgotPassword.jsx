import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { API } from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle, success, error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    
    try {
      const res = await API.forgotPassword(email)
      setStatus('success')
      setMessage(res.message)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

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
        
        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-textprimary font-medium mb-2">{message}</p>
            <p className="text-sm text-textmuted">Please check your inbox and spam folder.</p>
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
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Sending link...' : 'Send reset link'}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
