import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Lightbulb, Play, Pause, RefreshCw, Layers, Zap, Target, Gauge, Bot, Download, MessageSquare, Send } from 'lucide-react'
import { API } from '../services/api'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import clsx from 'clsx'

function actionIcon(action) {
  if (action === 'pause') return Pause
  if (action === 'increase_budget') return ArrowUpRight
  if (action === 'test_new_copy' || action === 'test') return Play
  if (action === 'restructure') return Layers
  return RefreshCw
}

function actionClass(action) {
  if (action === 'pause') return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  if (action === 'increase_budget') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
  if (action === 'test_new_copy' || action === 'test') return 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
  if (action === 'restructure') return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
  return 'bg-white/10 text-slate-300 border-white/20'
}

function getPriorityData(priority) {
  const p = String(priority).toLowerCase()
  if (p === 'high' || p === '1') return { color: 'red', label: 'High Priority', Icon: Zap, bg: 'from-red-900/30 to-black/40', shadow: 'rgba(239,68,68,0.5)' }
  if (p === 'medium' || p === '2') return { color: 'amber', label: 'Medium Priority', Icon: Target, bg: 'from-amber-900/30 to-black/40', shadow: 'rgba(245,158,11,0.5)' }
  return { color: 'emerald', label: 'Low Priority', Icon: Gauge, bg: 'from-emerald-900/30 to-black/40', shadow: 'rgba(16,185,129,0.5)' }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

function RecommendationCard({ item, index, groupKey, getPriorityData, actionIcon, actionClass, jobId }) {
  const [comments, setComments] = useState(item.comments || [])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { color, shadow, bg } = getPriorityData(groupKey)
  const ActionIcon = actionIcon(item.action)

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !jobId) return

    setIsSubmitting(true)
    try {
      const res = await API.addStrategyComment(jobId, item.target, item.action, newComment.trim())
      setComments([...comments, res.comment])
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment', error)
      alert('Failed to add comment: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.article 
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative rounded-3xl border border-white/10 bg-gradient-to-br ${bg} p-6 shadow-xl hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:border-white/20 transition-all overflow-hidden backdrop-blur-xl flex flex-col`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500/50 group-hover:bg-${color}-400 transition-all`} style={{ boxShadow: `0 0 15px ${shadow}` }} />
      
      <div className="flex flex-col md:flex-row md:items-start gap-6 ml-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${actionClass(item.action)}`}>
              <ActionIcon size={14} /> {item.action.replace(/_/g, ' ')}
            </span>
            <h3 className="text-xl font-black text-white truncate">{item.target}</h3>
          </div>
          
          <p className="text-[15px] leading-relaxed text-slate-300 font-medium">{item.reasoning}</p>
        </div>
        
        <div className="md:w-80 shrink-0 rounded-2xl bg-black/50 p-5 border border-white/5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expected Impact</p>
            <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} style={{ boxShadow: `0 0 8px ${shadow}` }} />
          </div>
          <p className="text-[15px] font-bold text-slate-200 leading-snug mb-4">{item.expected_impact}</p>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 w-max"
          >
            <MessageSquare size={14} />
            {comments.length} Comments
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mt-6 border-t border-white/10 pt-6 ml-4 pr-4"
          >
            <div className="space-y-3 mb-4">
              {comments.map((c, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-300">{c.user}</span>
                    <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-sm text-slate-400">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-slate-500 text-center italic">No comments yet. Be the first!</p>
              )}
            </div>
            
            {jobId ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a comment..."
                  disabled={isSubmitting}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <p className="text-xs text-amber-500/80 mt-2">Cannot comment on sample reports.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default function StrategyResults({ strategy, jobId }) {
  if (!strategy) return null

  const handleExportCSV = () => {
    if (!strategy || !strategy.recommendations) return
    
    const headers = ['Priority', 'Action', 'Target', 'Reasoning', 'Expected Impact']
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""'
      // Replace newlines, tabs, and carriage returns with spaces to prevent row breaks
      const stringified = String(str).replace(/[\r\n\t]+/g, ' ').trim()
      // Always wrap in quotes and escape internal quotes to ensure robust structure
      return `"${stringified.replace(/"/g, '""')}"`
    }
    
    const rows = strategy.recommendations.map(r => [
      String(r.priority || '').charAt(0).toUpperCase() + String(r.priority || '').slice(1).toLowerCase(),
      String(r.action || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      r.target,
      r.reasoning,
      r.expected_impact
    ].map(escapeCsv).join(','))
    
    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'admind_strategy_plan.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group recommendations by priority
  const grouped = strategy.recommendations.reduce((acc, item) => {
    const p = String(item.priority).toLowerCase()
    const groupKey = (p === 'high' || p === '1') ? 'high' : (p === 'medium' || p === '2') ? 'medium' : 'low'
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(item)
    return acc
  }, { high: [], medium: [], low: [] })

  // Calculate Action Distribution for Radar Chart
  const actionCounts = strategy.recommendations.reduce((acc, item) => {
    const label = item.action.replace(/_/g, ' ')
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  
  const radarData = Object.entries(actionCounts).map(([subject, count]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    count,
    fullMark: Math.max(...Object.values(actionCounts)) + 1
  }))

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="py-4"
    >
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-10 border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-2xl bg-black/40">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div variants={itemVariants} className="flex items-center justify-between gap-5 mb-10 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-400/20 backdrop-blur-md">
              <Lightbulb size={28} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Strategy Recommendations</h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Actionable insights to optimize your campaigns</p>
            </div>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
          >
            <Download size={18} />
            <span>Export to CSV</span>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* AI Strategist Summary */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 relative rounded-3xl bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border border-indigo-400/20 p-8 text-[15px] leading-relaxed text-indigo-50 shadow-[0_0_30px_rgba(79,70,229,0.15)] backdrop-blur-xl overflow-hidden group flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:shadow-[0_0_20px_#6366f1] transition-all" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                <Bot size={20} />
              </div>
              <div>
                <span className="font-bold text-indigo-400 uppercase tracking-widest text-xs mb-2 block">AI Strategist Summary</span>
                <p className="font-medium text-slate-200">{strategy.summary}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Distribution Radar Chart */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg flex flex-col items-center backdrop-blur-lg">
            <h3 className="text-xs font-black text-slate-300 w-full text-center mb-2 uppercase tracking-widest">Strategic Focus</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Radar name="Actions" dataKey="count" stroke="#818cf8" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div variants={containerVariants} className="space-y-12">
          {['high', 'medium', 'low'].map((groupKey) => {
            const items = grouped[groupKey]
            if (!items || items.length === 0) return null
            
            const { color, label, Icon, bg, shadow } = getPriorityData(groupKey)
            
            return (
              <motion.div variants={itemVariants} key={groupKey} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-${color}-500/20 border border-${color}-500/30`} style={{ boxShadow: `0 0 15px ${shadow}` }}>
                    <Icon size={20} className={`text-${color}-400`} />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-widest uppercase">{label}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
                </div>
                
                <div className="grid gap-5">
                  {items.map((item, index) => (
                    <RecommendationCard
                      key={`${item.target}-${index}`}
                      item={item}
                      index={index}
                      groupKey={groupKey}
                      getPriorityData={getPriorityData}
                      actionIcon={actionIcon}
                      actionClass={actionClass}
                      jobId={jobId}
                    />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
