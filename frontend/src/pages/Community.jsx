import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, Trash2, CheckCircle2, Clock, Sparkles, Quote } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'
import { useAuth } from '../context/AuthContext'
import { API } from '../services/api'
import { useToast } from '../context/ToastContext'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

// ─── Interactive Star Rating ────────────────────────────────────────────────
function StarRating({ rating, setRating, interactive = false }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (interactive ? (hovered || rating) : rating)
        return (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            disabled={!interactive}
            className={`focus:outline-none transition-all duration-150 ${
              interactive ? 'cursor-pointer' : 'cursor-default'
            }`}
            style={{
              transform: interactive && hovered === star ? 'scale(1.3)' : 'scale(1)',
              filter: filled ? 'drop-shadow(0 0 6px rgba(234,179,8,0.5))' : 'none',
            }}
          >
            <Star
              size={interactive ? 26 : 16}
              fill={filled ? '#EAB308' : 'none'}
              stroke={filled ? '#EAB308' : '#6b7280'}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-6 animate-pulse">
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-4 h-4 rounded-full bg-borderwarm" />
        ))}
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-borderwarm rounded-full w-full" />
        <div className="h-3 bg-borderwarm rounded-full w-4/5" />
        <div className="h-3 bg-borderwarm rounded-full w-3/5" />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-borderwarm/50">
        <div className="w-8 h-8 rounded-full bg-borderwarm" />
        <div className="h-3 bg-borderwarm rounded-full w-24" />
      </div>
    </div>
  )
}

// ─── Review Card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, isAuthenticated, user, onDelete, formatDate }) {
  return (
    <motion.div
      variants={FADE_UP_VARIANTS}
      className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-6 backdrop-blur-sm flex flex-col h-full relative group hover:border-brand-500/30 transition-colors duration-300"
    >
      {/* Delete Button */}
      {isAuthenticated && user && review.user_id === user.id && (
        <button
          onClick={() => onDelete(review.id)}
          className="absolute top-4 right-4 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-400/10 hover:bg-red-400/20 p-2 rounded-full"
          title="Delete your review"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Decorative Quote Mark */}
      <div className="absolute top-4 left-5 text-brand-500/10 pointer-events-none select-none">
        <Quote size={40} fill="currentColor" />
      </div>

      {/* Star Rating */}
      <div className="mb-4 relative z-10">
        <StarRating rating={review.rating} />
      </div>

      {/* Review Content */}
      <p className="text-textsecondary flex-grow mb-6 leading-relaxed relative z-10 italic">
        "{review.content}"
      </p>

      {/* Author */}
      <div className="flex items-center justify-between pt-4 border-t border-borderwarm/50 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {review.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-textprimary text-sm block">{review.author_name}</span>
            <span className="text-[10px] text-brand-500/80 font-medium flex items-center gap-1">
              <CheckCircle2 size={10} /> Verified User
            </span>
          </div>
        </div>
        <span className="text-xs text-textmuted">{formatDate(review.created_at)}</span>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Community() {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // My review state — null: no review, object: existing review
  const [myReview, setMyReview] = useState(undefined) // undefined = not yet loaded
  const [myReviewLoading, setMyReviewLoading] = useState(false)

  // Write Review State
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReview()
    } else {
      setMyReview(null)
    }
  }, [isAuthenticated])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await API.getReviews()
      setReviews(data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyReview = async () => {
    try {
      setMyReviewLoading(true)
      const data = await API.getMyReview()
      setMyReview(data) // null if none, object if exists
    } catch (error) {
      console.error('Failed to fetch my review:', error)
      setMyReview(null)
    } finally {
      setMyReviewLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (content.trim().length < 10) {
      addToast('Review must be at least 10 characters long.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await API.submitReview(rating, content.trim())
      setShowSuccess(true)
    } catch (error) {
      addToast(error.message || 'Failed to submit review.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewStatus = async () => {
    setShowSuccess(false)
    setContent('')
    setRating(5)
    await fetchMyReview()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await API.deleteReview(id)
      setReviews(reviews.filter(r => r.id !== id))
      addToast('Review deleted.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete review.', 'error')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const charCount = content.length
  const charColor = charCount >= 950 ? 'text-red-400' : charCount >= 800 ? 'text-amber-400' : 'text-textmuted'

  // ─── Render the Write/Status Section ────────────────────────────────────────
  const renderReviewSection = () => {
    if (showSuccess) {
      return (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP_VARIANTS}
          className="bg-bgpanel/40 border border-emerald-500/25 rounded-3xl p-10 backdrop-blur-sm shadow-xl text-center flex flex-col items-center justify-center min-h-[380px]"
        >
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mb-6"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-3xl font-serif font-bold text-textprimary mb-4"
          >
            Thank You!
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-textsecondary mb-8 max-w-md mx-auto leading-relaxed"
          >
            Your review has been successfully submitted. It is now pending admin approval and will appear on the wall of love once verified.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onClick={handleViewStatus}
            whileTap={{ scale: 0.97 }}
            className="btn-primary bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            View Status
          </motion.button>
        </motion.div>
      )
    }

    if (!isAuthenticated) {
      return (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP_VARIANTS}
          className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-10 backdrop-blur-sm text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
            <MessageSquare size={26} className="text-brand-500" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-textprimary mb-3">Share Your Experience</h3>
          <p className="text-textsecondary mb-8 max-w-lg mx-auto leading-relaxed">
            Join our community of marketers and share how AdMind has impacted your ad campaigns. Your review helps others make better decisions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login" className="btn-secondary px-8 py-3 rounded-xl font-medium">Log in</Link>
            <Link to="/signup" className="btn-primary px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(217,119,87,0.3)] font-medium">Get Started Free</Link>
          </div>
        </motion.div>
      )
    }

    if (myReviewLoading || myReview === undefined) {
      return (
        <div className="bg-bgpanel/40 border border-borderwarm rounded-3xl p-10 backdrop-blur-sm flex items-center justify-center min-h-[180px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      )
    }

    // User has a pending review
    if (myReview && myReview.is_approved === 0) {
      return (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP_VARIANTS}
          className="bg-bgpanel/40 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-sm"
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
              <Clock size={22} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-textprimary mb-1">Your Review is Pending Approval</h3>
              <p className="text-textsecondary text-sm mb-5">An admin will review and approve it shortly. Once approved, it will appear in the public feed.</p>
              <div className="bg-bgbase/60 rounded-2xl p-5 border border-borderwarm/50">
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={myReview.rating} />
                  <span className="text-xs text-textmuted ml-1">· {formatDate(myReview.created_at)}</span>
                </div>
                <p className="text-textsecondary text-sm italic leading-relaxed">"{myReview.content}"</p>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    // User has an approved review
    if (myReview && myReview.is_approved === 1) {
      return (
        <motion.div
          initial="hidden" animate="visible" variants={FADE_UP_VARIANTS}
          className="bg-bgpanel/40 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-sm"
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-textprimary mb-1">Your Review is Live!</h3>
              <p className="text-textsecondary text-sm mb-5">Thank you for sharing your experience. Your review is now visible to the community below.</p>
              <div className="bg-bgbase/60 rounded-2xl p-5 border border-borderwarm/50">
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={myReview.rating} />
                </div>
                <p className="text-textsecondary text-sm italic leading-relaxed">"{myReview.content}"</p>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    // No existing review — show the write form
    return (
      <motion.div
        initial="hidden" animate="visible" variants={FADE_UP_VARIANTS}
        className="bg-bgpanel/40 border border-brand-500/25 rounded-3xl p-8 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Sparkles size={18} className="text-brand-500" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-textprimary">Write a Review</h3>
            <p className="text-xs text-textsecondary">Your feedback helps the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-textsecondary mb-3">Your Rating</label>
            <StarRating rating={rating} setRating={setRating} interactive={true} />
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-sm font-semibold text-textsecondary mb-3">Your Thoughts</label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How has AdMind helped your campaigns? Tell us about your results, the features you love, or how it changed your workflow..."
                className="w-full bg-bgbase border border-borderwarm rounded-2xl px-4 py-4 text-textprimary placeholder-textmuted focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all duration-200 min-h-[140px] resize-y outline-none text-sm leading-relaxed"
                maxLength={1000}
                required
              />
              <div className={`absolute bottom-3 right-4 text-xs font-medium transition-colors ${charColor}`}>
                {charCount}/1000
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-textmuted max-w-xs leading-relaxed">
              Reviews are moderated and will appear after admin approval.
            </p>
            <motion.button
              type="submit"
              disabled={isSubmitting || content.trim().length < 10}
              className="btn-primary px-8 py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              whileTap={{ scale: 0.97 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <AnimatedBackground />
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden" animate="visible" variants={STAGGER_CONTAINER}
          className="max-w-4xl mx-auto space-y-6"
        >
          <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-brand-500/30 text-brand-400 text-sm font-medium backdrop-blur-sm">
            <MessageSquare size={15} />
            <span>Wall of Love</span>
          </motion.div>
          <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-6xl font-bold font-serif tracking-tight">
            AdMind <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Community</span>
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-xl text-textsecondary max-w-2xl mx-auto leading-relaxed">
            See what digital marketers around the world are saying about their experience with AdMind.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-5xl mx-auto">

        {/* Write / Status Section */}
        <div className="mb-20">
          {renderReviewSection()}
        </div>

        {/* Public Feed Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-borderwarm pb-4">
            <h2 className="text-2xl font-bold text-textprimary">
              Recent Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-textmuted">({reviews.length} approved)</span>
              )}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-textsecondary">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Verified reviews only
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-bgpanel/20 rounded-3xl border border-borderwarm/50 border-dashed"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
                <MessageSquare size={28} className="text-brand-500/60" />
              </div>
              <h3 className="text-xl font-bold text-textprimary mb-2">No reviews yet</h3>
              <p className="text-textsecondary max-w-sm mx-auto leading-relaxed">
                Be the first to share your experience with AdMind and help others discover it!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden" animate="visible" variants={STAGGER_CONTAINER}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      {!isAuthenticated && (
        <footer className="relative z-10 bg-bgbase border-t border-borderwarm py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
            </div>
            <p className="text-textsecondary mb-6 max-w-sm">
              The AI co-pilot for digital marketers. Build campaigns, analyze performance, and write converting copy in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Resources</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><Link to="/blog" className="hover:text-brand-500 transition-colors">Blog</Link></li>
              <li><Link to="/community" className="hover:text-brand-500 transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Company</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-borderwarm flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textmuted">
          <div>&copy; {new Date().getFullYear()} AdMind Inc. Made in India 🇮🇳 by Vivek Yadav.</div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-textprimary transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-textprimary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
