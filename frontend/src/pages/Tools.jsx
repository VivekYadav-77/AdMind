import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Swords, Loader2, Link2, FileText, ArrowRight, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { API } from '../services/api'

export default function Tools() {
  const [activeTab, setActiveTab] = useState('landing-page')
  const [loading, setLoading] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [inputDesc, setInputDesc] = useState('')
  const [inputAd, setInputAd] = useState('')
  
  const [landingResult, setLandingResult] = useState(null)
  const [audienceResult, setAudienceResult] = useState(null)
  const [competitorResult, setCompetitorResult] = useState(null)
  const [error, setError] = useState(null)

  const handleLandingAudit = async (e) => {
    e.preventDefault()
    if (!inputUrl) return
    setLoading(true)
    setError(null)
    try {
      const res = await API.auditLandingPage(inputUrl)
      setLandingResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAudienceBuild = async (e) => {
    e.preventDefault()
    if (!inputDesc) return
    setLoading(true)
    setError(null)
    try {
      const res = await API.buildAudience(inputDesc)
      setAudienceResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompetitorTeardown = async (e) => {
    e.preventDefault()
    if (!inputAd) return
    setLoading(true)
    setError(null)
    try {
      const res = await API.competitorTeardown(inputAd)
      setCompetitorResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'landing-page', label: 'Landing Page Auditor', icon: Search, color: 'brand' },
    { id: 'audience', label: 'Audience Builder', icon: Users, color: 'emerald' },
    { id: 'competitor', label: 'Competitor Teardown', icon: Swords, color: 'amber' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(null) }}
              className={clsx(
                "flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-medium transition-all border-b-2",
                isActive 
                  ? "bg-bgpanelhover border-borderwarm text-brand-400 font-bold shadow-[0_0_15px_rgba(217,119,87,0.1)]" 
                  : "border-transparent text-textmuted hover:bg-bgpanel hover:text-textprimary"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 font-semibold shadow-lg">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'landing-page' && (
          <motion.div key="landing-page" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="glass-panel rounded-3xl p-8 border-brand-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
              <h2 className="text-2xl font-serif text-textprimary mb-2">CRO Landing Page Auditor</h2>
              <p className="text-textmuted mb-8 font-medium">Paste your landing page URL. Our AI will analyze the text for conversion rate optimization opportunities.</p>
              
              <form onSubmit={handleLandingAudit} className="flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link2 className="text-textmuted" size={20} />
                  </div>
                  <input 
                    type="url" 
                    required
                    placeholder="https://your-landing-page.com" 
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    className="w-full bg-bgpanel border border-borderwarm rounded-xl py-3 pl-12 pr-4 text-textprimary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-textmuted"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                  Audit Page
                </button>
              </form>

              {landingResult && (
                <div className="mt-10 p-6 bg-[#1C1C19] rounded-2xl border border-borderwarm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-400 font-serif text-3xl">
                      {landingResult.score}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-textprimary">CRO Score</h3>
                      <p className="text-sm text-textmuted">Based on standard conversion principles</p>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: landingResult.analysis.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'audience' && (
          <motion.div key="audience" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="glass-panel rounded-3xl p-8 border-emerald-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <h2 className="text-2xl font-serif text-textprimary mb-2">AI Audience Builder</h2>
              <p className="text-textmuted mb-8 font-medium">Describe your product or service. Our AI will build the perfect targeting parameters for Meta and Google.</p>
              
              <form onSubmit={handleAudienceBuild} className="flex flex-col gap-4">
                <textarea 
                  required
                  rows="4"
                  placeholder="E.g., We sell organic, ethically-sourced coffee beans directly to consumers who care about fair trade and premium taste." 
                  value={inputDesc}
                  onChange={e => setInputDesc(e.target.value)}
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl p-4 text-textprimary focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-textmuted"
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Users size={20} />}
                    Build Audience
                  </button>
                </div>
              </form>

              {audienceResult && (
                <div className="mt-10 grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-black text-blue-400 mb-4 flex items-center gap-2"><CheckCircle2 size={20}/> Meta Ads Targeting</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-textmuted uppercase tracking-wider mb-2">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {audienceResult.meta.interests.map((t, i) => (
                            <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-medium border border-blue-500/30">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-textmuted uppercase tracking-wider mb-2">Behaviors</h4>
                        <div className="flex flex-wrap gap-2">
                          {audienceResult.meta.behaviors.map((t, i) => (
                            <span key={i} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium border border-purple-500/30">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2"><CheckCircle2 size={20}/> Google Ads Targeting</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-textmuted uppercase tracking-wider mb-2">In-Market Segments</h4>
                        <div className="flex flex-wrap gap-2">
                          {audienceResult.google.in_market.map((t, i) => (
                            <span key={i} className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg text-sm font-medium border border-amber-500/30">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-textmuted uppercase tracking-wider mb-2">Search Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {audienceResult.google.keywords.map((t, i) => (
                            <span key={i} className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm font-medium border border-emerald-500/30">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'competitor' && (
          <motion.div key="competitor" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="glass-panel rounded-3xl p-8 border-amber-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
              <h2 className="text-2xl font-serif text-textprimary mb-2">Competitor Tear-Down</h2>
              <p className="text-textmuted mb-8 font-medium">Paste a competitor's ad copy. AI will analyze their psychological angle and write 3 counter-ads to steal their traffic.</p>
              
              <form onSubmit={handleCompetitorTeardown} className="flex flex-col gap-4">
                <textarea 
                  required
                  rows="5"
                  placeholder="Paste competitor ad copy here..." 
                  value={inputAd}
                  onChange={e => setInputAd(e.target.value)}
                  className="w-full bg-bgpanel border border-borderwarm rounded-xl p-4 text-textprimary focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none placeholder:text-textmuted"
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] transition-all hover:-translate-y-0.5"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Swords size={20} />}
                    Analyze & Counter
                  </button>
                </div>
              </form>

              {competitorResult && (
                <div className="mt-10 space-y-6">
                  <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20">
                    <h3 className="text-lg font-medium text-amber-400 mb-2 uppercase tracking-widest">Their Strategy</h3>
                    <p className="text-textsecondary">{competitorResult.analysis}</p>
                  </div>

                  <h3 className="text-2xl font-serif text-textprimary mt-8 mb-4">Your Counter-Ads</h3>
                  <div className="grid lg:grid-cols-3 gap-6">
                    {competitorResult.counter_ads.map((ad, i) => (
                      <div key={i} className="card-warm p-6 hover:border-amber-500/30 transition-all flex flex-col h-full">
                        <div className="mb-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Angle</span>
                          <h4 className="text-lg font-serif text-brand-400">{ad.angle}</h4>
                        </div>
                        <div className="mb-4 flex-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-textmuted block mb-1">Primary Text</span>
                          <p className="text-sm text-textmuted italic">"{ad.primary_text}"</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-textmuted block mb-1">Headline</span>
                          <p className="text-base font-medium text-textprimary">{ad.headline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
