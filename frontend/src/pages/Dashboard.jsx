import { AlertCircle, BarChart3, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

import AgentPipeline from '../components/AgentPipeline'
import AuditResults from '../components/AuditResults'
import ColdStartLoader from '../components/ColdStartLoader'
import CopyResults from '../components/CopyResults'
import StrategyResults from '../components/StrategyResults'
import UploadZone from '../components/UploadZone'
import { API } from '../services/api'

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

  const reset = () => {
    setStage('upload')
    setAgentStatus(initialAgentStatus)
    setResults(initialResults)
    setCsvStats(null)
    setError(null)
    setWaitingForBackend(false)
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
    setStage('running')
    setAgentStatus(initialAgentStatus)
    setResults(initialResults)
    setCsvStats(null)
    setError(null)
    setWaitingForBackend(true)

    try {
      const response = await API.analyzeCSV(file)
      if (!response.ok || !response.body) {
        throw new Error('Could not start analysis')
      }

      const reader = response.body.getReader()
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
    } catch (caught) {
      setWaitingForBackend(false)
      setError(caught.message)
      setStage('error')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
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
              className="flex flex-wrap items-center gap-4 rounded-2xl glass p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
                <BarChart3 size={24} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-500">Dataset Overview</h3>
                <div className="flex gap-6 mt-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900 text-base">{csvStats.rows}</span> rows
                  </p>
                  <p className="text-sm text-slate-700">
                    Spend: <span className="font-bold text-slate-900 text-base">{formatMoney(csvStats.total_spend)}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Revenue: <span className="font-bold text-slate-900 text-base">{formatMoney(csvStats.total_revenue)}</span>
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
          className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm"
        >
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle size={24} aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-lg">Analysis Failed</h2>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-md transition-all"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try Again
          </button>
        </motion.div>
      )}

      <div className="space-y-8">
        <AuditResults audit={results.audit} />
        <StrategyResults strategy={results.strategy} />
        <CopyResults copy={results.copy} />
      </div>

      {stage === 'done' && (
        <motion.section 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pt-4 text-center"
        >
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:scale-105"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Start New Analysis
          </button>
        </motion.section>
      )}
    </motion.div>
  )
}
