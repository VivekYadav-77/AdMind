import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Monitor, Users, TrendingDown } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import clsx from 'clsx'

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (severity === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
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
  const chartData = [
    { name: 'Efficient Spend', value: efficientSpend, color: '#3b82f6' }, // blue-500
    { name: 'Wasted Spend', value: audit.wasted_spend, color: '#ef4444' } // red-500
  ]

  const stats = [
    ['Total Spend', money(audit.total_spend)],
    ['Total Revenue', money(audit.total_revenue)],
    ['ROAS', `${Number(audit.total_roas || 0).toFixed(2)}x`],
    ['Wasted Spend', money(audit.wasted_spend), 'text-red-600']
  ]

  const anomalies = audit.segment_anomalies || []

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass-panel rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Audit Results</h2>
            <p className="text-slate-400 mt-1">AI-driven analysis of your campaign performance</p>
          </div>
        </div>
        
        {/* Top Stats & Chart */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {stats.map(([label, value, colorClass]) => (
              <div key={label} className="rounded-2xl border border-white/5 glass-panel p-6 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-shadow">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className={clsx("mt-2 text-3xl font-bold flex items-center gap-2", colorClass || "text-white glow-text")}>
                  {value}
                  {label === 'Wasted Spend' && <TrendingDown size={24} className="text-red-500" />}
                </p>
              </div>
            ))}
          </div>

          {/* Spend Efficiency Chart */}
          <div className="rounded-2xl border border-white/5 glass-panel p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-slate-400 w-full text-left mb-2">Spend Efficiency</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => money(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Efficient
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <div className="w-2 h-2 rounded-full bg-red-500" /> Wasted
              </span>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-blue-900/20 border border-blue-500/20 p-6 text-sm leading-relaxed text-blue-100 mb-10 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        >
          <span className="font-semibold mr-2 text-blue-300">Auditor Summary:</span>
          {audit.summary}
        </motion.div>

        {/* Standard Issues Table */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Underperforming Keywords</h3>
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-sm bg-slate-900/50">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-5">Keyword</th>
                  <th className="px-6 py-5">Campaign</th>
                  <th className="px-6 py-5">Issue Type</th>
                  <th className="px-6 py-5">Severity</th>
                  <th className="px-6 py-5 text-right">Spend</th>
                  <th className="px-6 py-5 w-1/3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {audit.issues.map((issue, index) => (
                  <tr key={`${issue.keyword}-${index}`} className="even:bg-white/5 hover:bg-blue-500/10 transition-colors">
                    <td className="px-6 py-5 font-bold text-white">{issue.keyword}</td>
                    <td className="px-6 py-5 text-slate-300 font-medium">{issue.campaign_name}</td>
                    <td className="px-6 py-5 text-slate-300">{issue.issue_type}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold border ${severityClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white font-bold text-right">{money(issue.spend)}</td>
                    <td className="px-6 py-5 text-slate-300 leading-relaxed text-sm whitespace-normal">
                      {issue.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Segment Anomalies Section */}
        {anomalies.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle size={20} className="text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Hidden Segment Anomalies</h3>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
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
                    whileHover={{ y: -2 }}
                    key={`anomaly-${index}`}
                    className="flex flex-col rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-slate-900/50 p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                          <Icon size={16} aria-hidden="true" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs font-bold text-slate-200 ring-1 ring-white/10 shadow-sm">
                          {segmentLabel(anomaly.segment_type)}: {anomaly.segment_value}
                        </span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${severityClass(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-white">{anomaly.keyword}</span>
                      <span className="text-xs text-slate-400 truncate">in {anomaly.campaign_name}</span>
                    </div>
                    
                    <p className="text-sm text-slate-300 flex-1">{anomaly.detail}</p>
                    
                    <div className="mt-4 pt-4 border-t border-amber-500/20 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400 uppercase tracking-wider">Wasted Segment Spend</span>
                      <span className="text-amber-400 text-sm">{money(anomaly.spend)}</span>
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
