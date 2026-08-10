import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Search, Trash2, Eye } from 'lucide-react'
import Modal from '../../components/ui/Modal'

export default function AdminJobs() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getJobs(page, 20, statusFilter)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [statusFilter])

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return
    try {
      await adminApi.deleteJob(id)
      fetchJobs(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  const viewDetail = async (id) => {
    try {
      const detail = await adminApi.getJobDetail(id)
      setSelectedJob(detail)
      setShowModal(true)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Analysis Jobs</h2>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-bgpanel border border-borderwarm focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="complete">Complete</option>
          <option value="processing">Processing</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bgpanelhover text-textmuted">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Workspace</th>
                <th className="px-6 py-4 font-semibold">Spend</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderwarm">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-textmuted">Loading...</td></tr>
              ) : data.items.map(j => (
                <tr key={j.id} className="hover:bg-bgpanelhover/50">
                  <td className="px-6 py-4">{j.id}</td>
                  <td className="px-6 py-4">{j.user_email}</td>
                  <td className="px-6 py-4">{j.workspace_name || 'N/A'}</td>
                  <td className="px-6 py-4">${j.input_spend?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      j.status === 'complete' ? 'bg-green-500/10 text-green-500' :
                      j.status === 'error' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {j.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(j.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => viewDetail(j.id)} className="p-2 text-textmuted hover:text-blue-500 transition-colors" title="View JSON">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => deleteJob(j.id)} className="p-2 text-textmuted hover:text-red-500 transition-colors" title="Delete Job">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Job #${selectedJob?.id} Details`}>
        {selectedJob && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <h4 className="font-bold text-textprimary">Raw Data Payload</h4>
            <pre className="bg-bgbase p-4 rounded-xl text-xs overflow-x-auto text-textmuted border border-borderwarm">
              {JSON.stringify(selectedJob, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  )
}
