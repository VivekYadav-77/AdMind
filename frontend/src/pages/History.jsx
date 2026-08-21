import { Calendar, CheckCircle2, Clock, BarChart3, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Download, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import html2pdf from 'html2pdf.js'

import { API } from '../services/api'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function History() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const reportRef = useRef(null)

  // Rename state
  const [renameModal, setRenameModal] = useState(null)
  const [editName, setEditName] = useState('')
  const [renameLoading, setRenameLoading] = useState(false)

  const openRenameModal = (job) => {
    setRenameModal({ jobId: job.id, currentName: job.name || `Report #${job.id}` })
    setEditName(job.name || `Report #${job.id}`)
  }

  const closeRenameModal = () => {
    setRenameModal(null)
    setEditName('')
  }

  // Delete state
  const [jobToDelete, setJobToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const exportReportAsPDF = () => {
    try {
      const element = reportRef.current
      if (!element) return

      // Inject White-Label Branding
      const agencyName = localStorage.getItem('agencyName')
      const logoUrl = localStorage.getItem('logoUrl')
    
    let brandingDiv = null
    if (agencyName || logoUrl) {
      brandingDiv = document.createElement('div')
      brandingDiv.className = 'flex items-center gap-4 mb-8 p-6 bg-slate-900 rounded-2xl border border-white/10'
      if (logoUrl) {
        brandingDiv.innerHTML += `<img src="${logoUrl}" alt="Logo" class="h-12 w-auto object-contain rounded" crossorigin="anonymous" />`
      }
      if (agencyName) {
        brandingDiv.innerHTML += `<h2 class="text-2xl font-bold text-white">${agencyName}</h2>`
      }
      element.insertBefore(brandingDiv, element.firstChild)
    }

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: 'AdMind_History_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save().then(() => {
      // Clean up branding div after PDF is generated
      if (brandingDiv) {
        element.removeChild(brandingDiv)
      }
    })
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    }
  }

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      try {
        const data = await API.getHistory(page, 10)
        setJobs(data.items || [])
        setTotalPages(data.pages || 1)
      } catch (err) {
        console.error("Failed to fetch history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [page])

  const handleRename = async () => {
    if (!renameModal || !editName.trim()) {
      closeRenameModal()
      return
    }
    setRenameLoading(true)
    try {
      await API.renameAnalysis(renameModal.jobId, editName.trim())
      setJobs(jobs.map(j => j.id === renameModal.jobId ? { ...j, name: editName.trim() } : j))
      closeRenameModal()
    } catch (err) {
      console.error("Failed to rename analysis", err)
    } finally {
      setRenameLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!jobToDelete) return
    setDeleteLoading(true)
    try {
      await API.deleteAnalysis(jobToDelete)
      setJobs(jobs.filter(j => j.id !== jobToDelete))
      setJobToDelete(null)
      // Check if page needs to be adjusted?
      if (jobs.length === 1 && page > 1) {
        setPage(page - 1)
      } else if (jobs.length === 1) {
        // Just reload
        const data = await API.getHistory(1, 10)
        setJobs(data.items || [])
        setTotalPages(data.pages || 1)
      }
    } catch (err) {
      console.error("Failed to delete analysis", err)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-borderwarm border-t-brand-500"></div>
        <p className="text-textmuted font-medium">Loading history...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 glass-panel rounded-3xl p-8 border-borderwarm max-w-lg mx-auto">
        <div className="mx-auto w-16 h-16 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center mb-4 border border-brand-500/20 shadow-[0_0_15px_rgba(217,119,87,0.1)]">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-serif text-textprimary">No Analysis History Yet</h2>
        <p className="text-textmuted mt-2 text-sm leading-relaxed">
          Upload your campaign CSV on the Dashboard to get your first AI-driven marketing audit and start tracking performance!
        </p>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 btn-primary"
        >
          Go to Dashboard
        </motion.button>
      </div>
    )
  }

  // Process historical data for Recharts trends (reverse array to display chronologically)
  const chartData = [...jobs]
    .reverse()
    .map((job) => ({
      date: new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Spend: job.input_spend || 0,
      Revenue: job.input_revenue || 0,
      ROAS: job.input_spend > 0 ? (job.input_revenue / job.input_spend) : 0,
      id: job.id
    }))

  const showChart = chartData.length >= 2

  return (
    <div className="space-y-8 pb-16" ref={reportRef}>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-textprimary tracking-tight mb-2">Analysis History</h1>
          <p className="text-textmuted font-medium">Review your past campaign audits</p>
        </div>
        <div data-html2canvas-ignore="true">
          <button
            onClick={exportReportAsPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bgbase hover:bg-bgpanel border border-borderwarm rounded-xl text-textprimary font-medium text-sm transition-colors shadow-sm"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {showChart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 border-borderwarm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-textprimary">Advertising Performance Trends</h2>
              <p className="text-xs text-textmuted">Aggregated historical progress of analysed accounts</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97757" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D97757" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-warm)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                  formatter={(value, name) => [formatMoney(value), name]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Spend" 
                  stroke="#D97757" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif text-textprimary">Historical Analysis Reports</h3>
        <div className="grid gap-4">
          {jobs.map((job) => {
            const roas = job.input_spend > 0 ? (job.input_revenue / job.input_spend) : 0
            
            return (
              <motion.div
                whileHover={{ y: -2 }}
                key={job.id}
                className="glass-panel rounded-2xl p-6 border-borderwarm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-500/30"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 group/title">
                      <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[13px] font-bold px-2.5 py-0.5 rounded-lg tracking-wide">
                        {job.name || `Report #${job.id}`}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-textmuted">
                      <Calendar size={13} />
                      {new Date(job.created_at).toLocaleString()}
                    </span>
                    
                    {job.status === 'complete' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={12} /> Ready
                      </span>
                    )}
                    {job.status === 'processing' && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md animate-pulse">
                        <Clock size={12} /> Processing
                      </span>
                    )}
                    {job.status === 'error' && (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                        <AlertTriangle size={12} /> Failed
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-2 pt-1">
                    <p className="text-xs text-textmuted">
                      Volume: <span className="font-bold text-textprimary text-sm">{job.total_rows} rows</span>
                    </p>
                    <p className="text-xs text-textmuted">
                      Spend: <span className="font-bold text-textprimary text-sm">{formatMoney(job.input_spend)}</span>
                    </p>
                    <p className="text-xs text-textmuted">
                      Revenue: <span className="font-bold text-textprimary text-sm">{formatMoney(job.input_revenue)}</span>
                    </p>
                    <p className="text-xs text-textmuted">
                      ROAS: <span className={clsx(
                        "font-bold text-sm", 
                        roas >= 2 ? "text-emerald-400" : "text-amber-400"
                      )}>{roas.toFixed(2)}x</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => openRenameModal(job)}
                    className="flex items-center gap-1.5 px-3 py-2 text-textmuted hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-colors border border-transparent hover:border-brand-500/20 text-sm font-medium"
                    title="Rename Analysis"
                  >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Rename</span>
                  </button>
                  <button
                    onClick={() => setJobToDelete(job.id)}
                    className="p-2.5 text-textmuted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 shrink-0"
                    title="Delete Analysis"
                  >
                    <Trash2 size={18} />
                  </button>
                  {job.status === 'complete' ? (
                    <button
                      onClick={() => navigate(`/app/history/${job.id}`)}
                      className="flex-1 md:flex-none md:w-auto px-5 py-2.5 bg-bgpanelhover hover:bg-bgpanel text-textprimary font-medium rounded-xl text-sm transition-all border border-borderwarm hover:border-brand-500/50 text-center"
                    >
                      View Report
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 md:flex-none md:w-auto px-5 py-2.5 bg-white/5 text-[#6A655A] font-medium rounded-xl text-sm border border-transparent cursor-not-allowed text-center"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-white/5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-300" />
            </button>
            <span className="text-sm font-semibold text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {jobToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bgpanel border border-borderwarm rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent" />
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-textprimary">Delete Analysis?</h3>
                  <p className="text-sm text-textmuted mt-2">
                    Are you sure you want to delete this analysis report? This action cannot be undone and will permanently remove all associated data, chat history, and comments.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={() => setJobToDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-textprimary hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Report'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {renameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bgpanel border border-borderwarm rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500/50 to-transparent" />
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                  <Pencil size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif text-textprimary">Rename Analysis</h3>
                  <p className="text-sm text-textmuted mt-1 mb-4">
                    Give this report a memorable name
                  </p>
                  
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value.slice(0, 60))}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                      disabled={renameLoading}
                      placeholder="e.g. Q4 Google Campaign Audit"
                      className="w-full bg-bgbase border border-borderwarm text-textprimary px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-textmuted font-medium">
                      {editName.length} / 60
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={closeRenameModal}
                  disabled={renameLoading}
                  className="px-4 py-2 text-sm font-medium text-textprimary hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={renameLoading || !editName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {renameLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Name'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
