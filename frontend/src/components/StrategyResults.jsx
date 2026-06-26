import { motion } from 'framer-motion'
import { ArrowUpRight, Lightbulb, Play, Pause, RefreshCw, Layers } from 'lucide-react'

function actionIcon(action) {
  if (action === 'pause') return Pause
  if (action === 'increase_budget') return ArrowUpRight
  if (action === 'test_new_copy' || action === 'test') return Play
  if (action === 'restructure') return Layers
  return RefreshCw
}

function actionClass(action) {
  if (action === 'pause') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (action === 'increase_budget') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (action === 'test_new_copy' || action === 'test') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (action === 'restructure') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-white/10 text-slate-300 border-white/20'
}

export default function StrategyResults({ strategy }) {
  if (!strategy) return null

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass-panel rounded-3xl p-8 border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Strategy Recommendations</h2>
            <p className="text-slate-400 mt-1">Actionable insights to optimize your campaigns</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shadow-inner">
            <Lightbulb size={24} aria-hidden="true" />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-indigo-900/20 border border-indigo-500/20 p-6 text-sm leading-relaxed text-indigo-100 mb-10 shadow-[0_0_15px_rgba(79,70,229,0.1)]"
        >
          <span className="font-semibold mr-2 text-indigo-300">Strategist Summary:</span>
          {strategy.summary}
        </motion.div>

        <div className="grid gap-4">
          {strategy.recommendations.map((item, index) => {
            const Icon = actionIcon(item.action)
            return (
              <motion.article 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                key={`${item.priority}-${item.target}`} 
                className="group relative rounded-2xl border border-white/5 glass-panel p-6 shadow-sm hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/10 group-hover:bg-indigo-500 group-hover:shadow-[0_0_15px_rgba(79,70,229,0.8)] transition-all" />
                
                <div className="flex flex-col md:flex-row md:items-start gap-6 ml-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-400 shadow-sm">
                        #{item.priority}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${actionClass(item.action)}`}>
                        <Icon size={14} /> {item.action.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-white ml-1">{item.target}</h3>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-slate-300 mt-2">{item.reasoning}</p>
                  </div>
                  
                  <div className="md:w-64 shrink-0 rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Expected Impact</p>
                    <p className="text-sm font-medium text-white">{item.expected_impact}</p>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
