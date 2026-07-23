import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trophy, Activity, CheckCircle2, PlayCircle } from 'lucide-react'
import clsx from 'clsx'

export default function ABTracker() {
  const [tests, setTests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    variantA: '',
    variantB: ''
  })

  const handleLaunch = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.variantA || !formData.variantB) return

    const newTest = {
      id: Date.now(),
      name: formData.name,
      variantA: formData.variantA,
      variantB: formData.variantB,
      status: 'Running',
      winner: null
    }

    setTests([newTest, ...tests])
    setShowForm(false)
    setFormData({ name: '', variantA: '', variantB: '' })
  }

  const markWinner = (id, variant) => {
    setTests(tests.map(test => {
      if (test.id === id) {
        return { ...test, status: 'Completed', winner: variant }
      }
      return test
    }))
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#FAF4EC] tracking-tight">A/B Test Tracker Dashboard</h1>
          <p className="text-[#A39E93] mt-2 font-medium">Manage and monitor your active experiments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Test
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: 'auto', mb: 32 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 rounded-3xl border border-borderwarm bg-[#1C1C19]">
              <h2 className="text-xl font-serif text-[#FAF4EC] mb-4">Create New A/B Test</h2>
              <form onSubmit={handleLaunch} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#E5E0D8] mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    placeholder='e.g., "Summer Sale FOMO vs Benefit"'
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#151513] border border-borderwarm rounded-xl py-2.5 px-4 text-[#FAF4EC] focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 placeholder:text-[#6A655A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E0D8] mb-1">Variant A</label>
                    <input
                      type="text"
                      required
                      placeholder='e.g., "Get 20% off before midnight!"'
                      value={formData.variantA}
                      onChange={e => setFormData({ ...formData, variantA: e.target.value })}
                      className="w-full bg-[#151513] border border-borderwarm rounded-xl py-2.5 px-4 text-[#FAF4EC] focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 placeholder:text-[#6A655A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E0D8] mb-1">Variant B</label>
                    <input
                      type="text"
                      required
                      placeholder='e.g., "Upgrade your wardrobe for less"'
                      value={formData.variantB}
                      onChange={e => setFormData({ ...formData, variantB: e.target.value })}
                      className="w-full bg-[#151513] border border-borderwarm rounded-xl py-2.5 px-4 text-[#FAF4EC] focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 placeholder:text-[#6A655A]"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                  >
                    <PlayCircle size={20} />
                    Launch Test Track
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {tests.length === 0 ? (
          <div className="text-center py-12 text-[#8A857A]">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No active tests found.</p>
            <p className="text-sm">Click "New Test" to start tracking.</p>
          </div>
        ) : (
          tests.map(test => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-3xl border border-borderwarm bg-[#1C1C19] relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-serif text-[#FAF4EC]">{test.name}</h3>
                </div>
                <div>
                  {test.status === 'Running' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Activity size={14} className="animate-pulse" />
                      Running
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                      <CheckCircle2 size={14} />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Variant A */}
                <div className={clsx(
                  "p-5 rounded-2xl border transition-all relative overflow-hidden",
                  test.winner === 'A' 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : test.winner 
                    ? "bg-white/5 border-transparent opacity-50"
                    : "bg-[#151513] border-borderwarm"
                )}>
                  {test.winner === 'A' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px]" />
                  )}
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8A857A]">Variant A</span>
                    {test.winner === 'A' && (
                      <Trophy className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" size={24} />
                    )}
                  </div>
                  <p className="text-lg font-medium text-[#FAF4EC] mb-6 relative z-10">"{test.variantA}"</p>
                  
                  {test.status === 'Running' && (
                    <button
                      onClick={() => markWinner(test.id, 'A')}
                      className="w-full py-2 rounded-xl text-sm font-semibold text-[#A39E93] bg-[#1C1C19] hover:bg-emerald-500 hover:text-white transition-all border border-borderwarm hover:border-emerald-500"
                    >
                      Mark as Winner
                    </button>
                  )}
                </div>

                {/* Variant B */}
                <div className={clsx(
                  "p-5 rounded-2xl border transition-all relative overflow-hidden",
                  test.winner === 'B' 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : test.winner 
                    ? "bg-white/5 border-transparent opacity-50"
                    : "bg-[#151513] border-borderwarm"
                )}>
                  {test.winner === 'B' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px]" />
                  )}
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8A857A]">Variant B</span>
                    {test.winner === 'B' && (
                      <Trophy className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" size={24} />
                    )}
                  </div>
                  <p className="text-lg font-medium text-[#FAF4EC] mb-6 relative z-10">"{test.variantB}"</p>
                  
                  {test.status === 'Running' && (
                    <button
                      onClick={() => markWinner(test.id, 'B')}
                      className="w-full py-2 rounded-xl text-sm font-semibold text-[#A39E93] bg-[#1C1C19] hover:bg-emerald-500 hover:text-white transition-all border border-borderwarm hover:border-emerald-500"
                    >
                      Mark as Winner
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
