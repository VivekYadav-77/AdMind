/**
 * Centralized fetch wrapper to handle all error classes gracefully.
 * 
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options (method, headers, body, etc).
 * @param {string} fallbackMessage - Fallback error message if backend doesn't provide a specific detail.
 * @returns {Promise<Response>} The successful fetch response object.
 * @throws {Error} Human-readable error message.
 */
export async function apiFetch(url, options = {}, fallbackMessage = 'Something went wrong') {
  let res
  try {
    res = await fetch(url, options)
  } catch (err) {
    // Network failure (TypeError) — server unreachable, no internet, or CORS preflight blocked
    throw new Error('Unable to reach the server. Please check your connection and try again.')
  }

  if (!res.ok) {
    // Auth failures
    if (res.status === 401) {
      let detail = 'Incorrect email or password.'
      try {
        const data = await res.json()
        detail = data.detail || detail
      } catch (_) {}
      const error = new Error(detail)
      error.verificationRequired = res.headers.get('X-Verification-Required') === 'true'
      throw error
    }

    // Server-side errors — don't trust the body, give a generic safe message
    if (res.status >= 500) {
      throw new Error('Something went wrong on our end. Please try again in a moment.')
    }
    
    // Client errors (4xx other than 401) - Try to read backend's error detail
    let detail = fallbackMessage
    try {
      const data = await res.json()
      detail = data.detail || fallbackMessage
    } catch (_) {}
    throw new Error(detail)
  }

  return res
}
