import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import History from './pages/History'
import Tools from './pages/Tools'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ReportDetail from './pages/ReportDetail'
import Settings from './pages/Settings'
import TestTracker from './pages/TestTracker'
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import BlogPost from './pages/BlogPost'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Community from './pages/Community'
import AboutUs from './pages/AboutUs'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { WorkspaceProvider } from './context/WorkspaceContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
              
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
              
              {/* New Public Routes (No Auth Needed to View) */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/community" element={<Community />} />
              <Route path="/about" element={<AboutUs />} />
              
              {/* Protected App Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="analyze" element={<Analyze />} />
                <Route path="history" element={<History />} />
                <Route path="history/:id" element={<ReportDetail />} />
                <Route path="tools" element={<Tools />} />
                <Route path="tests" element={<TestTracker />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
