import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/adminApi'
import { Search, RefreshCw, MessageSquare, ArrowRight, Trash2 } from 'lucide-react'
import Pagination from '../../components/ui/Pagination'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminTickets() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger', confirmText: 'Confirm' })

  const fetchTickets = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getTickets(page, 20, statusFilter)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(1)
  }, [statusFilter])

  const deleteTicket = async (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Ticket",
      message: "Are you sure you want to delete this ticket? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        try {
          await adminApi.deleteTicket(id)
          fetchTickets(data.page)
        } catch (e) {
          alert(e.message)
        }
      }
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-500/10 text-blue-500",
      in_progress: "bg-yellow-500/10 text-yellow-500",
      resolved: "bg-green-500/10 text-green-500",
      closed: "bg-borderwarm text-textmuted"
    }
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${styles[status] || styles.open}`}>{status.replace('_', ' ')}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <button 
            onClick={() => fetchTickets(data.page)} 
            disabled={loading}
            className="p-1.5 rounded-lg bg-bgpanel border border-borderwarm text-textmuted hover:text-brand-500 transition-colors disabled:opacity-50"
            title="Refresh Tickets"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bgpanel border border-borderwarm rounded-xl px-4 py-2 focus:outline-none focus:border-brand-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bgpanelhover text-textmuted">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">From</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderwarm">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-textmuted">Loading...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-textmuted">No tickets found.</td></tr>
              ) : data.items.map(t => (
                <tr key={t.id} className="hover:bg-bgpanelhover/50 transition-colors">
                  <td className="px-6 py-4 text-textmuted">#{t.id}</td>
                  <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={t.subject}>{t.subject}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{t.user_email}</span>
                      {!t.user_id && <span className="text-xs text-brand-500 font-semibold">GUEST</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textmuted">{t.category}</td>
                  <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                  <td className="px-6 py-4 text-textmuted">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/admin/tickets/${t.id}`} className="inline-flex p-2 text-textmuted hover:text-brand-500 transition-colors" title="View Thread">
                      <ArrowRight size={16} />
                    </Link>
                    <button onClick={() => deleteTicket(t.id)} className="p-2 text-textmuted hover:text-red-500 transition-colors" title="Delete Ticket">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.total > 0 && (
          <Pagination page={data.page} pages={data.pages} onPageChange={fetchTickets} />
        )}
      </div>

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
