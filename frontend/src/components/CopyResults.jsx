import { motion } from 'framer-motion'
import { Beaker, Sparkles, Target, Zap } from 'lucide-react'

export default function CopyResults({ copy }) {
  if (!copy) return null

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
    >
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">A/B Test Frameworks</h2>
            <p className="text-slate-500 mt-1">AI-generated structured creative tests</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-inner">
            <Beaker size={24} aria-hidden="true" />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-purple-50/50 border border-purple-100 p-6 text-sm leading-relaxed text-purple-900 mb-10"
        >
          <span className="font-semibold mr-2">Copywriter Summary:</span>
          {copy.summary}
        </motion.div>

        <div className="grid gap-8">
          {copy.variants.map((variant, index) => (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              key={`${variant.keyword}-ab`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Keyword header */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-xl bg-slate-900 px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                  {variant.keyword}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  in <span className="text-slate-700">{variant.campaign_name}</span>
                </span>
              </div>

              {/* Side-by-side A/B tests */}
              <div className="grid gap-6 md:grid-cols-2 relative">
                
                {/* VS Badge in the middle */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 border-2 border-white items-center justify-center z-10 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400">VS</span>
                </div>

                {/* Test A */}
                <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-6 relative overflow-hidden group hover:border-blue-300 transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">
                      <Target size={14} /> Test A
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {variant.test_a?.label || 'Variation A'}
                    </span>
                  </div>
                  
                  <p className="mb-3 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {variant.test_a?.angle || ''}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                    {variant.test_a?.headline || ''}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {variant.test_a?.description || ''}
                  </p>
                </div>

                {/* Test B */}
                <div className="rounded-2xl border-2 border-amber-100 bg-gradient-to-b from-amber-50/50 to-white p-6 relative overflow-hidden group hover:border-amber-300 transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
                      <Zap size={14} /> Test B
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {variant.test_b?.label || 'Variation B'}
                    </span>
                  </div>
                  
                  <p className="mb-3 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    {variant.test_b?.angle || ''}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                    {variant.test_b?.headline || ''}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {variant.test_b?.description || ''}
                  </p>
                </div>
              </div>

              {/* Test rationale */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="p-1.5 bg-white rounded-md shadow-sm">
                  <Sparkles size={16} className="text-purple-500" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">Strategic Rationale: </span>
                  {variant.test_rationale || variant.improvement_reason || ''}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
