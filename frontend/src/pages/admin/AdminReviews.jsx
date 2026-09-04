import { useState, useEffect } from 'react'
import { adminApi } from '../../services/adminApi'
import { Check, X, Star, Clock, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Visual Star Rating ───────────────────────────────────────────────────────
function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={13}
          fill={star <= rating ? '#EAB308' : 'none'}
          stroke={star <= rating ? '#EAB308' : '#6b7280'}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-textmuted">{rating}/5</span>
    </div>
  )
}

// ─── Inline Toast ─────────────────────────────────────────────────────────────
function InlineToast({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}
      >
        {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        {message}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, statusTab, onApprove, onReject }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-bgpanel border border-borderwarm rounded-2xl p-6 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {review.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-textprimary text-sm truncate">{review.author_name}</p>
              <p className="text-xs text-textmuted truncate">{review.user_email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StarDisplay rating={review.rating} />
          <span className="text-[10px] text-textmuted">
            {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        {review.is_approved === 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
            <Clock size={10} /> Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <CheckCircle2 size={10} /> Approved
          </span>
        )}
      </div>

      {/* Review Content */}
      <p className="text-textsecondary text-sm leading-relaxed italic flex-1">
        "{review.content}"
      </p>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-borderwarm mt-auto">
        {confirming ? (
          <div className="flex items-center gap-2 w-full">
            <p className="text-xs text-textmuted flex-1">Reject and permanently delete?</p>
            <button
              onClick={() => setConfirming(false)}
              className="px-3 py-1.5 text-xs font-medium text-textmuted hover:text-textprimary bg-bgbase rounded-lg border border-borderwarm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirming(false); onReject(review.id) }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        ) : (
          <>
            {statusTab === 'pending' && (
              <button
                onClick={() => onApprove(review.id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Check size={14} /> Approve
              </button>
            )}
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X size={14} /> {statusTab === 'pending' ? 'Reject' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 bg-bgpanel border border-borderwarm/50 border-dashed rounded-2xl"
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
        {tab === 'pending'
          ? <CheckCircle2 size={24} className="text-emerald-400" />
          : <MessageSquare size={24} className="text-brand-500/60" />
        }
      </div>
      {tab === 'pending' ? (
        <>
          <h3 className="text-lg font-bold text-textprimary mb-1">All caught up!</h3>
          <p className="text-textmuted text-sm">No reviews pending approval right now.</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-textprimary mb-1">No approved reviews yet</h3>
          <p className="text-textmuted text-sm">Approve reviews from the Pending tab for them to appear here.</p>
        </>
      )}
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminReviews() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20, pages: 1 })
  const [statusTab, setStatusTab] = useState('pending')
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null) // { message, type }

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

  // Also fetch pending count for the badge (always, regardless of active tab)
  const fetchPendingCount = async () => {
    try {
      const result = await adminApi.getReviews(1, 1, 'pending')
      setPendingCount(result.total || 0)
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchReviews(1)
    fetchPendingCount()
  }, [statusTab])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const approveReview = async (id) => {
    try {
      await adminApi.approveReview(id)
      showToast('Review approved and is now public.', 'success')
      fetchReviews(data.page)
      fetchPendingCount()
    } catch (e) {
      showToast(e.message || 'Failed to approve review.', 'error')
    }
  }

  const rejectReview = async (id) => {
    try {
      await adminApi.rejectReview(id)
      showToast('Review has been deleted.', 'success')
      fetchReviews(data.page)
      fetchPendingCount()
    } catch (e) {
      showToast(e.message || 'Failed to reject review.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textprimary">Community Reviews</h2>
          <p className="text-sm text-textmuted mt-1">Moderate user-submitted reviews before they appear publicly.</p>
        </div>
      </div>

      {/* Inline Toast */}
      <AnimatePresence>
        {toast && (
          <InlineToast
            key={toast.message}
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-borderwarm">
        <button
          onClick={() => setStatusTab('pending')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
            statusTab === 'pending'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-textmuted hover:text-textprimary'
          }`}
        >
          <Clock size={14} />
          Pending Approval
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setStatusTab('approved')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
            statusTab === 'approved'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-textmuted hover:text-textprimary'
          }`}
        >
          <CheckCircle2 size={14} />
          Approved
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-bgpanel border border-borderwarm rounded-2xl p-6 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-borderwarm" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-borderwarm rounded-full w-3/4" />
                  <div className="h-2.5 bg-borderwarm rounded-full w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 bg-borderwarm rounded-full w-full" />
                <div className="h-2.5 bg-borderwarm rounded-full w-4/5" />
                <div className="h-2.5 bg-borderwarm rounded-full w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState tab={statusTab} />
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {data.items.map(r => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  statusTab={statusTab}
                  onApprove={approveReview}
                  onReject={rejectReview}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={data.page <= 1}
                onClick={() => fetchReviews(data.page - 1)}
                className="px-4 py-2 text-sm font-medium bg-bgpanel border border-borderwarm rounded-xl disabled:opacity-40 hover:border-brand-500/40 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-textmuted">
                Page {data.page} of {data.pages}
              </span>
              <button
                disabled={data.page >= data.pages}
                onClick={() => fetchReviews(data.page + 1)}
                className="px-4 py-2 text-sm font-medium bg-bgpanel border border-borderwarm rounded-xl disabled:opacity-40 hover:border-brand-500/40 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
