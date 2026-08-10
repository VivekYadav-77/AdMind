import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'

export default function AdminActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true)
      try {
        const data = await adminApi.getActivity()
        setActivity(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [])

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Platform Activity Feed</h2>
      </div>

      <div className="bg-bgpanel border border-borderwarm rounded-2xl p-6">
        {loading ? (
          <div className="text-textmuted">Loading activity...</div>
        ) : activity.length === 0 ? (
          <div className="text-textmuted">No recent activity.</div>
        ) : (
          <div className="space-y-6">
            {activity.map((act, idx) => (
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
    </div>
  )
}
