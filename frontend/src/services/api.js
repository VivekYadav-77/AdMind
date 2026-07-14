export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = {}
  
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const workspaceId = localStorage.getItem('activeWorkspaceId')
  if (workspaceId) {
    headers['X-Workspace-Id'] = workspaceId
  }
  
  return headers
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

  // Workspaces
  getWorkspaces: async () => {
    const res = await fetch(apiUrl('/workspaces'), {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Could not fetch workspaces')
    return res.json()
  },

  createWorkspace: async (name) => {
    const res = await fetch(apiUrl('/workspaces'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    if (!res.ok) throw new Error('Could not create workspace')
    return res.json()
  },

  analyzeCSV: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch(apiUrl('/analyze'), { 
      method: 'POST', 
      headers: getAuthHeaders(),
      body: formData 
    })
    
    if (!res.ok) {
      let errorMessage = 'Upload failed'
      try {
        const data = await res.json()
        errorMessage = data.detail || errorMessage
      } catch (e) {}
      throw new Error(errorMessage)
    }
    return res.json() // returns { job_id: 123 }
  },

  streamAnalysis: async (jobId) => {
    return fetch(apiUrl(`/analyze/${jobId}/stream`), {
      method: 'GET',
      headers: getAuthHeaders()
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

  getHistory: async (page = 1, size = 10) => {
    const res = await fetch(apiUrl(`/history?page=${page}&size=${size}`), {
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
  },

  getTrends: async () => {
    const res = await fetch(apiUrl('/history/trends'), {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      throw new Error('Could not fetch historical trends')
    }
    return res.json()
  },

  // Chat
  getChatHistory: async (jobId) => {
    const res = await fetch(apiUrl(`/history/${jobId}/chat`), {
      method: 'GET',
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Could not fetch chat history')
    return res.json()
  },

  sendChatMessage: async (jobId, message) => {
    const res = await fetch(apiUrl(`/history/${jobId}/chat`), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!res.ok) {
      let errorMessage = 'Failed to send message'
      try {
        const data = await res.json()
        errorMessage = data.detail || errorMessage
      } catch (e) {}
      throw new Error(errorMessage)
    }
    return res.json()
  },

  // Tools
  auditLandingPage: async (url) => {
    const res = await fetch(apiUrl('/tools/audit-landing-page'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    if (!res.ok) {
      throw new Error('Failed to audit landing page')
    }
    return res.json()
  },

  buildAudience: async (description) => {
    const res = await fetch(apiUrl('/tools/audience-builder'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    })
    if (!res.ok) {
      throw new Error('Failed to build audience')
    }
    return res.json()
  },

  competitorTeardown: async (ad_copy) => {
    const res = await fetch(apiUrl('/tools/competitor-teardown'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ad_copy })
    })
    if (!res.ok) {
      throw new Error('Failed to tear down competitor ad')
    }
    return res.json()
  },

  addStrategyComment: async (jobId, target, action, content) => {
    const res = await fetch(apiUrl(`/history/${jobId}/strategy/comments`), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, action, content })
    })
    if (!res.ok) {
      let errorMessage = 'Failed to add comment'
      try {
        const data = await res.json()
        errorMessage = data.detail || errorMessage
      } catch (e) {}
      throw new Error(errorMessage)
    }
    return res.json()
  }
}
