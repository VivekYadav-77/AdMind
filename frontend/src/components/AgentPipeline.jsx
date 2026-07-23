import { motion } from 'framer-motion'
import { CheckCircle2, FileSearch, Lightbulb, PenLine, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const agents = [
  { key: 'auditor', label: 'Audit Intelligence', icon: FileSearch, color: 'brand' },
  { key: 'strategist', label: 'Strategic Planning', icon: Lightbulb, color: 'amber' },
  { key: 'copywriter', label: 'Creative Generation', icon: PenLine, color: 'emerald' }
]

export default function AgentPipeline({ agentStatus }) {
  return (
    <section className="py-6">
      <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 w-3/4 -translate-x-1/2 h-32 bg-brand-500/10 blur-[100px] pointer-events-none" />

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
                    isDone && "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                    isRunning && "bg-brand-500/10 border-brand-500/40 shadow-[0_0_25px_rgba(217,119,87,0.2)] z-10",
                    isIdle && "bg-white/5 border-borderwarm opacity-50"
                  )}
                >
                  {isRunning && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="absolute inset-0 rounded-2xl border-2 border-brand-400 shadow-[0_0_20px_rgba(217,119,87,0.3)] pointer-events-none"
                    />
                  )}
                  
                  <div className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-xl mb-3 transition-colors duration-500 relative",
                    isDone ? "bg-emerald-500/20 text-emerald-400" :
                    isRunning ? "bg-brand-500/20 text-brand-400" :
                    "bg-white/10 text-[#A39E93]"
                  )}>
                    <Icon size={24} strokeWidth={2} />
                    {isRunning && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-[-4px] rounded-xl border border-dashed border-brand-400/50"
                      />
                    )}
                  </div>
                  
                  <h3 className={clsx(
                    "font-medium text-center mb-1",
                    isDone ? "text-[#FAF4EC]" :
                    isRunning ? "text-brand-400 glow-text" :
                    "text-[#8A857A]"
                  )}>
                    {agent.label}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 h-6">
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Complete
                      </span>
                    ) : isRunning ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                        <Sparkles size={14} className="animate-pulse" /> Processing
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#6A655A] uppercase tracking-widest">
                        Waiting
                      </span>
                    )}
                  </div>
                </motion.div>

                {index < agents.length - 1 && (
                  <div className="hidden md:flex justify-center items-center">
                    <div className="h-px w-12 bg-borderwarm relative overflow-hidden">
                      {/* Animated connecting line if previous is done and next is running */}
                      {agentStatus[agents[index].key] === 'done' && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_10px_rgba(217,119,87,0.8)]"
                          initial={{ x: "-100%" }}
                          animate={{ x: agentStatus[agents[index+1].key] !== 'idle' ? "100%" : "-100%" }}
                          transition={{ duration: 1.5, repeat: agentStatus[agents[index+1].key] === 'running' ? Infinity : 0, ease: "linear" }}
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
