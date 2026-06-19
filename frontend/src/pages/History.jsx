import { Calendar, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

import { API_BASE_URL } from '../services/api'

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function History() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_BASE_URL}/history`)
        const data = await res.json()
        setJobs(data)
      } catch (err) {
        console.error("Failed to fetch history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">No History Yet</h2>
        <p className="text-slate-500 mt-2">Your past campaign analyses will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="glass rounded-xl p-6 transition-all hover:shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Job #{job.id}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar size={14} />
                  {new Date(job.created_at).toLocaleString()}
                </span>
                {job.status === 'complete' && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 size={16} /> Complete
                  </span>
                )}
              </div>
              <div className="flex gap-6 mt-4">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{job.total_rows}</span> rows
                </p>
                <p className="text-sm text-slate-600">
                  Spend: <span className="font-semibold text-slate-900">{formatMoney(job.input_spend)}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Revenue: <span className="font-semibold text-slate-900">{formatMoney(job.input_revenue)}</span>
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
