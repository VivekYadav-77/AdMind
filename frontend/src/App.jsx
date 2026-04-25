import { AlertCircle, BarChart3, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import AgentPipeline from './components/AgentPipeline'
import AuditResults from './components/AuditResults'
import ColdStartLoader from './components/ColdStartLoader'
import CopyResults from './components/CopyResults'
import Header from './components/Header'
import StrategyResults from './components/StrategyResults'
import UploadZone from './components/UploadZone'
import { API } from './services/api'

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

export default function App() {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4">
        {stage === 'upload' && <UploadZone onFileReady={runAnalysis} />}

        {(stage === 'running' || stage === 'done' || stage === 'error') && (
          <>
            <ColdStartLoader visible={waitingForBackend && stage === 'running'} />
            <AgentPipeline agentStatus={agentStatus} />
            {csvStats && (
              <section className="pb-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <BarChart3 size={21} aria-hidden="true" />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{csvStats.rows}</span> rows parsed
                  </p>
                  <p className="text-sm text-gray-600">
                    Spend: <span className="font-semibold text-gray-900">{formatMoney(csvStats.total_spend)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Revenue: <span className="font-semibold text-gray-900">{formatMoney(csvStats.total_revenue)}</span>
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {stage === 'error' && (
          <section className="py-8">
            <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle size={22} aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">Analysis failed</h2>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Analyze Another File
              </button>
            </div>
          </section>
        )}

        <AuditResults audit={results.audit} />
        <StrategyResults strategy={results.strategy} />
        <CopyResults copy={results.copy} />

        {stage === 'done' && (
          <section className="py-8 text-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RotateCcw size={18} aria-hidden="true" />
              Analyze Another File
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
