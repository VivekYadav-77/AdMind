import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { API } from '../services/api'

export default function HistoricalTrends() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await API.getTrends()
        // Recharts draws left to right, we want oldest on left, newest on right.
        // The API returns oldest first due to order_by(AnalysisJob.created_at), so it's ready!
        setData(response)
      } catch (err) {
        setError('Failed to load historical trends')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrends()
  }, [])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[2.5rem] border border-white/10 bg-black/20 backdrop-blur-lg">
        <Loader2 className="animate-spin text-indigo-400" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[2.5rem] border border-red-500/20 bg-red-500/5 backdrop-blur-lg text-red-400 gap-2">
        <AlertCircle size={20} />
        <p className="font-semibold text-sm">{error}</p>
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[2.5rem] border border-white/10 bg-black/20 backdrop-blur-lg text-slate-400">
        <div className="text-center">
          <TrendingUp className="mx-auto mb-2 opacity-50" size={24} />
          <p className="font-semibold text-sm">Not enough data</p>
          <p className="text-xs mt-1">Run at least two analyses to see your trends over time.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 w-full"
    >
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-10 border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-2xl bg-black/40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-5 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20 backdrop-blur-md">
            <TrendingUp size={28} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Campaign Health Trends</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">Historical progression of your ad account efficiency</p>
          </div>
        </div>

        <div className="h-80 w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ fontWeight: '900', fontSize: '14px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                name="Health Score" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency %" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorEff)" 
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  )
}
