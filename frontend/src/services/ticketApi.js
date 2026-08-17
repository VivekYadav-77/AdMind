import { apiFetch } from './apiFetch'
import { API_BASE_URL } from './api'

const getHeaders = (requireAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  }
  if (requireAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

export const ticketApi = {
  submitGuestTicket: async (data) => {
    const res = await apiFetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data)
    }, 'Failed to submit ticket')
    return res.json()
  },

  createTicket: async (data) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }, 'Failed to create ticket')
    return res.json()
  },

  getMyTickets: async (page = 1, size = 20) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets/mine?page=${page}&size=${size}`, {
      headers: getHeaders()
    }, 'Failed to fetch tickets')
    return res.json()
  },

  getTicket: async (id) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets/${id}`, {
      headers: getHeaders()
    }, 'Failed to fetch ticket')
    return res.json()
  },

  replyToTicket: async (id, message) => {
    const res = await apiFetch(`${API_BASE_URL}/tickets/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    }, 'Failed to reply to ticket')
    return res.json()
  }
}
