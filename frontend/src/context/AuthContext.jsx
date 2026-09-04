import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const savedToken = localStorage.getItem('token')
  const initialToken = savedToken && savedToken !== 'undefined' && savedToken !== 'null' ? savedToken : null
  const decodeToken = (tokenStr) => {
    try {
      if (!tokenStr) return null;
      const base64Url = tokenStr.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return { email: payload.sub, ...payload };
    } catch (e) {
      return null;
    }
  }

  const [token, setToken] = useState(initialToken)
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken)
  const [user, setUser] = useState(decodeToken(initialToken))
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (token) {
      import('../services/adminApi').then(({ adminApi }) => {
        adminApi.checkAdminStatus()
          .then(res => setIsAdmin(res.isAdmin))
          .catch(() => setIsAdmin(false))
      })
    } else {
      setIsAdmin(false)
    }
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setIsAuthenticated(true)
    setUser(decodeToken(newToken))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setIsAuthenticated(false)
    setUser(null)
  }

  useEffect(() => {
    const handleAuthError = () => logout();
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
