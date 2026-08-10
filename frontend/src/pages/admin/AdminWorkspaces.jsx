import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import Pagination from '../../components/ui/Pagination'

export default function AdminWorkspaces() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [loading, setLoading] = useState(true)

  const fetchWorkspaces = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getWorkspaces(page, 20)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces(1)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Workspace Directory</h2>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bgpanelhover text-textmuted">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Owner Email</th>
                <th className="px-6 py-4 font-semibold">Members</th>
                <th className="px-6 py-4 font-semibold">Jobs Count</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderwarm">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-textmuted">Loading...</td></tr>
              ) : data.items.map(w => (
                <tr key={w.id} className="hover:bg-bgpanelhover/50">
                  <td className="px-6 py-4">{w.id}</td>
                  <td className="px-6 py-4 font-medium">{w.name}</td>
                  <td className="px-6 py-4">{w.owner_email}</td>
                  <td className="px-6 py-4">{w.member_count}</td>
                  <td className="px-6 py-4">{w.job_count}</td>
                  <td className="px-6 py-4">{new Date(w.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} pages={data.pages} onPageChange={fetchWorkspaces} />
      </div>
    </div>
  )
}
