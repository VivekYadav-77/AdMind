import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Lightbulb, Play, Pause, RefreshCw, Layers, Zap, Target, Gauge, Bot, Download, MessageSquare, Send } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useState, useEffect } from 'react'
import { API } from '../services/api'
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
  return 'bg-bgpanelhover text-textsecondary border-borderwarm'
}

function getPriorityData(priority) {
  const p = String(priority).toLowerCase()
  if (p === 'high' || p === '1') return { color: 'red', label: 'High Priority', Icon: Zap, bg: 'from-red-900/10 to-bgpanel', shadow: 'rgba(239,68,68,0.5)' }
  if (p === 'medium' || p === '2') return { color: 'amber', label: 'Medium Priority', Icon: Target, bg: 'from-amber-900/10 to-bgpanel', shadow: 'rgba(245,158,11,0.5)' }
  return { color: 'emerald', label: 'Low Priority', Icon: Gauge, bg: 'from-emerald-900/10 to-bgpanel', shadow: 'rgba(16,185,129,0.5)' }
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

export default function StrategyResults({ strategy, jobId, job }) {
  const [comments, setComments] = useState({}) // { [target_keyword]: [comment1, comment2] }
  const [newComment, setNewComment] = useState({}) // { [target_keyword]: "text" }
  const [activeCommentBox, setActiveCommentBox] = useState(null)

  useEffect(() => {
    if (jobId) {
      API.getComments(jobId).then(data => {
        const grouped = {}
        data.forEach(c => {
          if (!grouped[c.target_keyword]) grouped[c.target_keyword] = []
          grouped[c.target_keyword].push(c)
        })
        setComments(grouped)
      }).catch(console.error)
    }
  }, [jobId])

  const handleAddComment = async (keyword) => {
    const text = newComment[keyword]
    if (!text || !text.trim() || !jobId) return

    try {
      const added = await API.addComment(jobId, keyword, text)
      setComments(prev => ({
        ...prev,
        [keyword]: [...(prev[keyword] || []), added]
      }))
      setNewComment(prev => ({ ...prev, [keyword]: '' }))
    } catch (err) {
      console.error(err)
    }
  }

  if (!strategy) return null

  const handleExportCSV = () => {
    if (!strategy || !strategy.recommendations) return
    
    const agencyName = localStorage.getItem('agencyName') || 'AdMind'
    const reportDate = job?.created_at ? new Date(job.created_at).toLocaleString() : new Date().toLocaleString()
    
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""'
      const stringified = String(str).replace(/[\r\n\t]+/g, ' ').trim()
      return `"${stringified.replace(/"/g, '""')}"`
    }
    
    const getPriorityLabel = (priority) => {
      const p = String(priority).toLowerCase()
      if (p === 'high' || p === '1') return 'High'
      if (p === 'medium' || p === '2') return 'Medium'
      return 'Low'
    }

    // 1. Metadata Block
    const metadataLines = [
      [agencyName + ' Strategy Recommendations Plan'],
      ['Report ID', jobId || 'N/A'],
      ['Export Date', reportDate],
      ['Total Recommendations', strategy.recommendations.length],
      [] // Empty separator
    ].map(row => row.map(escapeCsv).join(','))

    // 2. Main Recommendations Table
    const headers = ['Priority', 'Action', 'Target', 'Reasoning', 'Expected Impact']
    const headerRow = headers.map(escapeCsv).join(',')
    
    const rows = strategy.recommendations.map(r => [
      getPriorityLabel(r.priority),
      String(r.action || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      r.target,
      r.reasoning,
      r.expected_impact
    ].map(escapeCsv).join(','))

    // 3. AI Strategist Summary Row
    const summaryLines = [
      [], // Empty separator
      ['AI Strategist Summary'],
      [strategy.summary || '']
    ].map(row => row.map(escapeCsv).join(','))
    
    // Combine all sections with CRLF (\r\n) for Excel compatibility on Windows
    const csvContent = [...metadataLines, headerRow, ...rows, ...summaryLines].join('\r\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    const dateStr = job?.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    link.setAttribute('download', `admind-strategy-${jobId || 'export'}-${dateStr}.csv`)
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
      <div className="glass-panel rounded-[2.5rem] p-6 lg:p-10 border-borderwarm relative overflow-hidden shadow-2xl backdrop-blur-2xl bg-bgpanel">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div variants={itemVariants} className="flex items-center justify-between gap-5 mb-10 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-amber-500/30 text-brand-400 shadow-lg border border-brand-400/20 backdrop-blur-md">
              <Lightbulb size={28} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-textprimary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-textprimary to-textmuted">Strategy Recommendations</h2>
              <p className="text-textmuted text-sm mt-1 font-medium">Actionable insights to optimize your campaigns</p>
            </div>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl font-bold transition-all"
          >
            <Download size={18} />
            <span>Export to CSV</span>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* AI Strategist Summary */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 relative rounded-3xl bg-gradient-to-r from-brand-900/10 to-amber-900/10 border border-brand-400/20 p-8 text-[15px] leading-relaxed text-textprimary shadow-lg backdrop-blur-xl overflow-hidden group flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 group-hover:shadow-[0_0_20px_var(--brand-500)] transition-all" />
            <div className="flex items-start gap-4">
              <div className="p-2 bg-brand-500/20 rounded-xl text-brand-400 shadow-inner">
                <Bot size={20} />
              </div>
              <div>
                <span className="font-bold text-brand-400 uppercase tracking-widest text-xs mb-2 block">AI Strategist Summary</span>
                <p className="font-medium text-textsecondary">{strategy.summary}</p>
              </div>
            </div>
          </motion.div>

          {/* Action Distribution Radar Chart */}
          <motion.div variants={itemVariants} className="rounded-3xl border border-borderwarm bg-bgpanelhover p-6 shadow-lg flex flex-col items-center backdrop-blur-lg">
            <h3 className="text-xs font-black text-textsecondary w-full text-center mb-2 uppercase tracking-widest">Strategic Focus</h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border-warm)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', backdropFilter: 'blur(10px)', borderColor: 'var(--border-warm)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--brand-400)', fontWeight: 'bold' }}
                  />
                  <Radar name="Actions" dataKey="count" stroke="var(--brand-400)" fill="var(--brand-500)" fillOpacity={0.4} />
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
                  <h3 className="text-xl font-black text-textprimary tracking-widest uppercase">{label}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-borderwarm to-transparent ml-4" />
                </div>
                
                <div className="grid gap-5">
                  {items.map((item, index) => {
                    const ActionIcon = actionIcon(item.action)
                    return (
                      <motion.article 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        key={`${item.target}-${index}`} 
                        className={`group relative rounded-3xl border border-borderwarm bg-gradient-to-br ${bg} p-6 shadow-xl hover:shadow-2xl hover:border-brand-500/30 transition-all overflow-hidden backdrop-blur-xl`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500/50 group-hover:bg-${color}-400 transition-all`} style={{ boxShadow: `0 0 15px ${shadow}` }} />
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-6 ml-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${actionClass(item.action)}`}>
                                <ActionIcon size={14} /> {item.action.replace(/_/g, ' ')}
                              </span>
                              <h3 className="text-xl font-black text-textprimary truncate">{item.target}</h3>
                            </div>
                            
                            <p className="text-[15px] leading-relaxed text-textsecondary font-medium">{item.reasoning}</p>
                          </div>
                          
                          <div className="md:w-80 shrink-0 rounded-2xl bg-bgbase p-5 border border-borderwarm shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-textmuted">Expected Impact</p>
                              <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} style={{ boxShadow: `0 0 8px ${shadow}` }} />
                            </div>
                            <p className="text-[15px] font-bold text-textprimary leading-snug">{item.expected_impact}</p>
                            
                            <button 
                              onClick={() => setActiveCommentBox(activeCommentBox === item.target ? null : item.target)}
                              className="mt-4 flex items-center gap-1.5 text-xs font-bold text-textmuted hover:text-brand-500 transition-colors"
                            >
                              <MessageSquare size={14} /> 
                              {comments[item.target]?.length || 0} Comments
                            </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {activeCommentBox === item.target && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 pt-6 border-t border-borderwarm"
                            >
                              <div className="space-y-4 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {comments[item.target]?.map(c => (
                                  <div key={c.id} className="bg-bgbase p-3 rounded-xl border border-borderwarm">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{c.user_email}</span>
                                      <span className="text-[10px] text-textmuted">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-textprimary">{c.comment_text}</p>
                                  </div>
                                ))}
                                {(!comments[item.target] || comments[item.target].length === 0) && (
                                  <p className="text-sm text-textmuted italic">No comments yet. Start the discussion!</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Add a team comment..."
                                  value={newComment[item.target] || ''}
                                  onChange={e => setNewComment(prev => ({...prev, [item.target]: e.target.value}))}
                                  onKeyDown={e => e.key === 'Enter' && handleAddComment(item.target)}
                                  className="flex-1 bg-bgbase border border-borderwarm rounded-xl px-4 py-2 text-sm text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
                                />
                                <button 
                                  onClick={() => handleAddComment(item.target)}
                                  className="btn-primary p-2.5 rounded-xl flex items-center justify-center transition-colors"
                                >
                                  <Send size={16} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
