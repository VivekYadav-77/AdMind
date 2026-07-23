import { motion } from 'framer-motion'
import { FileUp, Sparkles, UploadCloud } from 'lucide-react'
import { useCallback, useState } from 'react'

import { API_BASE_URL } from '../services/api'

export default function UploadZone({ onFileReady }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingDemo, setIsProcessingDemo] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.csv')) {
        onFileReady(file)
      } else {
        alert('Please upload a valid CSV file.')
      }
    },
    [onFileReady]
  )

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileReady(file)
    }
  }

  const loadSampleData = async () => {
    try {
      setIsProcessingDemo(true)
      const res = await fetch(`${API_BASE_URL}/sample-csv`)
      if (!res.ok) throw new Error('Failed to load sample data')
      const blob = await res.blob()
      const file = new File([blob], 'sample_data.csv', { type: 'text/csv' })
      onFileReady(file)
    } catch (err) {
      alert('Could not load sample data. Is the backend running?')
      setIsProcessingDemo(false)
    }
  }

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12"
    >
      <div className="mx-auto max-w-2xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif text-[#FAF4EC] tracking-tight mb-4">
          Uncover the Hidden ROI in Your <span className="text-brand-400 glow-text italic">Ad Campaigns</span>
        </h1>
        <p className="text-lg text-[#A39E93]">
          Upload your campaign data. Our multi-agent AI pipeline will instantly audit performance, write strategic recommendations, and generate A/B tested ad copy.
        </p>
      </div>

      <div className="mx-auto max-w-3xl glass rounded-3xl p-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-400/10 via-amber-400/10 to-brand-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-brand-400 bg-brand-500/10 scale-[0.99] shadow-[0_0_30px_rgba(217,119,87,0.2)]'
              : 'border-borderwarm bg-[#151513] hover:border-brand-500/50 hover:bg-[#1C1C19]'
          }`}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10 text-brand-400 mb-6 shadow-inner animate-float border border-brand-500/20">
            <UploadCloud size={40} strokeWidth={1.5} />
          </div>
          
          <h3 className="text-xl font-bold text-[#FAF4EC] mb-2">Upload Campaign Data</h3>
          <p className="text-[#A39E93] mb-8 max-w-md mx-auto">
            Drag and drop your exported CSV file containing ad performance metrics, or click to browse files.
          </p>

          <label className="relative inline-flex cursor-pointer items-center gap-2 btn-primary px-8 py-4 text-sm">
            <FileUp size={18} aria-hidden="true" />
            <span>Select CSV File</span>
            <input type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-[#8A857A] mb-4 font-bold uppercase tracking-widest">Or try it out</p>
        <button
          type="button"
          onClick={loadSampleData}
          disabled={isProcessingDemo}
          className="inline-flex items-center gap-2 rounded-full btn-secondary px-6 py-2.5 text-sm"
        >
          <Sparkles size={16} className="text-amber-400" aria-hidden="true" />
          {isProcessingDemo ? 'Loading...' : 'Run Analysis with Sample Data'}
        </button>
      </div>
    </motion.section>
  )
}
