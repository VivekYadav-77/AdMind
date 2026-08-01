import React, { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Tags } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'
import { BLOG_POSTS } from '../data/blogPosts'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

export default function BlogPost() {
  const { id } = useParams()
  const post = BLOG_POSTS.find(p => p.id === parseInt(id))

  useEffect(() => {
    document.documentElement.classList.add('dark')
    window.scrollTo(0, 0)
    return () => {
      const saved = localStorage.getItem('theme')
      if (saved !== 'dark') document.documentElement.classList.remove('dark')
    }
  }, [id])

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <AnimatedBackground />
      <LandingNav />

      <article className="relative pt-32 pb-32 px-6 lg:px-8 max-w-4xl mx-auto z-10">
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="space-y-8"
        >
          <motion.div variants={FADE_UP_VARIANTS}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 transition-colors group mb-8">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to all articles
            </Link>
          </motion.div>

          <motion.div variants={FADE_UP_VARIANTS} className="flex flex-wrap items-center gap-4 text-sm text-textmuted">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bgpanel/50 border border-brand-500/30 text-brand-400 font-medium">
              <Tags size={14} /> {post.tag}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {post.readTime}
            </span>
            <span>•</span>
            <span>{post.date}</span>
          </motion.div>

          <motion.h1 variants={FADE_UP_VARIANTS} className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight leading-tight">
            {post.title}
          </motion.h1>
          
          <motion.div variants={FADE_UP_VARIANTS} className="flex items-center gap-3 pt-6 border-t border-borderwarm">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div className="font-medium text-textprimary">{post.author}</div>
          </motion.div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 max-w-none 
            [&>h2]:text-3xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:text-textprimary [&>h2]:mt-10 [&>h2]:mb-6
            [&>h3]:text-2xl [&>h3]:font-serif [&>h3]:font-bold [&>h3]:text-textprimary [&>h3]:mt-8 [&>h3]:mb-4
            [&>p]:text-lg [&>p]:text-textsecondary [&>p]:leading-relaxed [&>p]:mb-6
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-lg [&>ul]:text-textsecondary [&>ul]:mb-6
            [&>ul>li]:mb-2 [&>ul>li::marker]:text-brand-500
            [&>blockquote]:border-l-4 [&>blockquote]:border-brand-500 [&>blockquote]:bg-bgpanel/30 [&>blockquote]:py-3 [&>blockquote]:px-6 [&>blockquote]:rounded-r-xl [&>blockquote]:mb-6 [&>blockquote]:italic
            [&>p>strong]:text-textprimary
            backdrop-blur-sm bg-bgpanel/20 p-8 md:p-12 rounded-3xl border border-borderwarm/50"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
      </article>

      {/* Footer minimal */}
      <footer className="relative z-10 bg-bgbase border-t border-borderwarm py-12 px-6 lg:px-8 text-center text-sm text-textmuted">
        <div>&copy; {new Date().getFullYear()} AdMind Inc.</div>
      </footer>
    </div>
  )
}
