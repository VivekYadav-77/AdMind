import { motion } from 'framer-motion'
import { FileUp, Sparkles, UploadCloud } from 'lucide-react'
import { useCallback, useState } from 'react'

import { API_BASE_URL } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function UploadZone({ onFileReady }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingDemo, setIsProcessingDemo] = useState(false)
  const { showToast } = useToast()

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.csv')) {
        onFileReady(file)
      } else {
        showToast('error', 'Please upload a valid CSV file.')
      }
    },
    [onFileReady, showToast]
  )

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        onFileReady(file)
      } else {
        showToast('error', 'Please upload a valid CSV file.')
      }
    }
    // reset input so the same file can be selected again if needed
    e.target.value = null
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
      showToast('error', 'Could not load sample data. Is the backend running?')
      setIsProcessingDemo(false)
    }
  }

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12"
    >
      <div className="mx-auto max-w-2xl text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-textprimary tracking-tight mb-4">
          Uncover the Hidden ROI in Your <span className="text-brand-500">Ad Campaigns</span>
        </h1>
        <p className="text-lg text-textmuted">
          Upload your campaign data. Our multi-agent AI pipeline will instantly audit performance, write strategic recommendations, and generate A/B tested ad copy.
        </p>
      </div>

      <div className="mx-auto max-w-3xl bg-bgpanel rounded-2xl border border-borderwarm shadow-sm p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 scale-[0.99]'
              : 'border-borderwarm hover:border-brand-500/50'
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 mb-6">
            <UploadCloud size={32} strokeWidth={2} />
          </div>
          
          <h3 className="text-xl font-bold text-textprimary mb-2">Upload Campaign Data</h3>
          <p className="text-textmuted mb-8 max-w-md mx-auto">
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
