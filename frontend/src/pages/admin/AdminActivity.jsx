import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { RefreshCw } from 'lucide-react'
import Pagination from '../../components/ui/Pagination'

export default function AdminActivity() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [typeFilter, setTypeFilter] = useState('all')
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)

  const fetchActivity = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getActivity(page, pageSize, typeFilter)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity(1)
  }, [typeFilter, pageSize])

  const getBadgeColor = (type) => {
    if (type === 'user_registered') return 'bg-blue-500/10 text-blue-500'
    if (type.startsWith('job_')) {
      if (type.includes('complete')) return 'bg-green-500/10 text-green-500'
      if (type.includes('error')) return 'bg-red-500/10 text-red-500'
      return 'bg-yellow-500/10 text-yellow-500'
    }
    if (type.startsWith('review_')) return 'bg-orange-500/10 text-orange-500'
    return 'bg-borderwarm text-textmuted'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Platform Activity Feed</h2>
          <button 
            onClick={() => fetchActivity(data.page)} 
            disabled={loading}
            className="p-1.5 rounded-lg bg-bgpanel border border-borderwarm text-textmuted hover:text-brand-500 hover:border-brand-500/50 transition-colors disabled:opacity-50"
            title="Refresh Activity"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-bgpanel p-1 rounded-xl border border-borderwarm">
            {['all', 'users', 'jobs', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  typeFilter === t ? 'bg-brand-500 text-white shadow-sm' : 'text-textmuted hover:text-textprimary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 flex-1">
          {loading ? (
            <div className="text-textmuted text-center py-8">Loading activity...</div>
          ) : data.items.length === 0 ? (
            <div className="text-textmuted text-center py-8">No recent activity.</div>
          ) : (
            <div className="space-y-6">
              {data.items.map((act, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`mt-1 text-xs font-bold px-2 py-1 rounded w-32 text-center uppercase ${getBadgeColor(act.type)}`}>
                    {act.type.replace('_', ' ')}
                  </div>
                  <div className="flex-1">
                    <p className="text-textprimary">{act.message}</p>
                    <p className="text-textmuted text-xs mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Pagination 
          page={data.page} 
          pages={data.pages} 
          total={data.total}
          pageSize={pageSize}
          onPageChange={fetchActivity} 
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
