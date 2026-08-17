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
import VerifyEmail from './pages/VerifyEmail'
import CheckEmail from './pages/CheckEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import BlogPost from './pages/BlogPost'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Community from './pages/Community'
import AboutUs from './pages/AboutUs'

import ContactPage from './pages/ContactPage'
import SupportPage from './pages/SupportPage'
import SupportTicketDetail from './pages/SupportTicketDetail'

import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminJobs from './pages/admin/AdminJobs'
import AdminReviews from './pages/admin/AdminReviews'
import AdminWorkspaces from './pages/admin/AdminWorkspaces'
import AdminActivity from './pages/admin/AdminActivity'
import AdminTickets from './pages/admin/AdminTickets'
import AdminTicketDetail from './pages/admin/AdminTicketDetail'
import AdminEmailAnalytics from './pages/admin/AdminEmailAnalytics'

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

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!isAdmin) {
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
              <Route path="/check-email" element={<PublicOnlyRoute><CheckEmail /></PublicOnlyRoute>} />
              <Route path="/verify-email" element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
              <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
              <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
              
              {/* New Public Routes (No Auth Needed to View) */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/community" element={<Community />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactPage />} />
              
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
                <Route path="support" element={<SupportPage />} />
                <Route path="support/:id" element={<SupportTicketDetail />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="workspaces" element={<AdminWorkspaces />} />
                <Route path="activity" element={<AdminActivity />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="tickets/:id" element={<AdminTicketDetail />} />
                <Route path="email-analytics" element={<AdminEmailAnalytics />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
