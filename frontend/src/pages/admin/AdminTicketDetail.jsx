import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, Save } from 'lucide-react'
import { adminApi } from '../../services/adminApi'

export default function AdminTicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  
  const messagesEndRef = useRef(null)

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getTicket(id)
      setTicket(data)
    } catch (err) {
      setError(err.message || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    
    setIsReplying(true)
    try {
      await adminApi.replyToTicket(id, replyText)
      setReplyText('')
      
      // Auto-resolve if open
      if (ticket.status === 'open' || ticket.status === 'in_progress') {
          await adminApi.changeTicketStatus(id, 'resolved')
      }
      
      await fetchTicket()
    } catch (err) {
      alert(err.message || 'Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }
  
  const handleStatusChange = async (e) => {
      const newStatus = e.target.value
      setStatusUpdating(true)
      try {
          await adminApi.changeTicketStatus(id, newStatus)
          await fetchTicket()
      } catch(err) {
          alert(err.message || 'Failed to update status')
      } finally {
          setStatusUpdating(false)
      }
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
  if (error) return <div className="p-8 text-red-500 bg-red-500/10 rounded-xl max-w-2xl">{error}</div>
  if (!ticket) return null

  return (
    <div className="max-w-4xl h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0 bg-bgpanel border border-borderwarm p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <Link to="/admin/tickets" className="p-2 bg-bgbase border border-borderwarm rounded-lg hover:text-brand-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">#{ticket.id} - {ticket.subject}</h1>
            <p className="text-textmuted text-sm">
                From: {ticket.guest_email ? `${ticket.guest_name} <${ticket.guest_email}> (Guest)` : `User #${ticket.user_id}`} • 
                Category: {ticket.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-textmuted">Status:</span>
            <select
                value={ticket.status}
                onChange={handleStatusChange}
                disabled={statusUpdating}
                className="bg-bgbase border border-borderwarm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm font-semibold capitalize"
            >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>
            {statusUpdating && <Loader2 size={16} className="animate-spin text-brand-500" />}
        </div>
      </div>

      <div className="flex-1 bg-bgpanel border border-borderwarm rounded-2xl flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {ticket.messages.map((msg) => {
            const isAdmin = msg.sender_type === 'admin'
            return (
              <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-textmuted font-medium">
                    {isAdmin ? 'AdMind Support (You)' : (ticket.guest_name || 'User')}
                  </span>
                  <span className="text-xs text-textmuted/50">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isAdmin 
                    ? 'bg-orange-500 text-white rounded-br-sm' 
                    : 'bg-bgbase border border-borderwarm rounded-bl-sm text-textprimary'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Area */}
        <div className="p-4 bg-bgbase border-t border-borderwarm">
            <form onSubmit={handleReply} className="relative">
                <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to the user here..."
                className="w-full bg-bgpanel border border-borderwarm rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none h-24 text-sm"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleReply(e)
                    }
                }}
                />
                <button
                type="submit"
                disabled={isReplying || !replyText.trim()}
                className="absolute right-3 bottom-3 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send Reply & Resolve"
                >
                {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
            <p className="text-xs text-textmuted mt-2 text-center">Press Enter to send. Replying automatically sets status to Resolved.</p>
        </div>
      </div>
    </div>
  )
}
