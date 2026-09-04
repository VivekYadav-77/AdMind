import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Plus, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ticketApi } from '../services/ticketApi'
import Pagination from '../components/ui/Pagination'

export default function SupportPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('submit') // submit, list
  
  // Submit Tab State
  const [formData, setFormData] = useState({
    category: 'General Inquiry',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  // List Tab State
  const [ticketsData, setTicketsData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [isLoading, setIsLoading] = useState(false)

  const fetchTickets = async (page = 1) => {
    setIsLoading(true)
    try {
      const data = await ticketApi.getMyTickets(page)
      setTicketsData(data)
    } catch (err) {
      console.error("Failed to load tickets", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'list') {
      fetchTickets(1)
    }
  }, [activeTab])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      await ticketApi.createTicket(formData)
      setFormData({ ...formData, subject: '', message: '' })
      setActiveTab('list') // Switch to list view after successful submit
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-500/10 text-blue-500",
      in_progress: "bg-yellow-500/10 text-yellow-500",
      resolved: "bg-green-500/10 text-green-500",
      closed: "bg-borderwarm text-textmuted"
    }
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${styles[status] || styles.open}`}>{status.replace('_', ' ')}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Support</h1>
          <p className="text-textmuted text-sm">Need help? Submit a ticket and we'll get back to you.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-borderwarm mb-6">
        <button
          onClick={() => setActiveTab('submit')}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'submit' ? 'border-brand-500 text-brand-500' : 'border-transparent text-textmuted hover:text-textprimary'
          }`}
        >
          Submit a Ticket
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'list' ? 'border-brand-500 text-brand-500' : 'border-transparent text-textmuted hover:text-textprimary'
          }`}
        >
          My Tickets
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="bg-bgpanel border border-borderwarm rounded-2xl p-6 max-w-2xl">
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                {submitError}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-textmuted mb-2">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-bgbase/50 border border-borderwarm rounded-xl px-4 py-3 text-textmuted cursor-not-allowed"
              />
              <p className="text-xs text-textmuted mt-2">We'll reply to the email associated with your account.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textmuted mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-bgbase border border-borderwarm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
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
                placeholder="Brief summary of your issue"
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
                placeholder="Please describe your issue in detail..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Create Ticket
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bgpanelhover text-textmuted">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderwarm">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-textmuted">Loading...</td></tr>
                ) : ticketsData.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MessageSquare size={32} className="mx-auto mb-4 text-textmuted/30" />
                      <p className="text-textmuted mb-4">You haven't submitted any tickets yet.</p>
                      <button onClick={() => setActiveTab('submit')} className="text-brand-500 hover:underline">Submit a ticket</button>
                    </td>
                  </tr>
                ) : (
                  ticketsData.items.map(t => (
                    <tr key={t.id} className="hover:bg-bgpanelhover/50 transition-colors">
                      <td className="px-6 py-4 text-textmuted">#{t.id}</td>
                      <td className="px-6 py-4 font-medium">{t.subject}</td>
                      <td className="px-6 py-4 text-textmuted">{t.category}</td>
                      <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                      <td className="px-6 py-4 text-textmuted">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/app/support/${t.id}`} className="text-brand-500 hover:text-brand-600 flex items-center justify-end gap-1 font-medium">
                          View <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {ticketsData.total > 0 && (
            <Pagination page={ticketsData.page} pages={ticketsData.pages} onPageChange={fetchTickets} />
          )}
        </div>
      )}
    </div>
  )
}
