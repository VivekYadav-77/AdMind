import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Monitor, Users } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import clsx from 'clsx'

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function severityClass(severity) {
  if (severity === 'high') return 'bg-red-100 text-red-700 border-red-200'
  if (severity === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
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
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Audit Results</h2>
            <p className="text-slate-500 mt-1">AI-driven analysis of your campaign performance</p>
          </div>
        </div>
        
        {/* Top Stats & Chart */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {stats.map(([label, value, colorClass]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className={clsx("mt-2 text-3xl font-bold", colorClass || "text-slate-900")}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Spend Efficiency Chart */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-slate-500 w-full text-left mb-2">Spend Efficiency</h3>
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
          className="rounded-2xl bg-blue-50/50 border border-blue-100 p-6 text-sm leading-relaxed text-blue-900 mb-10"
        >
          <span className="font-semibold mr-2">Auditor Summary:</span>
          {audit.summary}
        </motion.div>

        {/* Standard Issues Table */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Underperforming Keywords</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-4">Keyword</th>
                  <th className="px-4 py-4">Campaign</th>
                  <th className="px-4 py-4">Issue Type</th>
                  <th className="px-4 py-4">Severity</th>
                  <th className="px-4 py-4 text-right">Spend</th>
                  <th className="px-4 py-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audit.issues.map((issue, index) => (
                  <tr key={`${issue.keyword}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{issue.keyword}</td>
                    <td className="px-4 py-4 text-slate-600">{issue.campaign_name}</td>
                    <td className="px-4 py-4 text-slate-600">{issue.issue_type}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${severityClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 font-medium text-right">{money(issue.spend)}</td>
                    <td className="px-4 py-4 text-slate-600 max-w-xs truncate" title={issue.detail}>{issue.detail}</td>
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
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle size={20} className="text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">Hidden Segment Anomalies</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {anomalies.length} found
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
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
                    className="flex flex-col rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <Icon size={16} aria-hidden="true" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 shadow-sm">
                          {segmentLabel(anomaly.segment_type)}: {anomaly.segment_value}
                        </span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${severityClass(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-slate-900">{anomaly.keyword}</span>
                      <span className="text-xs text-slate-500 truncate">in {anomaly.campaign_name}</span>
                    </div>
                    
                    <p className="text-sm text-slate-600 flex-1">{anomaly.detail}</p>
                    
                    <div className="mt-4 pt-4 border-t border-amber-100 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 uppercase tracking-wider">Wasted Segment Spend</span>
                      <span className="text-amber-700 text-sm">{money(anomaly.spend)}</span>
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
