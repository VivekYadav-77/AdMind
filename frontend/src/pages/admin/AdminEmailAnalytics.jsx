import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, AlertTriangle, Activity, Loader2 } from 'lucide-react'
import { API } from '../../services/api'
import Pagination from '../../components/ui/Pagination'

export default function AdminEmailAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [logType, setLogType] = useState('all')
  const [logStatus, setLogStatus] = useState('all')
  const [logsPage, setLogsPage] = useState(1)
  const [logsPageSize, setLogsPageSize] = useState(20)
  const [logsLoading, setLogsLoading] = useState(false)

  // Fetch full data on initial load
  useEffect(() => {
    fetchData()
  }, [])

  // Fetch only logs when pagination or filters change
  useEffect(() => {
    if (data) {
      fetchLogs()
    }
  }, [logType, logStatus, logsPage, logsPageSize])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await API.getEmailAnalytics(logsPage, logsPageSize, logType, logStatus)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const result = await API.getEmailAnalytics(logsPage, logsPageSize, logType, logStatus)
      setData(prev => ({
        ...prev,
        recent_logs: result.recent_logs
      }))
    } catch (err) {
      console.error("Failed to fetch logs:", err.message)
    } finally {
      setLogsLoading(false)
    }
  }

  if (loading && !data) return <div className="p-8 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-textprimary">Email Analytics</h1>
          <p className="text-textmuted mt-1">Monitor email delivery, verifications, and potential abuse.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary">Refresh Data</button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-textmuted mb-2">
            <Mail size={18} />
            <h3 className="font-medium">Total Sent</h3>
          </div>
          <div className="text-3xl font-bold text-textprimary">{data.total}</div>
        </div>

        <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-textmuted mb-2">
            <Activity size={18} />
            <h3 className="font-medium">Sent Today</h3>
          </div>
          <div className="text-3xl font-bold text-textprimary">{data.today}</div>
        </div>

        <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-textmuted mb-2">
            <CheckCircle size={18} className="text-green-500" />
            <h3 className="font-medium">Success Rate</h3>
          </div>
          <div className="text-3xl font-bold text-textprimary">{(data.success_rate * 100).toFixed(1)}%</div>
        </div>

        <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-textmuted mb-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-medium">Flagged IPs</h3>
          </div>
          <div className="text-3xl font-bold text-textprimary">
            {data.top_ips.filter(ip => ip.flagged).length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown & IPs */}
        <div className="space-y-6">
          <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-serif text-textprimary mb-4">By Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-textmuted">Verification</span>
                  <span className="text-textprimary font-medium">{data.by_type.verification}</span>
                </div>
                <div className="w-full bg-bgbase rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${data.total ? (data.by_type.verification / data.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-textmuted">Password Reset</span>
                  <span className="text-textprimary font-medium">{data.by_type.password_reset}</span>
                </div>
                <div className="w-full bg-bgbase rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${data.total ? (data.by_type.password_reset / data.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bgpanel border border-borderwarm rounded-xl p-5 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <h3 className="text-lg font-serif text-textprimary mb-4">Top IPs (Volume)</h3>
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-3">
                {data.top_ips.length === 0 ? (
                  <p className="text-textmuted text-sm italic">No data yet.</p>
                ) : (
                  data.top_ips.map((ip, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${ip.flagged ? 'bg-red-500/10 border-red-500/30' : 'bg-bgbase border-borderwarm'}`}>
                      <div className="flex items-center gap-2">
                        {ip.flagged && <AlertTriangle size={14} className="text-red-400" />}
                        <span className="text-sm font-mono text-textprimary">{ip.ip}</span>
                      </div>
                      <span className="text-sm font-medium">{ip.count} reqs</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="lg:col-span-2 bg-bgpanel border border-borderwarm rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-borderwarm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-serif text-textprimary flex items-center gap-2">
              Recent Email Logs
              {logsLoading && <Loader2 size={14} className="animate-spin text-brand-500" />}
            </h3>
            <div className="flex items-center gap-3">
              <select 
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="bg-bgbase border border-borderwarm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="verification">Verification</option>
                <option value="password_reset">Password Reset</option>
              </select>
              <select 
                value={logStatus}
                onChange={(e) => setLogStatus(e.target.value)}
                className="bg-bgbase border border-borderwarm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 relative">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bgbase/50 text-textsecondary sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">To</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-borderwarm text-textprimary ${logsLoading ? 'opacity-50' : ''}`}>
                {data.recent_logs.items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-textmuted italic">
                      No emails logged yet.
                    </td>
                  </tr>
                ) : (
                  data.recent_logs.items.map((log) => (
                    <tr key={log.id} className="hover:bg-bgbase/30 transition-colors">
                      <td className="px-5 py-3 text-textmuted">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-medium">{log.email_to}</td>
                      <td className="px-5 py-3 capitalize">
                        {log.type.replace('_', ' ')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                          log.status === 'sent' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {log.status === 'sent' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-textmuted">
                        {log.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            page={data.recent_logs.page} 
            pages={data.recent_logs.pages} 
            total={data.recent_logs.total}
            pageSize={logsPageSize}
            onPageChange={setLogsPage} 
            onPageSizeChange={setLogsPageSize}
          />
        </div>
      </div>
    </div>
  )
}
