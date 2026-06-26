import { Calendar, CheckCircle2, Clock, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

import { API } from '../services/api'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function History() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await API.getHistory()
        setJobs(data)
      } catch (err) {
        console.error("Failed to fetch history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500"></div>
        <p className="text-slate-400 font-medium">Loading history...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 glass-panel rounded-3xl p-8 border-white/10 max-w-lg mx-auto">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Analysis History Yet</h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          Upload your campaign CSV on the Dashboard to get your first AI-driven marketing audit and start tracking performance!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
        >
          Go to Dashboard
        </button>
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
    <div className="space-y-8 pb-16">
      
      {/* Aggregated Trends Chart Section */}
      {showChart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <TrendingUp size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Advertising Performance Trends</h2>
              <p className="text-xs text-slate-400">Aggregated historical progress of analysed accounts</p>
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111625',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#e2e8f0'
                  }}
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
                  stroke="#3b82f6" 
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
        <h3 className="text-lg font-bold text-white">Historical Analysis Reports</h3>
        <div className="grid gap-4">
          {jobs.map((job) => {
            const roas = job.input_spend > 0 ? (job.input_revenue / job.input_spend) : 0
            
            return (
              <motion.div
                whileHover={{ y: -2 }}
                key={job.id}
                className="glass-panel rounded-2xl p-6 border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                      Report #{job.id}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
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
                    <p className="text-xs text-slate-400">
                      Volume: <span className="font-bold text-slate-200 text-sm">{job.total_rows} rows</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Spend: <span className="font-bold text-slate-200 text-sm">{formatMoney(job.input_spend)}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Revenue: <span className="font-bold text-slate-200 text-sm">{formatMoney(job.input_revenue)}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      ROAS: <span className={clsx(
                        "font-bold text-sm", 
                        roas >= 2 ? "text-emerald-400" : "text-amber-400"
                      )}>{roas.toFixed(2)}x</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {job.status === 'complete' ? (
                    <button
                      onClick={() => navigate(`/history/${job.id}`)}
                      className="w-full md:w-auto px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold rounded-xl text-sm transition-all border border-blue-500/30 hover:scale-105"
                    >
                      View Report
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full md:w-auto px-5 py-2.5 bg-white/5 text-slate-500 font-semibold rounded-xl text-sm border border-white/5 cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
