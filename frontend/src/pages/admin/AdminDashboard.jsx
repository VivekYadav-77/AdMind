import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Users, BarChart3, Star, Briefcase, Activity, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [growth, setGrowth] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData, growthData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getActivity(),
          adminApi.getGrowthStats()
        ])
        setStats(statsData)
        setActivity(activityData.items || [])
        setGrowth(growthData)
      } catch (err) {
        console.error('Failed to fetch admin stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-textmuted">Loading dashboard...</div>
  if (!stats) return <div className="text-red-500">Failed to load stats.</div>

  const kpis = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Today', value: stats.active_today, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Jobs', value: stats.total_jobs, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Spend Analyzed', value: `$${Math.round(stats.total_spend_analyzed).toLocaleString()}`, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Reviews', value: stats.reviews_pending, icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Workspaces', value: stats.total_workspaces, icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
  ]

  return (
    <div className="space-y-8">
      {stats.reviews_pending > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-medium">There are {stats.reviews_pending} pending community reviews requiring your approval.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-bgpanel border border-borderwarm p-5 rounded-2xl">
            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-textmuted text-sm font-medium">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-textprimary mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bgpanel border border-borderwarm rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Platform Growth (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="new_users" name="New Users" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="new_jobs" name="New Jobs" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bgpanel border border-borderwarm rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {activity.slice(0, 10).map((act, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <p className="text-textprimary">{act.message}</p>
                  <p className="text-textmuted text-xs">{new Date(act.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
