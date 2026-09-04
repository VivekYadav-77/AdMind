import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import './index.css'

// Global fetch interceptor to handle auth errors
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch.apply(this, args);
  if (response.status === 401 || response.status === 403) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (response.status === 401 || (response.status === 403 && data.detail === "Your account has been banned.")) {
        window.dispatchEvent(new CustomEvent('auth-error', { detail: data }));
      }
    } catch (e) {
      // Ignore parsing errors for non-JSON responses
    }
  }
  return response;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
