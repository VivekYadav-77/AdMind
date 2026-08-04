import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Beaker, Sparkles, Target, Zap, Globe, ExternalLink, Copy, CheckCircle2, Image as ImageIcon, LayoutTemplate } from 'lucide-react'

function PosterBlueprint({ testData, type, label }) {
  const isA = type === 'A'
  const accentColor = isA ? 'blue' : 'amber'
  const AccentIcon = isA ? Target : Zap

  return (
    <div className={`relative flex flex-col rounded-2xl border-2 border-${accentColor}-500/30 bg-bgpanel overflow-hidden group hover:border-${accentColor}-500/60 transition-colors shadow-lg`}>
      {/* Top Banner */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${accentColor}-400 to-${accentColor}-600`} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-borderwarm bg-bgpanelhover">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-${accentColor}-500/20 text-${accentColor}-400`}>
            <AccentIcon size={16} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-textprimary tracking-tight uppercase">{label}</h4>
            <div className="text-[11px] text-textmuted font-medium">Layout Blueprint</div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-textmuted bg-bgpanel px-2 py-1 rounded border border-borderwarm">
          1080 × 1350
        </div>
      </div>

      {/* Blueprint Area */}
      <div className="p-6 bg-[#0a0a0c] relative flex-1 flex flex-col items-center justify-center min-h-[360px] pattern-grid-lg">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Wireframe Container */}
        <div className="w-[240px] h-[300px] border border-borderwarm bg-bgbase rounded-md flex flex-col relative z-10 overflow-hidden shadow-2xl">
          
          {/* Headline Zone (Top 25%) */}
          <div className="h-[25%] border-b border-dashed border-borderwarm bg-blue-500/5 flex flex-col items-center justify-center p-2 relative group cursor-default">
            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400/70 mb-1">Headline Zone</span>
            <div className="w-3/4 h-2 bg-blue-500/20 rounded-full mb-1"></div>
            <div className="w-1/2 h-2 bg-blue-500/20 rounded-full"></div>
            
            {/* Tooltip */}
            <div className="absolute inset-0 bg-bgpanelhover/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center z-20">
              <p className="text-[10px] text-textprimary leading-tight">Place your hook here. Keep it under 30 chars for maximum impact.</p>
            </div>
          </div>
          
          {/* Visual Focus Area (Center 45%) */}
          <div className="h-[45%] border-b border-dashed border-borderwarm bg-purple-500/5 flex items-center justify-center relative group cursor-default">
            <ImageIcon className="text-purple-500/20 w-12 h-12" />
            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider text-purple-400/70">Visual Focus</span>
            
            {/* Tooltip */}
            <div className="absolute inset-0 bg-bgpanelhover/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center z-20">
              <p className="text-[10px] text-textprimary leading-tight">Main creative element. Use AI generation prompt to fill this area.</p>
            </div>
          </div>
          
          {/* Body Copy (Mid 15%) */}
          <div className="h-[15%] border-b border-dashed border-borderwarm bg-amber-500/5 flex flex-col items-center justify-center p-2 gap-1 relative group cursor-default">
            <span className="absolute top-1 left-2 text-[8px] font-bold uppercase tracking-wider text-amber-400/70">Body Copy</span>
            <div className="w-[85%] h-1.5 bg-amber-500/20 rounded-full mt-2"></div>
            <div className="w-[75%] h-1.5 bg-amber-500/20 rounded-full"></div>
            
            {/* Tooltip */}
            <div className="absolute inset-0 bg-bgpanelhover/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center z-20">
              <p className="text-[10px] text-textprimary leading-tight">Supporting description. Focus on specific benefits.</p>
            </div>
          </div>
          
          {/* CTA Block (Bottom 15%) */}
          <div className="h-[15%] bg-emerald-500/5 flex flex-col items-center justify-center relative group cursor-default">
            <div className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
              CTA Button
            </div>
            {/* Tooltip */}
            <div className="absolute inset-0 bg-bgpanelhover/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-center z-20">
              <p className="text-[10px] text-textprimary leading-tight">Clear, unmistakable action driver (e.g. "Shop Now").</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Content */}
      <div className="p-5 border-t border-borderwarm bg-bgpanelhover">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-textmuted font-bold block mb-1">Headline</span>
            <p className="text-[14px] font-bold text-textprimary leading-tight">{testData?.headline}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-textmuted font-bold block mb-1">Description</span>
            <p className="text-[13px] text-textsecondary leading-relaxed">{testData?.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AIPromptPanel({ posterPrompt }) {
  const [activeTab, setActiveTab] = useState('midjourney')
  const [copied, setCopied] = useState(false)
  
  if (!posterPrompt) return null;

  const midjourneyPrompt = `${posterPrompt} --ar 4:5 --style raw --v 6.0`
  const dallePrompt = `${posterPrompt}. Generate this as a vertical poster format (4:5 aspect ratio) with high professional quality.`

  const activePromptText = activeTab === 'midjourney' ? midjourneyPrompt : dallePrompt

  const handleCopy = () => {
    navigator.clipboard.writeText(activePromptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 rounded-xl border border-borderwarm bg-bgpanel shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-borderwarm bg-bgbase">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-xs font-bold text-textprimary uppercase tracking-wider">AI Generation Prompt</span>
        </div>
        <div className="flex bg-bgpanelhover rounded-lg p-0.5 border border-borderwarm">
          <button 
            onClick={() => setActiveTab('midjourney')}
            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeTab === 'midjourney' ? 'bg-bgpanel text-textprimary shadow-sm' : 'text-textmuted hover:text-textprimary'}`}
          >
            Midjourney
          </button>
          <button 
            onClick={() => setActiveTab('dalle')}
            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeTab === 'dalle' ? 'bg-bgpanel text-textprimary shadow-sm' : 'text-textmuted hover:text-textprimary'}`}
          >
            DALL·E / Firefly
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-bgpanelhover/50 relative group">
        <p className="text-[13px] text-textprimary/90 font-mono leading-relaxed select-all pr-12">
          {activePromptText}
        </p>
        
        <button 
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 bg-bgpanel border border-borderwarm rounded-lg text-textmuted hover:text-textprimary hover:border-purple-500/50 transition-all shadow-sm"
          title="Copy prompt"
        >
          {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>
      
      <div className="px-4 py-2 bg-bgbase border-t border-borderwarm flex items-center gap-2">
        <LayoutTemplate size={12} className="text-textmuted" />
        <span className="text-[11px] text-textmuted">
          Paste this into {activeTab === 'midjourney' ? 'Discord (/imagine)' : 'ChatGPT or Adobe Firefly'} to generate the visual.
        </span>
      </div>
    </div>
  )
}

function VariantPanel({ testData, type, posterPrompt }) {
  return (
    <div className="flex flex-col gap-4">
      <PosterBlueprint testData={testData} type={type} label={testData?.label || `Variation ${type}`} />
      <AIPromptPanel posterPrompt={posterPrompt} />
    </div>
  )
}

export default function CopyResults({ copy }) {
  if (!copy) return null

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border-borderwarm relative overflow-hidden bg-bgpanel">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shadow-inner">
            <Beaker size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-textprimary tracking-tight">A/B Test Frameworks</h2>
            <p className="text-textmuted text-sm mt-0.5">AI-generated structured creative tests</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-r from-purple-900/20 to-bgpanel border border-purple-500/20 p-6 text-sm leading-relaxed text-textprimary mb-12 shadow-lg backdrop-blur-sm relative z-10"
        >
          <span className="font-bold mr-2 text-purple-400 uppercase tracking-wider text-xs border border-purple-500/30 bg-purple-500/10 px-2 py-1 rounded">Copywriter Summary</span>
          <span className="ml-2 block mt-3 text-[15px]">{copy.summary}</span>
        </motion.div>

        <div className="grid gap-16 relative z-10">
          {copy.variants.map((variant, index) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              key={`${variant.keyword}-ab`}
              className="relative"
            >
              {/* Keyword header */}
              <div className="mb-8 flex flex-col items-center text-center">
                <span className="inline-block rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 px-6 py-2 text-lg font-black text-textprimary shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/30 tracking-wide">
                  {variant.keyword}
                </span>
                <span className="text-sm font-bold text-textmuted mt-3 uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink size={14} /> {variant.campaign_name}
                </span>
              </div>

              {/* Side-by-side A/B tests */}
              <div className="grid lg:grid-cols-2 gap-8 relative px-4 lg:px-0">
                
                {/* VS Badge in the middle */}
                <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-bgpanel border-4 border-borderwarm items-center justify-center z-10 shadow-lg">
                  <span className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">VS</span>
                </div>

                {/* Test A */}
                <VariantPanel testData={variant.test_a} type="A" posterPrompt={variant.poster_prompt || variant.visual_prompt} />

                {/* Test B */}
                <VariantPanel testData={variant.test_b} type="B" posterPrompt={variant.poster_prompt || variant.visual_prompt} />
              </div>

              {/* Test rationale */}
              <div className="mt-8 mx-auto max-w-3xl flex items-start gap-4 rounded-2xl bg-gradient-to-r from-bgpanelhover to-bgpanel p-6 border border-borderwarm shadow-lg">
                <div className="p-2 bg-purple-500/20 rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-purple-500/30">
                  <Sparkles size={20} className="text-purple-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-textprimary text-base mb-1">Strategic Rationale</h4>
                  <p className="text-[15px] leading-relaxed text-textsecondary">
                    {variant.test_rationale || variant.improvement_reason || ''}
                  </p>
                </div>
              </div>
              
              {/* Divider between variants (except last) */}
              {index < copy.variants.length - 1 && (
                <div className="h-px w-full bg-gradient-to-r from-transparent via-borderwarm to-transparent mt-16" />
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
