import { apiFetch } from './apiFetch'
import { API_BASE_URL } from './api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const adminApi = {
  checkAdminStatus: async () => {
    const res = await apiFetch(`${API_BASE_URL}/admin/me`, { headers: getHeaders() }, 'Not admin')
    return res.json()
  },
  
  getStats: async () => {
    const res = await apiFetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() }, 'Failed to fetch stats')
    return res.json()
  },

  getGrowthStats: async () => {
    const res = await apiFetch(`${API_BASE_URL}/admin/stats/growth`, { headers: getHeaders() }, 'Failed to fetch growth stats')
    return res.json()
  },

  getUsers: async (page = 1, size = 20, search = '', role = '') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/users?page=${page}&size=${size}&search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}`, { headers: getHeaders() }, 'Failed to fetch users')
    return res.json()
  },

  toggleUserBan: async (userId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}/toggle-ban`, { 
      method: 'POST',
      headers: getHeaders() 
    }, 'Failed to toggle ban')
    return res.json()
  },

  toggleUserAdmin: async (userId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}/make-admin`, { 
      method: 'POST',
      headers: getHeaders() 
    }, 'Failed to toggle admin status')
    return res.json()
  },

  deleteUser: async (userId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, { 
      method: 'DELETE',
      headers: getHeaders() 
    }, 'Failed to delete user')
    return res.json()
  },

  getJobs: async (page = 1, size = 20, status = '', search = '') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/jobs?page=${page}&size=${size}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`, { headers: getHeaders() }, 'Failed to fetch jobs')
    return res.json()
  },
  
  getJobDetail: async (jobId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/jobs/${jobId}`, { headers: getHeaders() }, 'Failed to fetch job details')
    return res.json()
  },

  deleteJob: async (jobId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/jobs/${jobId}`, { 
      method: 'DELETE',
      headers: getHeaders() 
    }, 'Failed to delete job')
    return res.json()
  },

  getReviews: async (page = 1, size = 20, status = 'pending') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/reviews?page=${page}&size=${size}&status=${status}`, { headers: getHeaders() }, 'Failed to fetch reviews')
    return res.json()
  },

  approveReview: async (reviewId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/reviews/${reviewId}/approve`, { 
      method: 'POST',
      headers: getHeaders() 
    }, 'Failed to approve review')
    return res.json()
  },

  rejectReview: async (reviewId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/reviews/${reviewId}/reject`, { 
      method: 'DELETE',
      headers: getHeaders() 
    }, 'Failed to reject review')
    return res.json()
  },

  getWorkspaces: async (page = 1, size = 20, search = '') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/workspaces?page=${page}&size=${size}&search=${encodeURIComponent(search)}`, { headers: getHeaders() }, 'Failed to fetch workspaces')
    return res.json()
  },

  getActivity: async (page = 1, size = 20, typeFilter = '') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/activity?page=${page}&size=${size}&type_filter=${encodeURIComponent(typeFilter)}`, { headers: getHeaders() }, 'Failed to fetch activity')
    return res.json()
  },

  // Ticket System Methods
  getTickets: async (page = 1, size = 20, status = '', category = '', search = '') => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets?page=${page}&size=${size}&status=${encodeURIComponent(status)}&category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`, { headers: getHeaders() }, 'Failed to fetch tickets')
    return res.json()
  },

  getTicketStats: async () => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets/stats`, { headers: getHeaders() }, 'Failed to fetch ticket stats')
    return res.json()
  },

  getTicket: async (ticketId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, { headers: getHeaders() }, 'Failed to fetch ticket')
    return res.json()
  },

  replyToTicket: async (ticketId, message) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    }, 'Failed to reply to ticket')
    return res.json()
  },

  changeTicketStatus: async (ticketId, status) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    }, 'Failed to update ticket status')
    return res.json()
  },

  deleteTicket: async (ticketId) => {
    const res = await apiFetch(`${API_BASE_URL}/admin/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }, 'Failed to delete ticket')
    return res.json()
  }
}
