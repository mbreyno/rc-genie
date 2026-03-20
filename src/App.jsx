import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login      from './pages/Login'
import Signup     from './pages/Signup'
import Dashboard  from './pages/Dashboard'
import Profile    from './pages/Profile'
import NewReport  from './pages/NewReport'
import ReportView from './pages/ReportView'

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading)          return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!session)         return <Navigate to="/login" replace />
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
          <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected */}
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><Profile    /></ProtectedRoute>} />
          <Route path="/report/new"   element={<ProtectedRoute><NewReport  /></ProtectedRoute>} />
          <Route path="/report/:id"   element={<ProtectedRoute><ReportView /></ProtectedRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
