import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ticketApi } from '../services/ticketApi'

export default function SupportTicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const messagesEndRef = useRef(null)

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const data = await ticketApi.getTicket(id)
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
      await ticketApi.replyToTicket(id, replyText)
      setReplyText('')
      await fetchTicket() // Refresh thread
    } catch (err) {
      alert(err.message || 'Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-500/10 text-blue-500",
      in_progress: "bg-yellow-500/10 text-yellow-500",
      resolved: "bg-green-500/10 text-green-500",
      closed: "bg-borderwarm text-textmuted"
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || styles.open}`}>{status.replace('_', ' ')}</span>
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
  if (error) return <div className="p-8 text-red-500 bg-red-500/10 rounded-xl max-w-2xl">{error}</div>
  if (!ticket) return null

  return (
    <div className="max-w-4xl h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/app/support" className="p-2 bg-bgpanel border border-borderwarm rounded-lg hover:text-brand-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">#{ticket.id} - {ticket.subject}</h1>
            <p className="text-textmuted text-sm">{ticket.category} • Created {new Date(ticket.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div>
          {getStatusBadge(ticket.status)}
        </div>
      </div>

      <div className="flex-1 bg-bgpanel border border-borderwarm rounded-2xl flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {ticket.messages.map((msg) => {
            const isUser = msg.sender_type === 'user' || msg.sender_type === 'guest'
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-textmuted font-medium">
                    {isUser ? 'You' : 'AdMind Support'}
                  </span>
                  <span className="text-xs text-textmuted/50">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isUser 
                    ? 'bg-brand-500 text-white rounded-br-sm' 
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
        {ticket.status !== 'closed' ? (
          <div className="p-4 bg-bgbase border-t border-borderwarm">
            <form onSubmit={handleReply} className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full bg-bgpanel border border-borderwarm rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:border-brand-500 transition-colors resize-none h-24 text-sm"
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
                className="absolute right-3 bottom-3 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReplying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
            <p className="text-xs text-textmuted mt-2 text-center">Press Enter to send, Shift+Enter for new line.</p>
          </div>
        ) : (
          <div className="p-4 bg-bgbase border-t border-borderwarm text-center text-textmuted">
            This ticket is closed. If you need further assistance, please open a new ticket.
          </div>
        )}
      </div>
    </div>
  )
}
