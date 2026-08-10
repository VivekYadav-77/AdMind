const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const adminApi = {
  checkAdminStatus: async () => {
    const res = await fetch(`${API_URL}/admin/me`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Not admin')
    return res.json()
  },
  
  getStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch stats')
    return res.json()
  },

  getGrowthStats: async () => {
    const res = await fetch(`${API_URL}/admin/stats/growth`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch growth stats')
    return res.json()
  },

  getUsers: async (page = 1, size = 20, search = '') => {
    const res = await fetch(`${API_URL}/admin/users?page=${page}&size=${size}&search=${encodeURIComponent(search)}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  },

  toggleUserBan: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-ban`, { 
      method: 'POST',
      headers: getHeaders() 
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to toggle ban')
    }
    return res.json()
  },

  toggleUserAdmin: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/make-admin`, { 
      method: 'POST',
      headers: getHeaders() 
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to toggle admin status')
    }
    return res.json()
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, { 
      method: 'DELETE',
      headers: getHeaders() 
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to delete user')
    }
    return res.json()
  },

  getJobs: async (page = 1, size = 20, status = '') => {
    const res = await fetch(`${API_URL}/admin/jobs?page=${page}&size=${size}&status=${status}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch jobs')
    return res.json()
  },
  
  getJobDetail: async (jobId) => {
    const res = await fetch(`${API_URL}/admin/jobs/${jobId}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch job details')
    return res.json()
  },

  deleteJob: async (jobId) => {
    const res = await fetch(`${API_URL}/admin/jobs/${jobId}`, { 
      method: 'DELETE',
      headers: getHeaders() 
    })
    if (!res.ok) throw new Error('Failed to delete job')
    return res.json()
  },

  getReviews: async (page = 1, size = 20, status = 'pending') => {
    const res = await fetch(`${API_URL}/admin/reviews?page=${page}&size=${size}&status=${status}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch reviews')
    return res.json()
  },

  approveReview: async (reviewId) => {
    const res = await fetch(`${API_URL}/admin/reviews/${reviewId}/approve`, { 
      method: 'POST',
      headers: getHeaders() 
    })
    if (!res.ok) throw new Error('Failed to approve review')
    return res.json()
  },

  rejectReview: async (reviewId) => {
    const res = await fetch(`${API_URL}/admin/reviews/${reviewId}/reject`, { 
      method: 'DELETE',
      headers: getHeaders() 
    })
    if (!res.ok) throw new Error('Failed to reject review')
    return res.json()
  },

  getWorkspaces: async (page = 1, size = 20) => {
    const res = await fetch(`${API_URL}/admin/workspaces?page=${page}&size=${size}`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch workspaces')
    return res.json()
  },

  getActivity: async () => {
    const res = await fetch(`${API_URL}/admin/activity`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch activity')
    return res.json()
  }
}
