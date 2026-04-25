const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export const API = {
  analyzeCSV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return fetch(apiUrl('/analyze'), { method: 'POST', body: formData })
  },

  getSampleCSV: async () => {
    const res = await fetch(apiUrl('/sample-csv'))
    if (!res.ok) {
      throw new Error('Could not load sample CSV')
    }
    const text = await res.text()
    return new File([text], 'sample_ads.csv', { type: 'text/csv' })
  }
}
