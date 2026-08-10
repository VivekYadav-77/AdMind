import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Check, X, Star } from 'lucide-react'

export default function AdminReviews() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20 })
  const [statusTab, setStatusTab] = useState('pending')
  const [loading, setLoading] = useState(true)

  const fetchReviews = async (page = 1) => {
    setLoading(true)
    try {
      const result = await adminApi.getReviews(page, 20, statusTab)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(1)
  }, [statusTab])

  const approveReview = async (id) => {
    try {
      await adminApi.approveReview(id)
      fetchReviews(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  const rejectReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return
    try {
      await adminApi.rejectReview(id)
      fetchReviews(data.page)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Community Reviews</h2>
      </div>

      <div className="flex border-b border-borderwarm">
        <button 
          onClick={() => setStatusTab('pending')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${statusTab === 'pending' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-textmuted hover:text-textprimary'}`}
        >
          Pending Approval
        </button>
        <button 
          onClick={() => setStatusTab('approved')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${statusTab === 'approved' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-textmuted hover:text-textprimary'}`}
        >
          Approved
        </button>
      </div>

      {loading ? (
        <div className="text-textmuted">Loading reviews...</div>
      ) : data.items.length === 0 ? (
        <div className="text-textmuted text-center py-10 bg-bgpanel border border-borderwarm rounded-2xl">
          No {statusTab} reviews found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map(r => (
            <div key={r.id} className="bg-bgpanel border border-borderwarm rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-textprimary">{r.author_name}</h4>
                  <p className="text-xs text-textmuted">{r.user_email}</p>
                </div>
                <div className="flex items-center text-yellow-500">
                  {r.rating} <Star size={14} className="fill-current ml-1" />
                </div>
              </div>
              <p className="text-textsecondary text-sm flex-1 mb-4 italic">"{r.content}"</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-borderwarm">
                <span className="text-xs text-textmuted">{new Date(r.created_at).toLocaleDateString()}</span>
                <div className="space-x-2">
                  {statusTab === 'pending' && (
                    <button onClick={() => approveReview(r.id)} className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors" title="Approve">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => rejectReview(r.id)} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors" title="Reject/Delete">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
