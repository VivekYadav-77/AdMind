import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react'
import { API } from '../../../services/api'
import LoadingSpinner from '../../../components/LoadingSpinner'

export default function AdminEmailAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await API.getEmailAnalytics()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8"><LoadingSpinner /></div>
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
        <div className="lg:col-span-2 bg-bgpanel border border-borderwarm rounded-xl shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-borderwarm">
            <h3 className="text-lg font-serif text-textprimary">Recent Email Logs</h3>
          </div>
          <div className="overflow-x-auto flex-1">
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
              <tbody className="divide-y divide-borderwarm text-textprimary">
                {data.recent_logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-textmuted italic">
                      No emails logged yet.
                    </td>
                  </tr>
                ) : (
                  data.recent_logs.map((log) => (
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
        </div>
      </div>
    </div>
  )
}
