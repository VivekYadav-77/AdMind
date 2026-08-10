import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Search, ShieldAlert, ShieldCheck, Trash2, Ban } from 'lucide-react'

export default function AdminUsers() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getUsers(page, 20, search)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const toggleBan = async (id) => {
    if (!window.confirm("Are you sure you want to toggle ban for this user?")) return
    try {
      await adminApi.toggleUserBan(id)
      fetchUsers(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  const toggleAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to toggle admin rights?")) return
    try {
      await adminApi.toggleUserAdmin(id)
      fetchUsers(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm("CRITICAL: Hard delete this user and ALL their data?")) return
    try {
      await adminApi.deleteUser(id)
      fetchUsers(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted" size={16} />
          <input 
            type="text" 
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-bgpanel border border-borderwarm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bgpanelhover text-textmuted">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Jobs</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderwarm">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-textmuted">Loading...</td></tr>
              ) : data.items.map(u => (
                <tr key={u.id} className={`hover:bg-bgpanelhover/50 ${u.is_banned ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4 font-medium">{u.email}</td>
                  <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {u.is_superadmin 
                      ? <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-md text-xs font-bold">ADMIN</span>
                      : <span className="bg-borderwarm/50 text-textmuted px-2 py-1 rounded-md text-xs">USER</span>
                    }
                    {u.is_banned && <span className="ml-2 bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-xs font-bold">BANNED</span>}
                  </td>
                  <td className="px-6 py-4">{u.jobs_count}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => toggleAdmin(u.id)} className="p-2 text-textmuted hover:text-orange-500 transition-colors" title="Toggle Admin">
                      {u.is_superadmin ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    </button>
                    <button onClick={() => toggleBan(u.id)} className="p-2 text-textmuted hover:text-red-500 transition-colors" title="Toggle Ban">
                      <Ban size={16} />
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="p-2 text-textmuted hover:text-red-500 transition-colors" title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
