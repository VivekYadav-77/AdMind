import { motion } from 'framer-motion'
import { ArrowUpRight, Lightbulb, Play, Pause, RefreshCw, Layers, Zap, Target, Gauge } from 'lucide-react'
import clsx from 'clsx'

function actionIcon(action) {
  if (action === 'pause') return Pause
  if (action === 'increase_budget') return ArrowUpRight
  if (action === 'test_new_copy' || action === 'test') return Play
  if (action === 'restructure') return Layers
  return RefreshCw
}

function actionClass(action) {
  if (action === 'pause') return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
  if (action === 'increase_budget') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
  if (action === 'test_new_copy' || action === 'test') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
  if (action === 'restructure') return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
  return 'bg-white/10 text-slate-300 border-white/20'
}

function getPriorityData(priority) {
  const p = String(priority).toLowerCase()
  if (p === 'high' || p === '1') return { color: 'red', label: 'High Priority', Icon: Zap, bg: 'from-red-900/20 to-transparent' }
  if (p === 'medium' || p === '2') return { color: 'amber', label: 'Medium Priority', Icon: Target, bg: 'from-amber-900/20 to-transparent' }
  return { color: 'emerald', label: 'Low Priority', Icon: Gauge, bg: 'from-emerald-900/20 to-transparent' }
}

export default function StrategyResults({ strategy }) {
  if (!strategy) return null

  // Group recommendations by priority
  const grouped = strategy.recommendations.reduce((acc, item) => {
    const p = String(item.priority).toLowerCase()
    const groupKey = (p === 'high' || p === '1') ? 'high' : (p === 'medium' || p === '2') ? 'medium' : 'low'
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(item)
    return acc
  }, { high: [], medium: [], low: [] })

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shadow-inner">
            <Lightbulb size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Strategy Recommendations</h2>
            <p className="text-slate-400 text-sm mt-0.5">Actionable insights to optimize your campaigns</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 p-6 text-sm leading-relaxed text-indigo-100 mb-10 shadow-[0_0_15px_rgba(79,70,229,0.15)] backdrop-blur-sm"
        >
          <span className="font-bold mr-2 text-indigo-400 uppercase tracking-wider text-xs border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 rounded">Strategist Summary</span>
          <span className="ml-2 block mt-3 text-[15px]">{strategy.summary}</span>
        </motion.div>

        <div className="space-y-10">
          {['high', 'medium', 'low'].map((groupKey) => {
            const items = grouped[groupKey]
            if (!items || items.length === 0) return null
            
            const { color, label, Icon, bg } = getPriorityData(groupKey)
            
            return (
              <div key={groupKey} className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-${color}-500/20 border border-${color}-500/30 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                    <Icon size={18} className={`text-${color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{label}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>
                
                <div className="grid gap-4">
                  {items.map((item, index) => {
                    const ActionIcon = actionIcon(item.action)
                    return (
                      <motion.article 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        key={`${item.target}-${index}`} 
                        className={`group relative rounded-2xl border border-white/5 bg-gradient-to-br ${bg} glass-panel p-6 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-white/10 transition-all overflow-hidden`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${color}-500/50 group-hover:bg-${color}-400 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all`} />
                        
                        <div className="flex flex-col md:flex-row md:items-start gap-6 ml-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${actionClass(item.action)}`}>
                                <ActionIcon size={14} /> {item.action.replace(/_/g, ' ')}
                              </span>
                              <h3 className="text-lg font-bold text-white truncate">{item.target}</h3>
                            </div>
                            
                            <p className="text-[15px] leading-relaxed text-slate-300 mt-3">{item.reasoning}</p>
                          </div>
                          
                          <div className="md:w-72 shrink-0 rounded-xl bg-black/30 p-5 border border-white/5 shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Expected Impact</p>
                              <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_5px_rgba(0,0,0,0.5)]`} />
                            </div>
                            <p className="text-sm font-semibold text-slate-200 leading-snug">{item.expected_impact}</p>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
