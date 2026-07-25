import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, Zap, ArrowRight, LayoutDashboard, Search, Users, Swords, 
  GitCompare, History as HistoryIcon, Target, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, DollarSign
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'
import html2pdf from 'html2pdf.js'

import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { API } from '../services/api'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspace()
  
  const firstName = user?.email?.split('@')[0] || 'User'
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const reportRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    latestRoas: 0,
    totalSpend: 0,
    avgEfficiency: 0
  })

  // A/B tests
  const [abTests, setAbTests] = useState([])

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        const [historyData, trendsData] = await Promise.all([
          API.getHistory(1, 5),
          API.getTrends()
        ])

        const jobs = historyData.items || []
        setRecentJobs(jobs)
        setTrends(trendsData || [])

        // Calculate stats
        const totalSpend = jobs.reduce((sum, job) => sum + (job.input_spend || 0), 0)
        
        let latestRoas = 0
        let avgEfficiency = 0
        if (trendsData && trendsData.length > 0) {
          latestRoas = trendsData[trendsData.length - 1].roas
          const totalEfficiency = trendsData.reduce((sum, t) => sum + t.efficiency, 0)
          avgEfficiency = Math.round(totalEfficiency / trendsData.length)
        }

        setStats({
          totalAnalyses: historyData.total || 0,
          latestRoas,
          totalSpend,
          avgEfficiency
        })
        
        // Local AB tests
        const savedTests = localStorage.getItem('ab_tests')
        if (savedTests) {
          setAbTests(JSON.parse(savedTests))
        }

      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    
    // add small delay so token is ready
    setTimeout(() => {
      fetchDashboardData()
    }, 100)
  }, [activeWorkspace])

  // Process chart data for sparkline
  const chartData = [...trends].map(t => ({
    date: t.date,
    ROAS: t.roas,
    Efficiency: t.efficiency
  }))

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
      filename: 'AdMind_Report.pdf',
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

  const runningAbTests = abTests.filter(t => t.status === 'Running')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-brand-500 font-semibold mb-1 text-sm">{activeWorkspace?.name || 'Your Workspace'}</p>
          <h1 className="text-3xl font-serif text-textprimary tracking-tight mb-2">
            {getGreeting()}, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="text-textmuted font-medium">Here's what's happening with your campaigns today.</p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Zap size={18} />
          Run New Analysis
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="card-warm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-textmuted mb-1">Total Analyses</p>
              <h3 className="text-2xl font-bold text-textprimary">{stats.totalAnalyses}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <HistoryIcon size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.15}} className="card-warm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-textmuted mb-1">Latest ROAS</p>
              <h3 className="text-2xl font-bold text-textprimary">{stats.latestRoas.toFixed(2)}x</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="card-warm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-textmuted mb-1">Spend Analyzed</p>
              <h3 className="text-2xl font-bold text-textprimary">{formatMoney(stats.totalSpend)}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <DollarSign size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}} className="card-warm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-textmuted mb-1">Avg Efficiency</p>
              <h3 className="text-2xl font-bold text-textprimary">{stats.avgEfficiency}%</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Target size={20} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sparkline + Recent Jobs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trend Chart */}
          <div className="card-warm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-textprimary">Performance Trend</h2>
            </div>
            
            {!showChart ? (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-bgbase rounded-xl border border-dashed border-borderwarm p-6">
                <BarChart3 size={32} className="text-textmuted mb-3 opacity-50" />
                <h3 className="text-textprimary font-medium mb-1">No data available yet</h3>
                <p className="text-sm text-textmuted max-w-sm">Run your first campaign analysis to see your ROAS and efficiency trends here.</p>
                <button onClick={() => navigate('/analyze')} className="mt-4 text-sm font-medium text-brand-500 hover:text-brand-600">Run Analysis →</button>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorROAS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-warm)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Area type="monotone" dataKey="ROAS" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorROAS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div ref={reportRef} className="bg-transparent min-h-[500px] p-2">
            <AnimatePresence mode="wait">
              {activeTab === 'audit' && results.audit && (
                <motion.div key="audit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <AuditResults audit={results.audit} />
                </motion.div>
              )}
              {activeTab === 'strategy' && results.strategy && (
                <motion.div key="strategy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <StrategyResults strategy={results.strategy} jobId={jobId} />
                </motion.div>
              )}
              {activeTab === 'copy' && results.copy && (
                <motion.div key="copy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <CopyResults copy={results.copy} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {recentJobs.length === 0 ? (
              <p className="text-sm text-textmuted py-4 text-center">No analyses found.</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map(job => {
                  const roas = job.input_spend > 0 ? (job.input_revenue / job.input_spend) : 0
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-xl bg-bgbase border border-borderwarm hover:border-brand-500/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-bgpanel border border-borderwarm flex items-center justify-center shadow-sm">
                          {job.status === 'complete' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                           job.status === 'processing' ? <Clock size={18} className="text-amber-500" /> :
                           <AlertTriangle size={18} className="text-red-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-textprimary text-sm">Report #{job.id}</span>
                            <span className="text-xs text-textmuted">{new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-textmuted">Spend: <strong className="text-textprimary">{formatMoney(job.input_spend)}</strong></span>
                            <span className="text-textmuted">ROAS: <strong className={roas >= 2 ? 'text-emerald-500' : 'text-textprimary'}>{roas.toFixed(2)}x</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(job.status === 'complete' ? `/history/${job.id}` : '#')}
                        disabled={job.status !== 'complete'}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-bgpanel text-textprimary text-xs font-semibold rounded-lg border border-borderwarm hover:border-brand-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        View
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Quick Actions + A/B Widget */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="card-warm p-6">
            <h2 className="text-lg font-serif font-bold text-textprimary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/analyze')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-bgbase hover:bg-brand-500/5 border border-borderwarm hover:border-brand-500/30 transition-colors gap-2 text-center group">
                <Zap size={20} className="text-brand-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-textprimary">Run Analysis</span>
              </button>
              
              <button onClick={() => navigate('/tools')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-bgbase hover:bg-emerald-500/5 border border-borderwarm hover:border-emerald-500/30 transition-colors gap-2 text-center group">
                <Search size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-textprimary">Landing Audit</span>
              </button>

              <button onClick={() => navigate('/tools')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-bgbase hover:bg-blue-500/5 border border-borderwarm hover:border-blue-500/30 transition-colors gap-2 text-center group">
                <Users size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-textprimary">Build Audience</span>
              </button>

              <button onClick={() => navigate('/ab-tracker')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-bgbase hover:bg-purple-500/5 border border-borderwarm hover:border-purple-500/30 transition-colors gap-2 text-center group">
                <GitCompare size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-textprimary">A/B Tracker</span>
              </button>
            </div>
          </div>

          {/* Active A/B Tests */}
          <div className="card-warm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-textprimary">Active A/B Tests</h2>
              <span className="bg-brand-500/10 text-brand-500 text-xs font-bold px-2 py-1 rounded-md">
                {runningAbTests.length} Running
              </span>
            </div>
            
            {runningAbTests.length === 0 ? (
              <div className="text-center py-6 px-4 bg-bgbase rounded-xl border border-dashed border-borderwarm">
                <GitCompare size={24} className="mx-auto text-textmuted mb-2 opacity-50" />
                <p className="text-sm text-textmuted">No active tests.</p>
                <button onClick={() => navigate('/ab-tracker')} className="mt-2 text-xs font-medium text-brand-500 hover:text-brand-600">Start a Test →</button>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {runningAbTests.slice(0, 3).map(test => (
                  <div key={test.id} className="p-3 bg-bgbase rounded-lg border border-borderwarm text-sm">
                    <div className="font-semibold text-textprimary truncate">{test.name}</div>
                    <div className="text-xs text-textmuted flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Gathering data...
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {runningAbTests.length > 0 && (
              <button 
                onClick={() => navigate('/ab-tracker')} 
                className="w-full py-2.5 text-sm font-medium text-textprimary bg-bgbase hover:bg-bgpanelhover rounded-xl border border-borderwarm transition-colors"
              >
                Manage Tests
              </button>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
