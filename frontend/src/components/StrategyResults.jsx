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
  if (action === 'pause') return 'bg-red-100 text-red-700 border-red-200'
  if (action === 'increase_budget') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (action === 'test_new_copy' || action === 'test') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (action === 'restructure') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function StrategyResults({ strategy }) {
  if (!strategy) return null

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Strategy Recommendations</h2>
            <p className="text-slate-500 mt-1">Actionable insights to optimize your campaigns</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-inner">
            <Lightbulb size={24} aria-hidden="true" />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-6 text-sm leading-relaxed text-indigo-900 mb-10"
        >
          <span className="font-semibold mr-2">Strategist Summary:</span>
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
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                
                <div className="flex flex-col md:flex-row md:items-start gap-6 ml-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
                        #{item.priority}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${actionClass(item.action)}`}>
                        <Icon size={14} /> {item.action.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 ml-1">{item.target}</h3>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-slate-600 mt-2">{item.reasoning}</p>
                  </div>
                  
                  <div className="md:w-64 shrink-0 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Expected Impact</p>
                    <p className="text-sm font-medium text-slate-900">{item.expected_impact}</p>
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
