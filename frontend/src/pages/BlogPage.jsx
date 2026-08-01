import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowRight, Tags } from 'lucide-react'
import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const BLOG_POSTS = [
  {
    id: 1,
    title: "10 AI Prompts to Supercharge Your Facebook Ads",
    excerpt: "Discover the best prompts to generate high-converting ad copy for Meta platforms using AI.",
    tag: "AI",
    readTime: "5 min",
    date: "Oct 12, 2026",
    author: "Vivek Yadav",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Competitor Teardowns",
    excerpt: "Learn how to legally spy on your competitors' ads and uncover their winning strategies.",
    tag: "Strategy",
    readTime: "8 min",
    date: "Oct 10, 2026",
    author: "AdMind Team",
  },
  {
    id: 3,
    title: "Why A/B Testing Your Copy is Non-Negotiable",
    excerpt: "Stop guessing. Start testing. We break down the math behind incremental copy improvements.",
    tag: "Copy",
    readTime: "6 min",
    date: "Oct 05, 2026",
    author: "AdMind Team",
  },
  {
    id: 4,
    title: "Audience Building in a Privacy-First World",
    excerpt: "With tracking limitations, how do you find your ideal customers? AI-driven persona building.",
    tag: "Strategy",
    readTime: "7 min",
    date: "Sep 28, 2026",
    author: "Vivek Yadav",
  },
  {
    id: 5,
    title: "Landing Page Audit Checklist for 2026",
    excerpt: "Is your landing page leaking conversions? Use this 15-point checklist to plug the holes.",
    tag: "CRO",
    readTime: "10 min",
    date: "Sep 20, 2026",
    author: "AdMind Team",
  },
  {
    id: 6,
    title: "How AdMind Uses Gemini to Write Better Ads",
    excerpt: "A behind-the-scenes look at the architecture powering our AI copywriter.",
    tag: "Engineering",
    readTime: "12 min",
    date: "Sep 15, 2026",
    author: "Vivek Yadav",
  },
]

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('All')

  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      const saved = localStorage.getItem('theme')
      if (saved !== 'dark') document.documentElement.classList.remove('dark')
    }
  }, [])

  const tags = ['All', ...new Set(BLOG_POSTS.map(post => post.tag))]
  const filteredPosts = activeTag === 'All' ? BLOG_POSTS : BLOG_POSTS.filter(post => post.tag === activeTag)

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <AnimatedBackground />
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-brand-500/30 text-brand-400 text-sm font-medium backdrop-blur-sm">
            <BookOpen size={16} />
            <span>AdMind Insights</span>
          </motion.div>
          <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-7xl font-bold font-serif tracking-tight">
            Latest <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">News & Articles</span>
          </motion.h1>
          <motion.p variants={FADE_UP_VARIANTS} className="text-xl text-textsecondary max-w-2xl mx-auto">
            Deep dives on AI, digital marketing, ad strategy, and how to get the most out of AdMind.
          </motion.p>
        </motion.div>
      </section>

      {/* Blog Content Section */}
      <section className="relative z-10 px-6 lg:px-8 pb-32 max-w-7xl mx-auto">
        {/* Tags Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2.5 relative z-20 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTag === tag 
                  ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(217,119,87,0.4)]' 
                  : 'bg-bgpanel/40 text-textsecondary hover:text-textprimary hover:bg-bgpanel border border-borderwarm backdrop-blur-sm'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <motion.div 
          key={activeTag}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20"
        >
          {filteredPosts.map(post => (
            <motion.article 
              key={post.id}
              variants={FADE_UP_VARIANTS}
              className="group bg-bgpanel/40 border border-borderwarm rounded-3xl p-6 hover:bg-bgpanel/70 transition-all duration-300 flex flex-col h-full backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-4 text-sm text-textmuted z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bgbase/80 border border-borderwarm">
                  <Tags size={14} className="text-brand-500" /> {post.tag}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {post.readTime}
                </span>
              </div>
              
              <h2 className="text-2xl font-serif font-bold text-textprimary mb-3 group-hover:text-brand-400 transition-colors z-10">
                {post.title}
              </h2>
              
              <p className="text-textsecondary mb-6 flex-grow z-10 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-borderwarm z-10">
                <div className="text-sm font-medium text-textprimary">
                  {post.author} • <span className="text-textmuted font-normal">{post.date}</span>
                </div>
                <Link to="#" className="text-brand-500 bg-brand-500/10 p-2 rounded-full group-hover:bg-brand-500 group-hover:text-white transition-all cursor-pointer relative z-30">
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-textmuted">
            No articles found for the selected category.
          </div>
        )}
      </section>

      {/* Reused Footer from LandingPage */}
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
              <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Contact</a></li>
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
    </div>
  )
}
