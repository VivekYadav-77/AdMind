import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export default function CampaignHealthScore({ audit }) {
  if (!audit || !audit.total_spend) return null

  const efficiency = Math.max(0, audit.total_spend - audit.wasted_spend) / audit.total_spend
  const roas = audit.total_roas || 0
  
  let score = 0
  score += Math.min(50, efficiency * 50)
  score += Math.min(50, (roas / 3) * 50)
  
  const finalScore = Math.round(score)
  let grade = 'D'
  let color = '#ef4444'
  let shadow = 'rgba(239,68,68,0.5)'
  
  if (finalScore >= 90) { grade = 'A+'; color = '#10b981'; shadow = 'rgba(16,185,129,0.5)' }
  else if (finalScore >= 80) { grade = 'A'; color = '#10b981'; shadow = 'rgba(16,185,129,0.5)' }
  else if (finalScore >= 70) { grade = 'B'; color = '#3b82f6'; shadow = 'rgba(59,130,246,0.5)' }
  else if (finalScore >= 60) { grade = 'C'; color = '#f59e0b'; shadow = 'rgba(245,158,11,0.5)' }

  const data = [
    { name: 'Score', value: finalScore },
    { name: 'Remainder', value: 100 - finalScore }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="glass-panel border-white/10 p-6 lg:px-10 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] transition-all mb-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
      
      {/* Decorative Blur */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-40"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center gap-5 z-10 w-full md:w-auto">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner backdrop-blur-md">
          <Activity size={28} style={{ color }} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Campaign Health Score</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">AI generated score based on ROAS & Efficiency</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6 z-10 w-full md:w-auto justify-end">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Total Score</p>
          <p className="text-3xl font-black text-white">{finalScore}<span className="text-lg text-slate-500">/100</span></p>
        </div>
        
        <div className="relative w-28 h-28 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={38}
                outerRadius={48}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                <Cell fill={color} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl font-black" 
              style={{ color, textShadow: `0 0 20px ${shadow}` }}
            >
              {grade}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
