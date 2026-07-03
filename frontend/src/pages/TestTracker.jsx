import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { API } from '../services/api'
import { FlaskConical, Plus, CheckCircle, Clock, Trophy } from 'lucide-react'

export default function TestTracker() {
  const [tests, setTests] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [newTest, setNewTest] = useState({ test_name: '', variant_a_copy: '', variant_b_copy: '' })

  const loadTests = async () => {
    try {
      const data = await API.getAbTests()
      setTests(data)
    } catch (err) {
      console.error("Failed to load tests", err)
    }
  }

  useEffect(() => {
    loadTests()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await API.createAbTest(newTest.test_name, newTest.variant_a_copy, newTest.variant_b_copy)
      setNewTest({ test_name: '', variant_a_copy: '', variant_b_copy: '' })
      setIsCreating(false)
      loadTests()
    } catch (err) {
      console.error(err)
    }
  }

  const declareWinner = async (testId, winner) => {
    try {
      await API.declareWinner(testId, winner)
      loadTests()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-16"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">A/B Test Tracker</h1>
            <p className="text-slate-400 text-sm">Monitor and declare winners for your active ad tests</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          {isCreating ? 'Cancel' : <><Plus size={16} /> New Test</>}
        </button>
      </div>

      {isCreating && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreate}
          className="glass-panel p-6 rounded-2xl border-indigo-500/30 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1">Test Name / Hypothesis</label>
            <input 
              required
              type="text" 
              value={newTest.test_name}
              onChange={e => setNewTest(prev => ({...prev, test_name: e.target.value}))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500/50 outline-none"
              placeholder="e.g. Benefit vs Urgency for Summer Campaign"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-blue-300 mb-1">Variant A Copy</label>
              <textarea 
                required
                value={newTest.variant_a_copy}
                onChange={e => setNewTest(prev => ({...prev, variant_a_copy: e.target.value}))}
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500/50 outline-none resize-none"
                placeholder="Paste Variant A text here..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-300 mb-1">Variant B Copy</label>
              <textarea 
                required
                value={newTest.variant_b_copy}
                onChange={e => setNewTest(prev => ({...prev, variant_b_copy: e.target.value}))}
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none resize-none"
                placeholder="Paste Variant B text here..."
              />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold w-full md:w-auto">
            Launch Test Track
          </button>
        </motion.form>
      )}

      <div className="grid gap-6">
        {tests.length === 0 && !isCreating && (
          <div className="text-center py-12 glass-panel rounded-3xl border-dashed border-white/10">
            <FlaskConical size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No active A/B tests. Start tracking one to see results here.</p>
          </div>
        )}

        {tests.map(test => (
          <div key={test.id} className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col md:flex-row gap-6 relative overflow-hidden">
            {test.status === 'completed' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] -z-10" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {test.status === 'running' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    <Clock size={12} /> Running
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    <CheckCircle size={12} /> Completed
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">{new Date(test.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{test.test_name}</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${test.winner === 'A' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/30'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-blue-400">Variant A</h4>
                    {test.winner === 'A' && <Trophy size={16} className="text-emerald-400" />}
                  </div>
                  <p className="text-sm text-slate-300">{test.variant_a_copy}</p>
                  {test.status === 'running' && (
                    <button 
                      onClick={() => declareWinner(test.id, 'A')}
                      className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Mark as Winner
                    </button>
                  )}
                </div>
                
                <div className={`p-4 rounded-xl border ${test.winner === 'B' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/30'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-amber-400">Variant B</h4>
                    {test.winner === 'B' && <Trophy size={16} className="text-emerald-400" />}
                  </div>
                  <p className="text-sm text-slate-300">{test.variant_b_copy}</p>
                  {test.status === 'running' && (
                    <button 
                      onClick={() => declareWinner(test.id, 'B')}
                      className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Mark as Winner
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
