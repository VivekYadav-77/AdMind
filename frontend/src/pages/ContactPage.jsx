import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import { ticketApi } from '../services/ticketApi'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      await ticketApi.submitGuestTicket(formData)
      setIsSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to submit message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bgbase text-textprimary font-sans selection:bg-brand-500/30">
      <LandingNav />
      
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Get in <span className="text-brand-500">Touch</span>
          </h1>
          <p className="text-lg text-textmuted max-w-2xl mx-auto">
            Have questions about AdMind? Need help with your account? Fill out the form below and our team will get back to you shortly.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-bgpanel border border-borderwarm p-8 rounded-2xl text-center shadow-xl shadow-brand-500/5 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Message Sent Successfully!</h2>
            <p className="text-textmuted mb-8">
              Thanks for reaching out, {formData.guest_name}. We've received your message and will respond to {formData.guest_email} as soon as possible.
            </p>
            <div className="p-6 bg-brand-500/5 border border-brand-500/20 rounded-xl mb-6">
              <h3 className="font-semibold text-brand-500 mb-2">Want to track your ticket?</h3>
              <p className="text-sm text-textmuted mb-4">Create an account to track your support history and manage your ad campaigns.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-full font-bold hover:bg-brand-600 transition-colors">
                Sign Up Now <ArrowRight size={18} />
              </Link>
            </div>
            <button onClick={() => { setIsSuccess(false); setFormData({ ...formData, message: '', subject: '' }) }} className="text-sm text-textmuted hover:text-textprimary transition-colors">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-bgpanel border border-borderwarm p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-textmuted mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textmuted mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.guest_email}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textmuted mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing">Billing & Subscriptions</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textmuted mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Brief summary of your inquiry"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-textmuted mb-2">Message</label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors resize-y"
                placeholder="How can we help you today?"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : (
                <>
                  <MessageSquare size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </main>
      
      <footer className="relative z-10 bg-bgbase border-t border-borderwarm py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
            </div>
            <p className="text-textsecondary mb-6 max-w-sm">
              The AI co-pilot for digital marketers. Build campaigns, analyze performance, and write converting copy in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Resources</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><Link to="/blog" className="hover:text-brand-500 transition-colors">Blog</Link></li>
              <li><Link to="/community" className="hover:text-brand-500 transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Company</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-borderwarm flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textmuted">
          <div>&copy; {new Date().getFullYear()} AdMind Inc. Made in India 🇮🇳 by Vivek Yadav.</div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-textprimary transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-textprimary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
