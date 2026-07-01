import { AlertCircle, BarChart3, Download, FileSearch, Lightbulb, PenLine, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2pdf from 'html2pdf.js'

import AgentPipeline from '../components/AgentPipeline'
import AuditResults from '../components/AuditResults'
import CampaignHealthScore from '../components/CampaignHealthScore'
import ColdStartLoader from '../components/ColdStartLoader'
import CopyResults from '../components/CopyResults'
import StrategyResults from '../components/StrategyResults'
import UploadZone from '../components/UploadZone'
import { API } from '../services/api'
import clsx from 'clsx'

const initialAgentStatus = {
  auditor: 'idle',
  strategist: 'idle',
  copywriter: 'idle'
}

const initialResults = {
  audit: null,
  strategy: null,
  copy: null
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const [stage, setStage] = useState('upload')
  const [agentStatus, setAgentStatus] = useState(initialAgentStatus)
  const [results, setResults] = useState(initialResults)
  const [csvStats, setCsvStats] = useState(null)
  const [error, setError] = useState(null)
  const [waitingForBackend, setWaitingForBackend] = useState(false)
  const [activeTab, setActiveTab] = useState('audit')
  
  const reportRef = useRef(null)

  const reset = () => {
    setStage('upload')
    setAgentStatus(initialAgentStatus)
    setResults(initialResults)
    setCsvStats(null)
    setError(null)
    setWaitingForBackend(false)
    setActiveTab('audit')
  }

  const handleEvent = (event, data) => {
    switch (event) {
      case 'csv_parsed':
        setWaitingForBackend(false)
        setCsvStats(data)
        break
      case 'agent_start':
        setWaitingForBackend(false)
        setAgentStatus((prev) => ({ ...prev, [data.agent]: 'running' }))
        break
      case 'agent_done': {
        const resultKey = data.agent === 'auditor' ? 'audit' : data.agent === 'strategist' ? 'strategy' : 'copy'
        setAgentStatus((prev) => ({ ...prev, [data.agent]: 'done' }))
        setResults((prev) => ({ ...prev, [resultKey]: data.result }))
        break
      }
      case 'complete':
        setStage('done')
        break
      case 'error':
        setError(data.message || 'Analysis failed')
        setStage('error')
        break
      default:
        break
    }
  }

  const runAnalysis = async (file) => {
    // Let the backend handle CSV validation to support column aliases

    setStage('running')
    setAgentStatus(initialAgentStatus)
    setResults(initialResults)
    setCsvStats(null)
    setError(null)
    setWaitingForBackend(true)

    try {
      // Start background job
      const response = await API.analyzeCSV(file)
      const { job_id } = response

      // Consume SSE stream
      const streamRes = await API.streamAnalysis(job_id)
      if (!streamRes.ok || !streamRes.body) {
        throw new Error('Could not connect to analysis stream')
      }

      const reader = streamRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || ''

        for (const chunk of chunks) {
          const line = chunk.split('\n').find((item) => item.startsWith('data: '))
          if (!line) continue
          const payload = JSON.parse(line.replace('data: ', ''))
          handleEvent(payload.event, payload.data)
        }
      }

      // Fallback: If the stream closes but we missed events (e.g. buffering or reconnect), 
      // fetch the final job state and trigger UI updates manually.
      try {
        const finalJob = await API.getJobDetails(job_id)
        if (finalJob.status === 'complete') {
          if (finalJob.total_rows > 0) {
            handleEvent('csv_parsed', {
              rows: finalJob.total_rows,
              total_spend: finalJob.input_spend,
              total_revenue: finalJob.input_revenue
            })
          }
          if (finalJob.audit_data) handleEvent('agent_done', { agent: 'auditor', result: finalJob.audit_data })
          if (finalJob.strategy_data) handleEvent('agent_done', { agent: 'strategist', result: finalJob.strategy_data })
          if (finalJob.copy_data) handleEvent('agent_done', { agent: 'copywriter', result: finalJob.copy_data })
          handleEvent('complete', null)
        } else if (finalJob.status === 'error') {
          handleEvent('error', { message: finalJob.error_message || 'Analysis failed' })
        }
      } catch (err) {
        console.error('Failed to fetch final job status:', err)
      }

    } catch (caught) {
      setWaitingForBackend(false)
      setError(caught.message)
      setStage('error')
    }
  }

  const downloadPDF = () => {
    const element = reportRef.current
    if (!element) return

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: 'AdMind_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  const tabs = [
    { id: 'audit', label: 'Audit', icon: FileSearch, color: 'blue' },
    { id: 'strategy', label: 'Strategy', icon: Lightbulb, color: 'indigo' },
    { id: 'copy', label: 'A/B Copy', icon: PenLine, color: 'purple' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {stage === 'upload' && <UploadZone onFileReady={runAnalysis} />}

      {(stage === 'running' || stage === 'done' || stage === 'error') && (
        <div className="space-y-6">
          <ColdStartLoader visible={waitingForBackend && stage === 'running'} />
          <AgentPipeline agentStatus={agentStatus} />
          
          {csvStats && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-wrap items-center gap-4 rounded-2xl glass-panel p-5 border-blue-500/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 shadow-inner">
                <BarChart3 size={24} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-400">Dataset Overview</h3>
                <div className="flex gap-6 mt-1">
                  <p className="text-sm text-slate-400">
                    <span className="font-bold text-slate-200 text-base">{csvStats.rows}</span> rows
                  </p>
                  <p className="text-sm text-slate-400">
                    Spend: <span className="font-bold text-slate-200 text-base">{formatMoney(csvStats.total_spend)}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Revenue: <span className="font-bold text-slate-200 text-base">{formatMoney(csvStats.total_revenue)}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {stage === 'error' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <div className="flex items-start gap-3 text-red-400">
            <AlertCircle size={24} aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-lg">Analysis Failed</h2>
              <p className="mt-1 text-sm text-red-300">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 px-5 py-2.5 text-sm font-semibold transition-all border border-red-500/30"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try Again
          </button>
        </motion.div>
      )}

      {/* Results Section with Tabs and PDF Export */}
      {(results.audit || results.strategy || results.copy) && (
        <div className="mt-12 space-y-6">
          {results.audit && <CampaignHealthScore audit={results.audit} />}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-bold transition-all border-b-2",
                      isActive 
                        ? `border-${tab.color}-400 text-${tab.color}-400 bg-${tab.color}-500/10` 
                        : "border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300"
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
            
            {stage === 'done' && (
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:scale-105"
              >
                <Download size={16} />
                Download Report
              </button>
            )}
          </div>

          <div ref={reportRef} className="bg-transparent min-h-[500px] p-2">
            <AnimatePresence mode="wait">
              {activeTab === 'audit' && results.audit && (
                <motion.div key="audit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <AuditResults audit={results.audit} />
                </motion.div>
              )}
              {activeTab === 'strategy' && results.strategy && (
                <motion.div key="strategy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <StrategyResults strategy={results.strategy} />
                </motion.div>
              )}
              {activeTab === 'copy' && results.copy && (
                <motion.div key="copy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <CopyResults copy={results.copy} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Show loader if the active tab's result isn't ready yet */}
            {!results[activeTab] && agentStatus[activeTab === 'audit' ? 'auditor' : activeTab === 'strategy' ? 'strategist' : 'copywriter'] === 'running' && (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
                  <p className="text-sm font-medium">Analyzing data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <motion.section 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pt-12 text-center"
        >
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl glass-panel px-6 py-3 text-sm font-semibold text-slate-300 shadow-lg transition-all hover:bg-white/10"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Start New Analysis
          </button>
        </motion.section>
      )}
    </motion.div>
  )
}
