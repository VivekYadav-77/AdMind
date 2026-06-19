import { motion } from 'framer-motion'
import { CheckCircle2, FileSearch, Lightbulb, PenLine, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const agents = [
  { key: 'auditor', label: 'Audit Intelligence', icon: FileSearch, color: 'blue' },
  { key: 'strategist', label: 'Strategic Planning', icon: Lightbulb, color: 'indigo' },
  { key: 'copywriter', label: 'Creative Generation', icon: PenLine, color: 'purple' }
]

export default function AgentPipeline({ agentStatus }) {
  return (
    <section className="py-6">
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 w-3/4 -translate-x-1/2 h-32 bg-blue-400/10 blur-[100px] pointer-events-none" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center">
          {agents.map((agent, index) => {
            const Icon = agent.icon
            const status = agentStatus[agent.key]
            
            const isDone = status === 'done'
            const isRunning = status === 'running'
            const isIdle = status === 'idle'

            return (
              <div className="contents" key={agent.key}>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isRunning ? 1.02 : 1,
                    y: isRunning ? -4 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={clsx(
                    "relative flex min-h-[100px] flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-500",
                    isDone && "bg-white border-emerald-200 shadow-sm",
                    isRunning && "bg-white border-blue-300 shadow-xl shadow-blue-900/5 z-10",
                    isIdle && "bg-slate-50/50 border-slate-200 opacity-70"
                  )}
                >
                  {isRunning && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute inset-0 rounded-2xl border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] pointer-events-none"
                    />
                  )}
                  
                  <div className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-xl mb-3 transition-colors duration-500 relative",
                    isDone ? "bg-emerald-100 text-emerald-600" :
                    isRunning ? "bg-blue-100 text-blue-600" :
                    "bg-slate-200 text-slate-400"
                  )}>
                    <Icon size={24} strokeWidth={2} />
                    {isRunning && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-[-4px] rounded-xl border border-dashed border-blue-400/50"
                      />
                    )}
                  </div>
                  
                  <h3 className={clsx(
                    "font-semibold text-center mb-1",
                    isDone ? "text-slate-900" :
                    isRunning ? "text-blue-900" :
                    "text-slate-500"
                  )}>
                    {agent.label}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 h-6">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Complete
                      </span>
                    ) : isRunning ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 uppercase tracking-widest">
                        <Sparkles size={14} className="animate-pulse" /> Processing
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Waiting
                      </span>
                    )}
                  </div>
                </motion.div>

                {index < agents.length - 1 && (
                  <div className="hidden md:flex justify-center items-center">
                    <div className="h-0.5 w-12 bg-slate-200 rounded-full relative overflow-hidden">
                      {/* Animated connecting line if previous is done and next is running */}
                      {agentStatus[agents[index].key] === 'done' && (
                        <motion.div 
                          className="absolute inset-0 bg-blue-400"
                          initial={{ x: "-100%" }}
                          animate={{ x: agentStatus[agents[index+1].key] !== 'idle' ? "0%" : "-100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
