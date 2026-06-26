export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined' && token !== 'null') {
    return { 'Authorization': `Bearer ${token}` }
  }
  return {}
}

export const API = {
  register: async (email, password) => {
    const res = await fetch(apiUrl('/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      let errorMessage = 'Registration failed'
      try {
        const data = await res.json()
        errorMessage = data.detail || errorMessage
      } catch (e) {
        errorMessage = `Server Error: ${res.status} ${res.statusText}`
      }
      throw new Error(errorMessage)
    }
    return res.json()
  },

  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const res = await fetch(apiUrl('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    if (!res.ok) {
      let errorMessage = 'Login failed'
      try {
        const data = await res.json()
        errorMessage = data.detail || errorMessage
      } catch (e) {
        errorMessage = `Server Error: ${res.status} ${res.statusText}`
      }
      throw new Error(errorMessage)
    }
    return res.json()
  },

  analyzeCSV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Server Sent Events don't natively support headers in EventSource easily,
    // but since we're using fetch and a stream reader in Dashboard, we CAN use headers!
    return fetch(apiUrl('/analyze'), { 
      method: 'POST', 
      headers: getAuthHeaders(),
      body: formData 
    })
  },

  getSampleCSV: async () => {
    const res = await fetch(apiUrl('/sample-csv'))
    if (!res.ok) {
      throw new Error('Could not load sample CSV')
    }
    const text = await res.text()
    return new File([text], 'sample_ads.csv', { type: 'text/csv' })
  },

  getHistory: async () => {
    const res = await fetch(apiUrl('/history'), {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      throw new Error('Could not fetch analysis history')
    }
    return res.json()
  },

  getJobDetails: async (jobId) => {
    const res = await fetch(apiUrl(`/history/${jobId}`), {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      throw new Error(`Could not fetch details for report #${jobId}`)
    }
    return res.json()
  }
}
