import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Search, Trash2, Eye, RefreshCw } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Pagination from '../../components/ui/Pagination'

export default function AdminJobs() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger', confirmText: 'Confirm' })

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getJobs(page, pageSize, statusFilter, search)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [statusFilter, pageSize])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchJobs(1)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const deleteJob = async (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Job",
      message: "Are you sure you want to delete this job? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        try {
          await adminApi.deleteJob(id)
          fetchJobs(data.page)
        } catch (e) {
          alert(e.message)
        }
      }
    })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Analysis Jobs</h2>
          <button 
            onClick={() => fetchJobs(data.page)} 
            disabled={loading}
            className="p-1.5 rounded-lg bg-bgpanel border border-borderwarm text-textmuted hover:text-brand-500 hover:border-brand-500/50 transition-colors disabled:opacity-50"
            title="Refresh Jobs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted" size={16} />
            <input 
              type="text" 
              placeholder="Search user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl bg-bgpanel border border-borderwarm focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-bgpanel border border-borderwarm focus:outline-none text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>
        </div>
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
              ) : data.items.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-textmuted">No jobs found.</td></tr>
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
        <Pagination 
          page={data.page} 
          pages={data.pages} 
          total={data.total}
          pageSize={pageSize}
          onPageChange={fetchJobs} 
          onPageSizeChange={setPageSize}
        />
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  )
}
