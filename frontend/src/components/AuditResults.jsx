import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Monitor, Users, TrendingDown, ArrowRight, BarChart3, Bot, Target } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import clsx from 'clsx'

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  if (severity === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function AuditResults({ audit }) {
  if (!audit) return null

  const efficientSpend = Math.max(0, audit.total_spend - audit.inefficient_spend)
  const pieData = [
    { name: 'Efficient Spend', value: efficientSpend, color: '#3b82f6' },
    { name: 'Inefficient Spend', value: audit.inefficient_spend, color: '#ef4444' }
  ]

  const topWasted = [...audit.issues]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map(issue => ({
      name: issue.keyword.length > 15 ? issue.keyword.substring(0, 15) + '...' : issue.keyword,
      fullKeyword: issue.keyword,
      Impacted: issue.spend
    }))

  const stats = [
    ['Total Spend', money(audit.total_spend), 'text-white'],
    ['Total Revenue', money(audit.total_revenue), 'text-emerald-400'],
    ['ROAS', `${Number(audit.total_roas || 0).toFixed(2)}x`, 'text-blue-400'],
    ['Inefficient Spend', money(audit.inefficient_spend), 'text-red-400']
  ]

  const anomalies = audit.segment_anomalies || []

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="py-4"
    >
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-10 border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-2xl bg-black/40">
        {/* Deep background glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div variants={itemVariants} className="flex items-center gap-5 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-400/20 backdrop-blur-md">
            <BarChart3 size={28} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Audit Intelligence</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">Deep-dive analysis of your campaign performance</p>
          </div>
        </motion.div>

        {/* AI Structured Summary */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {/* Overview Card */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-3xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-400/20 p-6 text-[14px] leading-relaxed text-blue-50 shadow-[0_0_20px_rgba(59,130,246,0.1)] backdrop-blur-xl overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:shadow-[0_0_20px_#3b82f6] transition-all" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <span className="font-bold text-blue-400 uppercase tracking-widest text-[10px] mb-1.5 block">Overview</span>
                <p className="font-medium text-slate-200">{audit.summary?.overview}</p>
              </div>
            </div>
          </motion.div>

          {/* Critical Finding Card */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-3xl bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/20 p-6 text-[14px] leading-relaxed text-red-50 shadow-[0_0_20px_rgba(239,68,68,0.1)] backdrop-blur-xl overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:shadow-[0_0_20px_#ef4444] transition-all" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-xl text-red-400 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="font-bold text-red-400 uppercase tracking-widest text-[10px] mb-1.5 block">Critical Finding</span>
                <p className="font-medium text-slate-200">{audit.summary?.critical_finding}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Required Card */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-3xl bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 p-6 text-[14px] leading-relaxed text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-xl overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:shadow-[0_0_20px_#10b981] transition-all" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                <Target size={18} />
              </div>
              <div>
                <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] mb-1.5 block">Immediate Action</span>
                <p className="font-medium text-slate-200">{audit.summary?.action_required}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Top Stats */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map(([label, value, colorClass], i) => (
            <motion.div 
              variants={itemVariants}
              key={label} 
              className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] transition-all overflow-hidden group backdrop-blur-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
              <p className={clsx("text-3xl font-black flex items-center gap-2", colorClass)}>
                {value}
                {label === 'Inefficient Spend' && <TrendingDown size={24} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={containerVariants} className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Spend Efficiency Pie Chart */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg flex flex-col items-center backdrop-blur-lg">
            <h3 className="text-sm font-black text-slate-300 w-full text-left mb-6 uppercase tracking-widest">Spend Efficiency</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 4px 6px ${entry.color}40)` }} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => money(value)}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white drop-shadow-md">{Math.round((efficientSpend / audit.total_spend) * 100)}%</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Efficient</span>
              </div>
            </div>
            <div className="flex gap-6 text-xs font-bold mt-4">
              <span className="flex items-center gap-2 text-blue-400">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> Efficient
              </span>
              <span className="flex items-center gap-2 text-red-400">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> Inefficient
              </span>
            </div>
          </motion.div>

          {/* Top Wasted Spend Bar Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg flex flex-col backdrop-blur-lg">
            <h3 className="text-sm font-black text-slate-300 mb-6 uppercase tracking-widest">Highest Impact Issues (by Spend)</h3>
            <div className="h-48 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWasted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    labelStyle={{ color: '#cbd5e1', marginBottom: '6px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#ef4444', fontWeight: '900', fontSize: '16px' }}
                    formatter={(value) => [money(value), 'Impacted Spend']}
                  />
                  <Bar dataKey="Impacted" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* Critical Issues List */}
        <motion.div variants={containerVariants} className="mb-12">
          <motion.h3 variants={itemVariants} className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <AlertTriangle size={20} />
            </div>
            Underperforming Keywords
          </motion.h3>
          <div className="grid gap-4">
            {audit.issues.map((issue, index) => (
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                key={`${issue.keyword}-${index}`} 
                className="group flex flex-col md:flex-row md:items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all backdrop-blur-md shadow-sm hover:shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-lg font-black text-white truncate">{issue.keyword}</h4>
                    <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-lg border border-white/10 shadow-inner">
                      {issue.campaign_name}
                    </span>
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${severityClass(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{issue.detail}</p>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 md:ml-4 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Issue Type</p>
                    <p className="text-sm font-bold text-slate-200 capitalize">{issue.issue_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-6">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Impacted Spend</p>
                    <p className="text-xl font-black text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">{money(issue.spend)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Segment Anomalies Section */}
        {anomalies.length > 0 && (
          <motion.div variants={containerVariants}>
            <motion.div variants={itemVariants} className="mb-6 flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-500/30">
                <AlertTriangle size={24} className="text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-white tracking-tight">Hidden Segment Anomalies</h3>
                  <span className="rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-500/30 shadow-inner">
                    {anomalies.length} found
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  Performance gaps isolated to specific devices, locations, or age groups.
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {anomalies.map((anomaly, index) => {
                const Icon = segmentIcon(anomaly.segment_type)
                return (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    key={`anomaly-${index}`}
                    className="relative flex flex-col rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-black/40 p-6 shadow-xl overflow-hidden group backdrop-blur-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                          <Icon size={20} aria-hidden="true" />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-slate-200 border border-white/10 shadow-inner">
                          {segmentLabel(anomaly.segment_type)}: <span className="text-amber-400">{anomaly.segment_value}</span>
                        </span>
                      </div>
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${severityClass(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap items-baseline gap-2 bg-black/40 p-3 rounded-xl border border-white/10 shadow-inner">
                      <ArrowRight size={16} className="text-slate-500" />
                      <span className="text-base font-black text-white">{anomaly.keyword}</span>
                      <span className="text-xs font-bold text-slate-400">in {anomaly.campaign_name}</span>
                    </div>
                    
                    <p className="text-sm text-slate-300 mt-2 flex-1 leading-relaxed font-medium">{anomaly.detail}</p>
                    
                    <div className="mt-6 pt-5 border-t border-amber-500/20 flex justify-between items-center text-xs font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Impacted Segment Spend</span>
                      <span className="text-amber-400 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">{money(anomaly.spend)}</span>
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
