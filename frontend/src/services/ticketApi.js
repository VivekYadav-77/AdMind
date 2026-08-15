const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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
    const res = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to submit ticket')
    }
    return res.json()
  },

  createTicket: async (data) => {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to create ticket')
    }
    return res.json()
  },

  getMyTickets: async (page = 1, size = 20) => {
    const res = await fetch(`${API_URL}/tickets/mine?page=${page}&size=${size}`, {
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch tickets')
    return res.json()
  },

  getTicket: async (id) => {
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch ticket')
    return res.json()
  },

  replyToTicket: async (id, message) => {
    const res = await fetch(`${API_URL}/tickets/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Failed to reply to ticket')
    }
    return res.json()
  }
}
