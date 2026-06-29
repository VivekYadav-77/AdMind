import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Monitor, Users, TrendingDown, ArrowRight, BarChart3 } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import clsx from 'clsx'

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
  if (severity === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
}

function segmentIcon(segmentType) {
  if (segmentType === 'device') return Monitor
  if (segmentType === 'location') return MapPin
  if (segmentType === 'age_group') return Users
  return AlertTriangle
}

function segmentLabel(segmentType) {
  if (segmentType === 'device') return 'Device'
  if (segmentType === 'location') return 'Location'
  if (segmentType === 'age_group') return 'Age Group'
  return 'Segment'
}

export default function AuditResults({ audit }) {
  if (!audit) return null

  const efficientSpend = Math.max(0, audit.total_spend - audit.wasted_spend)
  const pieData = [
    { name: 'Efficient Spend', value: efficientSpend, color: '#3b82f6' }, // blue-500
    { name: 'Wasted Spend', value: audit.wasted_spend, color: '#ef4444' } // red-500
  ]

  // Top 5 wasted spend for BarChart
  const topWasted = [...audit.issues]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map(issue => ({
      name: issue.keyword.length > 15 ? issue.keyword.substring(0, 15) + '...' : issue.keyword,
      fullKeyword: issue.keyword,
      Wasted: issue.spend
    }))

  const stats = [
    ['Total Spend', money(audit.total_spend), 'text-white'],
    ['Total Revenue', money(audit.total_revenue), 'text-emerald-400'],
    ['ROAS', `${Number(audit.total_roas || 0).toFixed(2)}x`, 'text-blue-400'],
    ['Wasted Spend', money(audit.wasted_spend), 'text-red-400']
  ]

  const anomalies = audit.segment_anomalies || []

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 shadow-inner">
            <BarChart3 size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Audit Intelligence</h2>
            <p className="text-slate-400 text-sm mt-0.5">Deep-dive analysis of your campaign performance</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/20 p-6 text-sm leading-relaxed text-blue-100 mb-10 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-sm"
        >
          <span className="font-bold mr-2 text-blue-400 uppercase tracking-wider text-xs border border-blue-500/30 bg-blue-500/10 px-2 py-1 rounded">Executive Summary</span>
          <span className="ml-2 block mt-3 text-[15px]">{audit.summary}</span>
        </motion.div>
        
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(([label, value, colorClass], i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
              key={label} 
              className="relative rounded-2xl border border-white/5 glass-panel p-5 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
              <p className={clsx("text-2xl lg:text-3xl font-black flex items-center gap-2", colorClass)}>
                {value}
                {label === 'Wasted Spend' && <TrendingDown size={20} className="text-red-500" />}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Spend Efficiency Pie Chart */}
          <div className="rounded-2xl border border-white/5 glass-panel p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-300 w-full text-left mb-4 uppercase tracking-wider">Spend Efficiency</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => money(value)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{Math.round((efficientSpend / audit.total_spend) * 100)}%</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Efficient</span>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-bold mt-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Efficient
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Wasted
              </span>
            </div>
          </div>

          {/* Top Wasted Spend Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 glass-panel p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Top 5 Wasted Spend Keywords</h3>
            <div className="h-48 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWasted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                    formatter={(value) => [money(value), 'Wasted Spend']}
                  />
                  <Bar dataKey="Wasted" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Critical Issues List */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Underperforming Keywords
          </h3>
          <div className="grid gap-3">
            {audit.issues.map((issue, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (index * 0.05) }}
                key={`${issue.keyword}-${index}`} 
                className="group flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h4 className="text-base font-bold text-white truncate">{issue.keyword}</h4>
                    <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {issue.campaign_name}
                    </span>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${severityClass(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1.5">{issue.detail}</p>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 md:ml-4 bg-black/20 p-3 rounded-lg border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Issue Type</p>
                    <p className="text-sm font-medium text-slate-300">{issue.issue_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-6">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Wasted</p>
                    <p className="text-lg font-black text-red-400">{money(issue.spend)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Segment Anomalies Section */}
        {anomalies.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <AlertTriangle size={20} className="text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Hidden Segment Anomalies</h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/30">
                    {anomalies.length} found
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Performance gaps isolated to specific devices, locations, or age groups.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {anomalies.map((anomaly, index) => {
                const Icon = segmentIcon(anomaly.segment_type)
                return (
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    key={`anomaly-${index}`}
                    className="relative flex flex-col rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900/80 to-amber-900/10 p-5 shadow-sm overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Icon size={18} aria-hidden="true" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 border border-white/10 shadow-sm">
                          {segmentLabel(anomaly.segment_type)}: <span className="text-amber-400">{anomaly.segment_value}</span>
                        </span>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${severityClass(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    
                    <div className="mb-2 flex flex-wrap items-baseline gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                      <ArrowRight size={14} className="text-slate-500" />
                      <span className="text-sm font-bold text-white">{anomaly.keyword}</span>
                      <span className="text-[11px] text-slate-400">in {anomaly.campaign_name}</span>
                    </div>
                    
                    <p className="text-sm text-slate-300 mt-2 flex-1 leading-relaxed">{anomaly.detail}</p>
                    
                    <div className="mt-5 pt-4 border-t border-amber-500/20 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Wasted Segment Spend</span>
                      <span className="text-amber-400 text-base">{money(anomaly.spend)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
