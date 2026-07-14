import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Tools from './pages/Tools'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ReportDetail from './pages/ReportDetail'
import Settings from './pages/Settings'
import ABTracker from './pages/ABTracker'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="history/:id" element={<ReportDetail />} />
            <Route path="tools" element={<Tools />} />
            <Route path="ab-tracker" element={<ABTracker />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
