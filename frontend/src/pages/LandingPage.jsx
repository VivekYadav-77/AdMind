import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, BarChart3, TrendingUp, Target, Megaphone, 
  Search, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Play,
  ChevronDown, Building2, Briefcase, User, Star,
  Check, X, FileSpreadsheet, ArrowDown, Activity, Sparkles, AlertTriangle, Quote
} from 'lucide-react'

import LandingNav from '../components/LandingNav'
import AnimatedBackground from '../components/AnimatedBackground'
import Logo from '../components/Logo'

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

// Stats Counter Component
function StatBox({ value, label, prefix = "", suffix = "" }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-bgpanel/50 border border-borderwarm rounded-3xl backdrop-blur-sm">
      <div className="text-4xl md:text-5xl font-bold font-serif text-brand-500 mb-2">
        {prefix}{value}{suffix}
      </div>
      <div className="text-textmuted text-sm uppercase tracking-wider font-semibold">{label}</div>
    </div>
  )
}

export default function LandingPage() {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const [activeFaq, setActiveFaq] = useState(null)
  const [activeTab, setActiveTab] = useState('audit')
  const [reviews, setReviews] = useState([])

  // Auto-rotate tabs in preview
  useEffect(() => {
    const tabs = ['audit', 'strategy', 'copy']
    const interval = setInterval(() => {
      setActiveTab(current => {
        const nextIndex = (tabs.indexOf(current) + 1) % tabs.length
        return tabs[nextIndex]
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch approved reviews for Wall of Love
  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => {})
  }, [])

  const faqs = [
    { q: "Is my campaign data secure?", a: "Absolutely. We do not store your raw CSV data after processing. All analysis is done in memory, and your proprietary campaign data is never used to train our models." },
    { q: "Which ad platforms do you support?", a: "Currently, AdMind is optimized for Google Ads and Meta Ads (Facebook/Instagram) CSV exports. We are actively working on adding support for TikTok and LinkedIn Ads." },
    { q: "How is this different from native platform recommendations?", a: "Native platform recommendations are designed to increase your spend. AdMind's agents are designed to increase your profit margin by finding wasted spend that platforms want you to ignore." },
    { q: "Can I export the ad copy rewrites?", a: "Yes! All rewritten ad copy can be exported as a CSV or copied directly to your clipboard in a format ready to be pasted into Google Ads Editor." }
  ]

  const useCases = [
    { icon: Building2, title: "For Ad Agencies", desc: "Scale your team without hiring. Audit new client accounts in seconds, not days. Deliver white-labeled optimization reports that close deals faster." },
    { icon: Briefcase, title: "For E-commerce Brands", desc: "Stop bleeding money on unprofitable products. AdMind instantly spots which campaigns are dragging down your overall ROAS so you can scale winners." },
    { icon: User, title: "For Solo Media Buyers", desc: "Get an AI second opinion on your strategies. Ensure you haven't missed negative keywords or budget reallocation opportunities." }
  ]

  

  return (
    <div className="min-h-screen bg-bgbase text-textprimary overflow-hidden selection:bg-brand-500/30 font-sans">
      <LandingNav />
      
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="landing-blob bg-brand-500/20 w-[600px] h-[600px] top-[-10%] left-[-10%]" />
          <div className="landing-blob bg-purple-500/10 w-[500px] h-[500px] bottom-[10%] right-[-10%]" style={{ animationDelay: '-5s' }} />
          <div className="landing-blob bg-blue-500/10 w-[400px] h-[400px] top-[40%] left-[40%]" style={{ animationDelay: '-10s' }} />
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <AnimatedBackground density="minimal" showKite={true} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center mt-12">
          <motion.div initial="hidden" animate="visible" variants={STAGGER_CONTAINER}>
            <motion.div variants={FADE_UP_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-borderwarm backdrop-blur-md mb-8 shadow-sm">
              <Sparkles size={16} className="text-brand-500" />
              <span className="text-sm font-medium text-textsecondary">3 AI Agents </span>
            </motion.div>
            
            <motion.h1 variants={FADE_UP_VARIANTS} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-textprimary mb-8 leading-[1.1] font-serif">
              The AI Brain Behind <br />
              <span className="landing-gradient-text italic pr-2">Winning Campaigns</span>
            </motion.h1>
            
            <motion.p variants={FADE_UP_VARIANTS} className="text-xl text-textmuted max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop guessing what works. Our multi-agent pipeline audits your campaigns, builds a strategy, and rewrites your copy in seconds.
            </motion.p>
            
            <motion.div variants={FADE_UP_VARIANTS} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup" className="w-full sm:w-auto landing-shimmer-btn btn-primary text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_var(--brand-glow)] hover:shadow-[0_0_40px_var(--brand-glow-max)]">
                Start Analyzing for Free <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto btn-secondary text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 group">
                <Play size={20} className="text-brand-500 group-hover:scale-110 transition-transform" /> See How It Works
              </a>
            </motion.div>
            
            
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section className="relative z-10 py-12 border-y border-borderwarm bg-bgpanel/30 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBox prefix="$" value="2.4M" suffix="+" label="Wasted Spend Found" />
            <StatBox value="98" suffix="%" label="Audit Accuracy" />
            <StatBox value="3" label="Specialized Agents" />
            <StatBox prefix="<" value="5" suffix="s" label="Analysis Time" />
          </div>
        </div>
      </section>

      {/* 3. How It Works - Architecture */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP_VARIANTS} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-textprimary mb-6">The 3-Agent Pipeline Explained</h2>
          <p className="text-lg text-textmuted max-w-2xl mx-auto">
            Instead of asking one generic AI model to do everything, AdMind uses specialized agents that pass their findings down a structured pipeline.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[120px] left-[10%] right-[10%] h-1 bg-borderwarm overflow-hidden rounded-full">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {/* Step 0: Input */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-bgpanel border border-borderwarm flex items-center justify-center shadow-lg mb-6 relative">
                <FileSpreadsheet size={28} className="text-textmuted" />
                <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-bgbase">CSV</div>
              </div>
              <h3 className="text-xl font-bold mb-2">1. Upload Data</h3>
              <p className="text-center text-textmuted text-sm mb-6">Export your Google Ads or Meta Ads performance CSV.</p>
              
              <div className="w-full bg-bgpanel border border-borderwarm rounded-xl p-3 shadow-inner">
                <div className="text-[10px] font-mono text-textmuted opacity-50 mb-1">RAW DATA</div>
                <div className="text-xs font-mono text-textsecondary truncate">Campaign,Clicks,Spend</div>
                <div className="text-xs font-mono text-textsecondary truncate">Q3_Promo,1204,$450.20</div>
              </div>
            </motion.div>

            {/* Step 1: Auditor */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center pt-8">
              <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shadow-[0_0_20px_var(--brand-glow-subtle)] mb-6">
                <Search size={32} className="text-brand-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-brand-400">2. Auditor Agent</h3>
              <p className="text-center text-textmuted text-sm mb-6">Scans the CSV to find anomalies, high CPCs, and wasted spend.</p>
              
              <div className="w-full bg-bgpanel border border-borderwarm rounded-xl p-3 shadow-inner relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="text-[10px] font-mono text-textmuted opacity-50 mb-1 ml-2">OUTPUT: JSON</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"issue": "High CPA"</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"severity": "high"</div>
              </div>
            </motion.div>

            {/* Step 2: Strategist */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col items-center pt-8">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)] mb-6">
                <Target size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-amber-400">3. Strategy Agent</h3>
              <p className="text-center text-textmuted text-sm mb-6">Reads the audit and formulates a step-by-step action plan.</p>
              
              <div className="w-full bg-bgpanel border border-borderwarm rounded-xl p-3 shadow-inner relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                <div className="text-[10px] font-mono text-textmuted opacity-50 mb-1 ml-2">OUTPUT: JSON</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"action": "Pause"</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"target": "Keyword X"</div>
              </div>
            </motion.div>

            {/* Step 3: Copywriter */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col items-center pt-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6">
                <Megaphone size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-emerald-400">4. Copywriter Agent</h3>
              <p className="text-center text-textmuted text-sm mb-6">Takes the strategy and rewrites poor performing ad copy.</p>
              
              <div className="w-full bg-bgpanel border border-borderwarm rounded-xl p-3 shadow-inner relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                <div className="text-[10px] font-mono text-textmuted opacity-50 mb-1 ml-2">OUTPUT: TEXT</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"H1: Buy Shoes Now"</div>
                <div className="text-xs font-mono text-textsecondary ml-2">"Desc: Free Shipping."</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Features Grid (Enhanced) */}
      <section id="features" className="relative z-10 py-20 px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div variants={FADE_UP_VARIANTS} className="bg-bgpanel border border-borderwarm rounded-3xl p-10 hover:border-brand-500/50 transition-all duration-300 hover:shadow-[0_0_30px_var(--brand-glow-subtle)] group flex flex-col h-full">
            <div className="h-16 w-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Search size={32} className="text-brand-500" />
            </div>
            <h3 className="text-2xl font-bold text-textprimary mb-4">Deep Campaign Audits</h3>
            <p className="text-textmuted leading-relaxed mb-8 flex-1">
              Stop bleeding money. The Auditor Agent scans thousands of rows to find exactly where your budget is being wasted on irrelevant clicks and non-converting traffic.
            </p>
            <ul className="space-y-3">
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-brand-500 shrink-0" /> Identifies Zero-Conversion Keywords</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-brand-500 shrink-0" /> Calculates Wasted Spend precisely</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-brand-500 shrink-0" /> Flags abnormally high CPCs</li>
            </ul>
          </motion.div>

          <motion.div variants={FADE_UP_VARIANTS} className="bg-bgpanel border border-borderwarm rounded-3xl p-10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] group flex flex-col h-full">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Target size={32} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-textprimary mb-4">Actionable Strategy</h3>
            <p className="text-textmuted leading-relaxed mb-8 flex-1">
              Data is useless without action. The Strategist Agent takes the audit and creates a prioritized punch-list of what to pause, scale, and adjust today.
            </p>
            <ul className="space-y-3">
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-amber-500 shrink-0" /> Prioritized Action Items</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-amber-500 shrink-0" /> Budget Reallocation Advice</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-amber-500 shrink-0" /> Targeting expansion ideas</li>
            </ul>
          </motion.div>

          <motion.div variants={FADE_UP_VARIANTS} className="bg-bgpanel border border-borderwarm rounded-3xl p-10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] group flex flex-col h-full">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Megaphone size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-textprimary mb-4">AI Ad Copywriter</h3>
            <p className="text-textmuted leading-relaxed mb-8 flex-1">
              Don't just pause bad ads, replace them with better ones. The Copywriter Agent rewrites underperforming headlines and descriptions optimized for CTR.
            </p>
            <ul className="space-y-3">
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Before/After Comparisons</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Aligned with search intent</li>
               <li className="flex gap-3 text-textprimary font-medium text-sm"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Ready to copy-paste or export</li>
            </ul>
          </motion.div>

          <motion.div variants={FADE_UP_VARIANTS} className="bg-bgpanel border border-borderwarm rounded-3xl p-10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] group flex flex-col h-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
            <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Activity size={32} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-textprimary mb-4 relative z-10">Live Streaming UI</h3>
            <p className="text-textmuted leading-relaxed mb-8 flex-1 relative z-10">
              Watch the AI think in real-time. AdMind uses Server-Sent Events (SSE) to stream the pipeline's progress live to your dashboard so you never wonder if it's stuck.
            </p>
            
            {/* Mini Pipeline Preview */}
            <div className="mt-4 p-4 rounded-xl bg-bgbase border border-borderwarm relative z-10 flex flex-col gap-2">
               <div className="flex items-center gap-3">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-sm text-textsecondary">Auditor finished (1.2s)</span>
               </div>
               <div className="flex items-center gap-3">
                 <Sparkles size={16} className="text-brand-500 animate-pulse" />
                 <span className="text-sm text-textprimary font-medium">Strategist generating...</span>
               </div>
               <div className="flex items-center gap-3 opacity-50">
                 <div className="w-4 h-4 rounded-full border-2 border-textmuted"></div>
                 <span className="text-sm text-textmuted">Copywriter waiting</span>
               </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 5. Product Preview (Animated Tabs) */}
      <section className="relative z-10 py-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="rounded-[2.5rem] p-4 bg-gradient-to-b from-borderwarm to-transparent backdrop-blur-sm">
          <div className="bg-bgpanel rounded-[2rem] border border-borderwarm overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
            {/* Fake Browser Header */}
            <div className="h-12 bg-bgpanelhover border-b border-borderwarm flex items-center px-6 gap-4">
              <div className="flex gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-32 py-1 rounded-md bg-bgbase border border-borderwarm text-xs text-textmuted font-mono flex items-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  admind.ai/analyze/report-123
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex flex-1 flex-col md:flex-row">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-64 border-r border-borderwarm bg-bgbase p-4 flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab('audit')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-bgpanel shadow-sm text-brand-500 border border-borderwarm' : 'text-textmuted hover:text-textprimary hover:bg-bgpanelhover'}`}
                >
                  <Search size={18} /> Audit Results
                </button>
                <button 
                  onClick={() => setActiveTab('strategy')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'strategy' ? 'bg-bgpanel shadow-sm text-amber-500 border border-borderwarm' : 'text-textmuted hover:text-textprimary hover:bg-bgpanelhover'}`}
                >
                  <Target size={18} /> Strategy Plan
                </button>
                <button 
                  onClick={() => setActiveTab('copy')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'copy' ? 'bg-bgpanel shadow-sm text-emerald-500 border border-borderwarm' : 'text-textmuted hover:text-textprimary hover:bg-bgpanelhover'}`}
                >
                  <Megaphone size={18} /> Ad Copy
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 bg-bgpanel relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'audit' && (
                    <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-textprimary mb-1">Audit Overview</h3>
                        <p className="text-textmuted">Found 12 critical issues causing $2,450 in wasted spend.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                           <div className="text-red-400 text-sm font-bold mb-1">Wasted Spend</div>
                           <div className="text-2xl font-bold text-textprimary">$2,450.00</div>
                        </div>
                        <div className="p-4 rounded-xl border border-borderwarm bg-bgbase">
                           <div className="text-textmuted text-sm font-bold mb-1">Total Ad Spend</div>
                           <div className="text-2xl font-bold text-textprimary">$12,400.00</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-borderwarm bg-bgbase">
                        <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                          <AlertTriangle size={18} /> Critical: Zero-Conversion Keywords
                        </div>
                        <p className="text-sm text-textsecondary">
                          Keyword "software automation tools" consumed $450 with 0 conversions. 
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'strategy' && (
                    <motion.div key="strategy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-textprimary mb-1">Strategic Recommendations</h3>
                        <p className="text-textmuted">Prioritized actions based on the audit.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                            <span className="text-amber-500 font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-textprimary mb-1">Pause "software automation tools"</h4>
                            <p className="text-sm text-textsecondary">Immediately pause this keyword. It is bleeding budget. Reallocate the $450/mo to your top performing Campaign "Q3_Promo".</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-borderwarm bg-bgbase flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-bgpanel border border-borderwarm flex items-center justify-center shrink-0 mt-1">
                            <span className="text-textmuted font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-textprimary mb-1">Decrease Bid on "CRM pricing" by 25%</h4>
                            <p className="text-sm text-textsecondary">Cost per conversion is 40% higher than account average. Reduce bid to target a more profitable CPA.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'copy' && (
                    <motion.div key="copy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-textprimary mb-1">Ad Copy Rewrites</h3>
                          <p className="text-textmuted">Generated new variants for low-CTR ads.</p>
                        </div>
                        <button className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg font-bold border border-emerald-500/20">
                          Export CSV
                        </button>
                      </div>
                      
                      <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 relative">
                        <div className="absolute top-0 right-4 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Winner Variant</div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs font-bold text-textmuted uppercase mb-2">Original (CTR: 1.2%)</div>
                            <div className="text-sm text-textsecondary line-through opacity-70">
                              Software for business. Buy our software today. It is good.
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-400 uppercase mb-2">AI Rewrite (Target)</div>
                            <div className="text-sm font-medium text-textprimary">
                              Automate Your Workflows. Save 10 Hours a Week. Start Free Trial Today.
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. Comparison Table (AdMind vs Native) */}
      <section className="relative z-10 py-24 px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP_VARIANTS} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-textprimary mb-6">Why not just use platform recommendations?</h2>
          <p className="text-lg text-textmuted max-w-2xl mx-auto">
            Google and Meta's native "Optimization Scores" are designed to increase your ad spend. AdMind is designed to increase your profit margin.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-bgpanel border border-borderwarm rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgpanelhover border-b border-borderwarm">
                <th className="p-6 font-bold text-textprimary text-lg w-1/3">Feature</th>
                <th className="p-6 font-bold text-textmuted text-lg border-l border-borderwarm bg-bgbase/50">Native Platforms</th>
                <th className="p-6 font-bold text-brand-500 text-lg border-l border-borderwarm bg-brand-500/5">AdMind</th>
              </tr>
            </thead>
            <tbody className="text-textsecondary">
              <tr className="border-b border-borderwarm">
                <td className="p-6 font-medium">Primary Goal</td>
                <td className="p-6 border-l border-borderwarm bg-bgbase/50">Increase Ad Spend</td>
                <td className="p-6 border-l border-borderwarm bg-brand-500/5 font-bold text-textprimary">Increase Profit Margin</td>
              </tr>
              <tr className="border-b border-borderwarm">
                <td className="p-6 font-medium">Finds Wasted Spend</td>
                <td className="p-6 border-l border-borderwarm bg-bgbase/50"><X className="text-red-400" /></td>
                <td className="p-6 border-l border-borderwarm bg-brand-500/5"><Check className="text-emerald-500" /></td>
              </tr>
              <tr className="border-b border-borderwarm">
                <td className="p-6 font-medium">Multi-Platform Support</td>
                <td className="p-6 border-l border-borderwarm bg-bgbase/50"><X className="text-red-400" /></td>
                <td className="p-6 border-l border-borderwarm bg-brand-500/5 font-medium text-textprimary">Google & Meta CSVs</td>
              </tr>
              <tr className="border-b border-borderwarm">
                <td className="p-6 font-medium">AI Copy Rewrites</td>
                <td className="p-6 border-l border-borderwarm bg-bgbase/50"><X className="text-red-400" /></td>
                <td className="p-6 border-l border-borderwarm bg-brand-500/5"><Check className="text-emerald-500" /></td>
              </tr>
              <tr>
                <td className="p-6 font-medium">Objective Advice</td>
                <td className="p-6 border-l border-borderwarm bg-bgbase/50"><X className="text-red-400" /></td>
                <td className="p-6 border-l border-borderwarm bg-brand-500/5"><Check className="text-emerald-500" /></td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* 7. Use Cases */}
      <section id="use-cases" className="relative z-10 py-24 px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP_VARIANTS} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-textprimary mb-6">Built for growth teams of all sizes.</h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc, idx) => (
            <motion.div key={idx} variants={FADE_UP_VARIANTS} className="bg-bgbase border border-borderwarm p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 hover:shadow-lg group">
              <uc.icon size={32} className="text-brand-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-textprimary mb-3">{uc.title}</h3>
              <p className="text-textmuted leading-relaxed mb-6">{uc.desc}</p>
              <Link to="/signup" className="text-brand-500 font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                See how it works <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

        {/* 8. Wall of Love — Live Reviews from API */}
      {reviews.length > 0 && (
        <section className="relative z-10 py-24 overflow-hidden border-y border-borderwarm bg-bgpanel/20">
          {/* Fade-out edges */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bgbase to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bgbase to-transparent z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 text-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={FADE_UP_VARIANTS}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bgpanel/50 border border-brand-500/30 text-brand-400 text-sm font-medium backdrop-blur-sm mb-6">
                <Star size={14} fill="currentColor" />
                <span>Wall of Love</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-textprimary mb-4">
                Loved by marketers worldwide.
              </h2>
              <p className="text-textmuted">
                {reviews.length} verified review{reviews.length !== 1 ? 's' : ''} from real users &mdash;
                {reviews.length > 0 && (
                  <span className="text-yellow-500 font-medium ml-1">
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} ★ avg
                  </span>
                )}
              </p>
            </motion.div>
          </div>

          {/* Marquee Row 1 */}
          <div className="relative overflow-hidden mb-4">
            <div
              className="flex gap-4 w-max"
              style={{
                animation: 'marquee-ltr 35s linear infinite',
              }}
            >
              {[...reviews, ...reviews].map((review, i) => (
                <div
                  key={i}
                  className="w-80 shrink-0 bg-bgpanel border border-borderwarm rounded-2xl p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13}
                        fill={s <= review.rating ? '#EAB308' : 'none'}
                        stroke={s <= review.rating ? '#EAB308' : '#6b7280'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-textsecondary text-sm leading-relaxed italic flex-1">
                    "{review.content.length > 120 ? review.content.slice(0, 120) + '…' : review.content}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-textprimary">{review.author_name}</p>
                      <p className="text-[10px] text-brand-500/80 flex items-center gap-0.5">
                        <CheckCircle2 size={9} /> Verified User
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Row 2 (reverse) */}
          {reviews.length > 1 && (
            <div className="relative overflow-hidden">
              <div
                className="flex gap-4 w-max"
                style={{
                  animation: 'marquee-rtl 40s linear infinite',
                }}
              >
                {[...reviews, ...reviews].reverse().map((review, i) => (
                  <div
                    key={i}
                    className="w-80 shrink-0 bg-bgpanel border border-borderwarm rounded-2xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13}
                          fill={s <= review.rating ? '#EAB308' : 'none'}
                          stroke={s <= review.rating ? '#EAB308' : '#6b7280'}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <p className="text-textsecondary text-sm leading-relaxed italic flex-1">
                      "{review.content.length > 120 ? review.content.slice(0, 120) + '…' : review.content}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-xs">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-textprimary">{review.author_name}</p>
                        <p className="text-[10px] text-brand-500/80 flex items-center gap-0.5">
                          <CheckCircle2 size={9} /> Verified User
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors group"
            >
              Share your experience
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}
      <section id="faq" className="relative z-10 py-32 px-6 lg:px-8 max-w-3xl mx-auto scroll-mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP_VARIANTS} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-textprimary mb-6">Frequently asked questions.</h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="border border-borderwarm bg-bgpanel rounded-2xl overflow-hidden">
              <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                <span className="font-bold text-lg text-textprimary">{faq.q}</span>
                <ChevronDown size={20} className={`text-textmuted transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="p-6 pt-0 text-textmuted leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 11. Final CTA (Enhanced) */}
      <section className="relative z-10 py-32 overflow-hidden border-t border-borderwarm bg-bgbase">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-30">
           <div className="w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-bold font-serif text-textprimary mb-8">
            Your next campaign deserves <span className="text-brand-400 italic">better data.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-textmuted mb-12 max-w-2xl mx-auto">
            Stop wasting budget on underperforming ads. Get a complete audit, strategy, and copy rewrites in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-4">
             <Link to="/signup" className="landing-shimmer-btn inline-flex items-center justify-center gap-2 btn-primary text-xl px-10 py-5 rounded-2xl shadow-[0_0_40px_var(--brand-glow-strong)] hover:scale-105 transition-transform duration-300">
              Start Analyzing for Free <ArrowRight size={24} />
            </Link>
            <span className="text-sm text-textmuted">No credit card required. Free tier forever.</span>
          </motion.div>
        </div>
      </section>

      {/* 12. Mega Footer (Rebuilt) */}
      <footer className="border-t border-borderwarm bg-bgpanel pt-20 pb-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo className="h-10 w-10 text-brand-500" />
              <span className="text-2xl font-bold tracking-tight text-textprimary">AdMind</span>
            </div>
            <p className="text-textmuted mb-8 max-w-sm">
              The multi-agent AI optimizer for growth teams. Find wasted spend and scale winning campaigns effortlessly without leaving your dashboard.
            </p>
            <div className="flex gap-4">
            
              <a href="https://github.com/VivekYadav-77" className="w-10 h-10 rounded-full bg-bgbase border border-borderwarm flex items-center justify-center text-textmuted hover:text-brand-500 hover:border-brand-500/50 transition-colors">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
            
            
          </div>
          <div>
            <h4 className="font-bold text-textprimary mb-4">Product</h4>
            <ul className="space-y-3 text-textmuted text-sm">
              <li><a href="#how-it-works" className="hover:text-brand-500 transition-colors">How it works</a></li>
              <li><a href="#features" className="hover:text-brand-500 transition-colors">Features</a></li>
              
              
            </ul>
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
    </div>
  )
}
