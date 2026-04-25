import { Upload, FileSpreadsheet, PlayCircle } from 'lucide-react'
import { useRef, useState } from 'react'

import { API } from '../services/api'

export default function UploadZone({ onFileReady }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [filename, setFilename] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)
  const [localError, setLocalError] = useState('')

  const acceptFile = (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setLocalError('Please choose a CSV file.')
      return
    }
    setFilename(file.name)
    setLocalError('')
    onFileReady(file)
  }

  const loadSample = async () => {
    setLoadingSample(true)
    setLocalError('')
    try {
      const sample = await API.getSampleCSV()
      setFilename(sample.name)
      onFileReady(sample)
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setLoadingSample(false)
    }
  }

  return (
    <section className="py-12">
      <div
        className={`mx-auto max-w-3xl rounded-xl border-2 border-dashed bg-white p-10 text-center shadow-sm transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          acceptFile(event.dataTransfer.files?.[0])
        }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <FileSpreadsheet size={30} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload ad campaign CSV</h2>
        <p className="mt-2 text-sm text-gray-500">Drop a CSV file here or use the sample campaign data.</p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => acceptFile(event.target.files?.[0])}
        />

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Upload size={18} aria-hidden="true" />
            Upload CSV
          </button>
          <button
            type="button"
            onClick={loadSample}
            disabled={loadingSample}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <PlayCircle size={18} aria-hidden="true" />
            {loadingSample ? 'Loading Sample...' : 'Try Sample Data'}
          </button>
        </div>

        {filename && <p className="mt-5 text-sm font-medium text-gray-700">Selected: {filename}</p>}
        {localError && <p className="mt-5 text-sm font-medium text-red-600">{localError}</p>}
      </div>
    </section>
  )
}
