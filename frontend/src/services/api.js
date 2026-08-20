import { apiFetch } from './apiFetch'

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
  register: async (name, email, password) => {
    const res = await apiFetch(apiUrl('/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    }, 'Registration failed')
    return res.json()
  },

  verifyEmail: async (token) => {
    const res = await apiFetch(apiUrl('/auth/verify-email'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }, 'Verification failed')
    return res.json()
  },

  resendVerification: async (email) => {
    const res = await apiFetch(apiUrl('/auth/resend-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }, 'Failed to resend')
    return res.json()
  },

  forgotPassword: async (email) => {
    const res = await apiFetch(apiUrl('/auth/forgot-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }, 'Failed to request password reset')
    return res.json()
  },

  resetPassword: async (token, newPassword) => {
    const res = await apiFetch(apiUrl('/auth/reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    }, 'Failed to reset password')
    return res.json()
  },

  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const res = await apiFetch(apiUrl('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    }, 'Login failed')
    return res.json()
  },

  // Workspaces
  getWorkspaces: async () => {
    const res = await apiFetch(apiUrl('/workspaces'), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch workspaces')
    return res.json()
  },

  createWorkspace: async (name) => {
    const res = await apiFetch(apiUrl('/workspaces'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }, 'Could not create workspace')
    return res.json()
  },

  analyzeCSV: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const wasteAlert = localStorage.getItem('threshold_wasteAlert')
    const minRoas = localStorage.getItem('threshold_minRoas')
    const aiModel = localStorage.getItem('ai_model')
    const aiTemp = localStorage.getItem('ai_temperature')
    
    if (wasteAlert) formData.append('wasteAlertPercent', wasteAlert)
    if (minRoas) formData.append('minRoasTarget', minRoas)
    if (aiModel) formData.append('aiModel', aiModel)
    if (aiTemp) formData.append('aiTemperature', aiTemp)
    
    const res = await apiFetch(apiUrl('/analyze'), { 
      method: 'POST', 
      headers: getAuthHeaders(),
      body: formData 
    }, 'Upload failed')
    return res.json()
  },

  streamAnalysis: async (jobId) => {
    return fetch(apiUrl(`/analyze/${jobId}/stream`), {
      method: 'GET',
      headers: getAuthHeaders()
    })
  },

  exportPDF: async (docxBlob) => {
    const formData = new FormData()
    formData.append('file', docxBlob, 'report.docx')
    
    const res = await apiFetch(apiUrl('/export/pdf'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    }, 'PDF export failed')
    return res.blob()
  },

  getSampleCSV: async () => {
    const res = await apiFetch(apiUrl('/sample-csv'), {}, 'Could not load sample CSV')
    const text = await res.text()
    return new File([text], 'sample_ads.csv', { type: 'text/csv' })
  },

  getHistory: async (page = 1, size = 10) => {
    const res = await apiFetch(apiUrl(`/history?page=${page}&size=${size}`), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch analysis history')
    return res.json()
  },

  getJobDetails: async (jobId) => {
    const res = await apiFetch(apiUrl(`/history/${jobId}`), {
      method: 'GET',
      headers: getAuthHeaders()
    }, `Could not fetch details for report #${jobId}`)
    return res.json()
  },

  getTrends: async () => {
    const res = await apiFetch(apiUrl('/history/trends'), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch historical trends')
    return res.json()
  },

  getEmailAnalytics: async () => {
    const res = await apiFetch(apiUrl('/admin/email-analytics'), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch email analytics')
    return res.json()
  },

  // Chat
  getChatHistory: async (jobId) => {
    const res = await apiFetch(apiUrl(`/history/${jobId}/chat`), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch chat history')
    return res.json()
  },

  sendChatMessage: async (jobId, message) => {
    const res = await apiFetch(apiUrl(`/history/${jobId}/chat`), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }, 'Failed to send message')
    return res.json()
  },

  // Tools
  auditLandingPage: async (url) => {
    const res = await apiFetch(apiUrl('/tools/audit-landing-page'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }, 'Failed to audit landing page')
    return res.json()
  },

  buildAudience: async (description) => {
    const res = await apiFetch(apiUrl('/tools/audience-builder'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    }, 'Failed to build audience')
    return res.json()
  },

  competitorTeardown: async (ad_copy) => {
    const res = await apiFetch(apiUrl('/tools/competitor-teardown'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ad_copy })
    }, 'Failed to tear down competitor ad')
    return res.json()
  },

  // Comments
  getComments: async (jobId) => {
    const res = await apiFetch(apiUrl(`/history/${jobId}/comments`), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch comments')
    return res.json()
  },

  addComment: async (jobId, targetKeyword, commentText) => {
    const res = await apiFetch(apiUrl(`/history/${jobId}/comments`), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_keyword: targetKeyword, comment_text: commentText })
    }, 'Could not add comment')
    return res.json()
  },

  // AB Test Tracker
  getAbTests: async () => {
    const res = await apiFetch(apiUrl('/workspaces/tests'), {
      method: 'GET',
      headers: getAuthHeaders()
    }, 'Could not fetch AB tests')
    return res.json()
  },

  createAbTest: async (testName, variantA, variantB) => {
    const res = await apiFetch(apiUrl('/workspaces/tests'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_name: testName, variant_a_copy: variantA, variant_b_copy: variantB })
    }, 'Could not create AB test')
    return res.json()
  },

  declareWinner: async (testId, winner) => {
    const res = await apiFetch(apiUrl(`/workspaces/tests/${testId}/winner`), {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner })
    }, 'Could not declare winner')
    return res.json()
  },

  // Community Reviews
  getReviews: async () => {
    const res = await apiFetch(apiUrl('/reviews'), {
      method: 'GET'
    }, 'Could not fetch reviews')
    return res.json()
  },

  getMyReview: async () => {
    // 401 means not logged in — return null gracefully without throwing
    try {
      const res = await fetch(apiUrl('/reviews/my'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      if (res.status === 401) return null
      if (!res.ok) throw new Error('Could not fetch your review')
      return res.json()
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        throw new Error('Unable to reach the server. Please check your connection and try again.')
      }
      throw err
    }
  },

  submitReview: async (rating, content) => {
    const res = await apiFetch(apiUrl('/reviews'), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, content })
    }, 'Could not submit review')
    return res.json()
  },

  deleteReview: async (id) => {
    const res = await apiFetch(apiUrl(`/reviews/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    }, 'Could not delete review')
    return res.json()
  }
}
