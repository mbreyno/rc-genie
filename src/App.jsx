import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getSubscriptionState } from './utils/subscription'

import Landing        from './pages/Landing'
import Docs           from './pages/Docs'
import Login          from './pages/Login'
import Signup         from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Dashboard      from './pages/Dashboard'
import Profile        from './pages/Profile'
import NewReport      from './pages/NewReport'
import ReportView     from './pages/ReportView'
import Subscribe      from './pages/Subscribe'

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading)          return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!session)         return <Navigate to="/login" replace />
  return children
}

// Subscribed route — additionally requires an active trial or subscription
function SubscribedRoute({ children }) {
  const { session, loading, profile } = useAuth()
  if (loading)          return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!session)         return <Navigate to="/login" replace />
  if (!profile)         return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!getSubscriptionState(profile).hasAccess) return <Navigate to="/subscribe" replace />
  return children
}

// Public route — redirects to /dashboard if already authenticated
function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading)          return null
  if (session)          return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<PublicRoute><Landing        /></PublicRoute>} />
          <Route path="/login"           element={<PublicRoute><Login          /></PublicRoute>} />
          <Route path="/signup"          element={<PublicRoute><Signup         /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/docs"            element={<Docs />} />

          {/* Protected (login only — the paywall page itself) */}
          <Route path="/subscribe"    element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />

          {/* Protected + requires active trial or subscription */}
          <Route path="/dashboard"    element={<SubscribedRoute><Dashboard  /></SubscribedRoute>} />
          <Route path="/profile"      element={<SubscribedRoute><Profile    /></SubscribedRoute>} />
          <Route path="/report/new"        element={<SubscribedRoute><NewReport  /></SubscribedRoute>} />
          <Route path="/report/:id/edit"  element={<SubscribedRoute><NewReport  /></SubscribedRoute>} />
          <Route path="/report/:id"       element={<SubscribedRoute><ReportView /></SubscribedRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
