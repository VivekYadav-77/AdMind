import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { API } from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    const verify = async () => {
      try {
        await API.verifyEmail(token)
        setStatus('success')
        setTimeout(() => {
          navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } })
        }, 3000)
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Verification failed. The link may have expired.')
      }
    }

    verify()
  }, [token, navigate])

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
        
        <div className="flex justify-center mb-8">
          <Logo className="h-14 w-14 text-brand-500" />
        </div>

        {status === 'loading' && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-serif text-textprimary">Verifying your email...</h2>
            <p className="text-textmuted">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-serif text-textprimary">Email Verified!</h2>
            <p className="text-textmuted">Redirecting you to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-serif text-textprimary">Verification Failed</h2>
            <p className="text-textmuted">{message}</p>
            
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-2 btn-primary w-full py-3 mt-4"
            >
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
