import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Download, AlertCircle, FileSearch, Lightbulb, PenLine, BarChart3, MessageSquare, Send, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2pdf from 'html2pdf.js'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'

import { API } from '../services/api'
import AuditResults from '../components/AuditResults'
import CampaignHealthScore from '../components/CampaignHealthScore'
import StrategyResults from '../components/StrategyResults'
import CopyResults from '../components/CopyResults'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('audit')
  const reportRef = useRef(null)

  const agencyName = localStorage.getItem('agencyName')
  const logoUrl = localStorage.getItem('logoUrl')

  // Chat State
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingChat, setSendingChat] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    async function loadJobAndChat() {
      try {
        setLoading(true)
        setError(null)
        const data = await API.getJobDetails(id)
        setJob(data)

        if (data.status === 'complete') {
          try {
            const chatHistory = await API.getChatHistory(id)
            setChatMessages(chatHistory || [])
          } catch (e) {
            console.error("Failed to load chat history", e)
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load report details.')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      loadJobAndChat()
    }
  }, [id])

  useEffect(() => {
    // Scroll chat to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, showChat])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingChat) return

    const userMsg = { role: 'user', content: newMessage }
    setChatMessages(prev => [...prev, userMsg])
    setNewMessage("")
    setSendingChat(true)

    try {
      const reply = await API.sendChatMessage(id, userMsg.content)
      setChatMessages(prev => [...prev, reply])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering that.' }])
    } finally {
      setSendingChat(false)
    }
  }

  const downloadPDF = () => {
    const element = reportRef.current
    if (!element) return

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `AdMind_Report_${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#0B0F19',
        windowWidth: 1200
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    html2pdf().set(opt).from(element).save()
  }

  const tabs = [
    { id: 'audit', label: 'Audit', icon: FileSearch, color: 'blue' },
    { id: 'strategy', label: 'Strategy', icon: Lightbulb, color: 'indigo' },
    { id: 'copy', label: 'A/B Copy', icon: PenLine, color: 'purple' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading report data...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to History
        </button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <div className="flex items-start gap-3 text-red-400">
            <AlertCircle size={24} />
            <div>
              <h2 className="font-semibold text-lg">Error Loading Report</h2>
              <p className="mt-1 text-sm text-red-300">{error || 'Report not found or permission denied.'}</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full relative">
      {/* Main Report Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx("space-y-8 pb-12 transition-all duration-300", showChat ? "w-2/3" : "w-full")}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm font-semibold"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to History
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all border",
                showChat 
                  ? "bg-purple-600/20 text-purple-400 border-purple-500/30" 
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              )}
            >
              <MessageSquare size={16} />
              {showChat ? "Hide Chat" : "Ask AI"}
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:scale-105"
            >
              <Download size={16} />
              Download PDF Report
            </button>
          </div>
        </div>

        {/* Report Info Card */}
        <div className="flex flex-wrap items-center gap-6 rounded-2xl glass-panel p-6 border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg relative z-10">
            <BarChart3 size={24} />
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">Report #{job.id} Overview</h2>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Calendar size={12} />
                {new Date(job.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3 text-sm text-slate-400">
              <p>
                Dataset: <span className="font-bold text-slate-200">{job.total_rows} rows</span>
              </p>
              <p>
                Total Spend: <span className="font-bold text-slate-200">{formatMoney(job.input_spend)}</span>
              </p>
              <p>
                Total Revenue: <span className="font-bold text-slate-200">{formatMoney(job.input_revenue)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs and Results Section */}
        <div className="space-y-6">
          {job.audit_data && <CampaignHealthScore audit={job.audit_data} />}
          <div className="flex border-b border-white/10 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-bold transition-all border-b-2",
                    isActive
                      ? `border-${tab.color}-400 text-${tab.color}-400 bg-${tab.color}-500/10`
                      : "border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div ref={reportRef} className="bg-transparent min-h-[400px] p-2">
            {/* White-Label Branding Header */}
            {(agencyName || logoUrl) && (
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                {logoUrl && (
                  <img src={logoUrl} alt="Agency Logo" className="h-12 object-contain rounded" crossOrigin="anonymous" />
                )}
                {agencyName && (
                  <h1 className="text-3xl font-bold text-white tracking-wide">{agencyName}</h1>
                )}
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {activeTab === 'audit' && job.audit_data && (
                <motion.div key="audit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <AuditResults audit={job.audit_data} />
                </motion.div>
              )}
              {activeTab === 'strategy' && job.strategy_data && (
                <motion.div key="strategy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <StrategyResults strategy={job.strategy_data} jobId={job.id} />
                </motion.div>
              )}
              {activeTab === 'copy' && job.copy_data && (
                <motion.div key="copy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <CopyResults copy={job.copy_data} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 100 }}
            className="w-1/3 flex flex-col h-[calc(100vh-8rem)] sticky top-0 bg-[#0B0F19]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-bold text-white tracking-wide">AI Assistant</h3>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatMessages.length === 0 && (
                <div className="text-center text-slate-400 my-10">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Ask me anything about this report!</p>
                  <p className="text-xs mt-1 opacity-70">Example: "Why is Facebook ROAS so low?"</p>
                </div>
              )}
              
              {chatMessages.map((msg, i) => (
                <div key={i} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={clsx(
                    "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-a:text-blue-400 max-w-full"
                  )}>
                    {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                  </div>
                </div>
              ))}
              
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-[#050810] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingChat}
                  className="absolute right-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
