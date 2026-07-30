import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, BarChart3, TrendingUp, Target, Megaphone, 
  Search, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Play
} from 'lucide-react'

import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function LandingPage() {
  // Force dark mode for landing page to make it pop
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      // Re-evaluate on unmount if needed, but App/Layout usually handles it
      const saved = localStorage.getItem('theme')
      if (saved !== 'dark') document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <LandingNav />
      
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 lg:px-8 overflow-hidden">
        {/* Animated Blobs Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="landing-blob bg-brand-500/20 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
          <div className="landing-blob bg-purple-500/10 w-[500px] h-[500px] bottom-[10%] right-[-10%]" style={{ animationDelay: '-5s' }} />
          <div className="landing-blob bg-blue-500/10 w-[400px] h-[400px] top-[40%] left-[40%]" style={{ animationDelay: '-10s' }} />
        </div>
        
        {/* Metric Cards & Kites from AnimatedBackground (set density to low to avoid cluttering Hero text) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <AnimatedBackground density="minimal" showKite={true} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center mt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={STAGGER_CONTAINER}
          >
            <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-borderwarm backdrop-blur-md mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-sm font-medium text-textsecondary">AdMind v2.0 is live</span>
            </motion.div>

            <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-7xl font-bold tracking-tight text-textprimary mb-8 leading-tight font-serif">
              The AI Brain Behind <br />
              <span className="landing-gradient-text italic pr-2">Winning Ad Campaigns</span>
            </motion.h1>

            <motion.p variants={FADE_UP_VARIANTS} className="text-xl text-textmuted max-w-2xl mx-auto mb-12 leading-relaxed">
              Stop guessing what works. Our 3-agent pipeline audits your campaigns, builds a strategy, and rewrites your copy in seconds.
            </motion.p>

            <motion.div variants={FADE_UP_VARIANTS} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto landing-shimmer-btn btn-primary text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(217,119,87,0.4)]">
                Start Analyzing for Free <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto btn-secondary text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2">
                <Play size={20} className="text-brand-500" /> See How It Works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="relative z-10 py-8 border-y border-borderwarm bg-bgpanel/30 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-12 [&_img]:max-w-none animate-[marquee_30s_linear_infinite]">
              {/* Duplicate list for seamless looping */}
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  <li className="flex items-center gap-2 text-textmuted font-semibold tracking-wider text-sm uppercase">
                    <Cpu size={20} /> Powered by Google Gemini AI
                  </li>
                  <li className="flex items-center gap-2 text-textmuted font-semibold tracking-wider text-sm uppercase">
                    <Zap size={20} /> Built on FastAPI
                  </li>
                  <li className="flex items-center gap-2 text-textmuted font-semibold tracking-wider text-sm uppercase">
                    <TrendingUp size={20} /> Real-time Streaming
                  </li>
                  <li className="flex items-center gap-2 text-textmuted font-semibold tracking-wider text-sm uppercase">
                    <ShieldCheck size={20} /> Bank-grade Security
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Features / How It Works */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={FADE_UP_VARIANTS}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-textprimary mb-6">Three specialized agents.<br/>One perfect strategy.</h2>
          <p className="text-lg text-textmuted max-w-2xl mx-auto">
            Our multi-agent architecture divides the work just like a real growth team. 
            The result? Expert-level optimization in seconds.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Search,
              title: "Campaign Auditor",
              desc: "Scans your CSV data for wasted spend, low CTR keywords, and high CPC issues. Identifies the leaks in your funnel instantly."
            },
            {
              icon: Target,
              title: "Strategy Advisor",
              desc: "Turns audit findings into prioritized actions. Know exactly what to pause, where to reduce bids, and how to reallocate budget."
            },
            {
              icon: Megaphone,
              title: "Ad Copywriter",
              desc: "Automatically rewrites underperforming ad copy. Generates stronger headlines and clearer calls-to-action aligned with search intent."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={FADE_UP_VARIANTS}
              className="bg-bgpanel border border-borderwarm rounded-3xl p-8 hover:border-brand-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,119,87,0.1)] group"
            >
              <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={28} className="text-brand-500" />
              </div>
              <h3 className="text-2xl font-bold text-textprimary mb-4">{feature.title}</h3>
              <p className="text-textmuted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Product Preview Showcase */}
      <section className="relative z-10 py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-[2.5rem] p-4 bg-gradient-to-b from-borderwarm to-transparent backdrop-blur-sm"
        >
          <div className="bg-bgpanel rounded-[2rem] border border-borderwarm overflow-hidden shadow-2xl relative">
            <div className="h-12 bg-bgpanelhover border-b border-borderwarm flex items-center px-6 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-bgbase border border-borderwarm text-xs text-textmuted font-mono">
                admind.ai/analyze
              </div>
            </div>
            
            {/* Mock Dashboard UI */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                    <Target className="text-brand-500" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-textprimary">Optimization Report</h3>
                    <p className="text-textmuted">Generated in 4.2 seconds</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-24 rounded-xl bg-bgbase border border-borderwarm p-4 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-red-400">Critical Issue Found</span>
                      <span className="text-xs text-textmuted">Keyword: "cheap software"</span>
                    </div>
                    <div className="h-2 w-full bg-bgpanel rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-[85%]"></div>
                    </div>
                  </div>
                  
                  <div className="h-32 rounded-xl bg-bgbase border border-borderwarm p-5">
                    <h4 className="text-sm font-semibold text-textprimary mb-3">AI Recommendation</h4>
                    <p className="text-sm text-textmuted">Pause keyword "cheap software". It has consumed $450 with 0 conversions in the last 30 days. Reallocate budget to top performing ad group "Enterprise Solutions".</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="h-full w-full rounded-2xl bg-bgbase border border-borderwarm relative overflow-hidden flex items-center justify-center">
                  {/* Abstract visualization */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent"></div>
                  <BarChart3 size={100} className="text-textmuted/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bgbase to-transparent h-1/2 flex items-end">
                    <div className="w-full flex items-end gap-2 h-24">
                      {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-brand-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. Benefits */}
      <section className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-textprimary mb-6">Save Hours of Manual Analysis</h2>
            <p className="text-lg text-textmuted mb-8 leading-relaxed">
              Stop exporting endless CSVs to Excel and wrestling with pivot tables. AdMind processes thousands of rows of campaign data and extracts the signal from the noise instantly.
            </p>
            <ul className="space-y-4">
              {['Upload your raw CSV export', 'AI analyzes metrics instantly', 'Get a structured optimization report'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-textprimary font-medium">
                  <CheckCircle2 className="text-brand-500" size={20} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="h-80 rounded-3xl bg-bgpanel border border-borderwarm shadow-lg relative overflow-hidden flex items-center justify-center"
          >
             <div className="absolute inset-0 bg-brand-500/5 opacity-50"></div>
             <Search size={80} className="text-brand-500/20" />
          </motion.div>
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="relative z-10 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-brand-900/20 pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold font-serif text-white mb-8"
          >
            Your next campaign deserves <span className="text-brand-400 italic">better data.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-textmuted mb-12 max-w-2xl mx-auto"
          >
            Join top marketers using multi-agent AI to uncover hidden revenue and scale profitable campaigns faster.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
             <Link to="/signup" className="landing-shimmer-btn inline-flex items-center justify-center gap-2 btn-primary text-xl px-10 py-5 rounded-2xl shadow-[0_0_40px_rgba(217,119,87,0.5)]">
              Start Analyzing for Free <ArrowRight size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-borderwarm bg-bgbase py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-sm">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-textprimary">AdMind</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-textmuted">
            <Link to="/login" className="hover:text-textprimary transition-colors">Log in</Link>
            <Link to="/signup" className="hover:text-textprimary transition-colors">Sign up</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-textprimary transition-colors">GitHub</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 text-center md:text-left text-sm text-textmuted/60">
          &copy; {new Date().getFullYear()} AdMind Inc. Built by Vivek Yadav.
        </div>
      </footer>
    </div>
  )
}
