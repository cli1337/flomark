import React, { useState, useEffect, memo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/auth/login/Login'
import Register from './pages/auth/register/Register'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import ProjectFlowView from './pages/flow/ProjectFlowView'
import Profile from './pages/profile/Profile'
import JoinProject from './pages/join/JoinProject'
import AdminPanel from './pages/admin/AdminPanel'
import ErrorPage from './pages/ErrorPage'
import ErrorBoundary from './components/ErrorBoundary'
import { Forbidden } from './pages/errors'
import UpdateNotification from './components/UpdateNotification'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { useServerStatus } from './hooks/useServerStatus'
import LoadingState from './components/ui/LoadingState'

const ServerStatusManager = memo(function ServerStatusManager() {
  useServerStatus()
  return null
})

const LogoutRoute = memo(function LogoutRoute() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  return (
    <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
      <LoadingState message="Logging out..." />
    </div>
  )
})

const AuthLogoutListener = memo(function AuthLogoutListener() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const handleLogout = () => {
      logout()
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate, logout])

  return null
})

function App() {
  return (
          <AuthProvider>
            <ServerStatusManager />
            <NotificationProvider>
              <WebSocketProvider>
                <Router>
                  <ErrorBoundary>
                    <AuthLogoutListener />
                    <div className="App">
                      <UpdateNotification />
                      <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                        <Route path="/projects/:id/flow" element={<ProtectedRoute><ProjectFlowView /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                        <Route path="/join/:inviteLink" element={<JoinProject />} />
                        <Route path="/logout" element={<LogoutRoute />} />
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="*" element={<ErrorPage />} />
                      </Routes>
                    </div>
                  </ErrorBoundary>
                </Router>
              </WebSocketProvider>
            </NotificationProvider>
          </AuthProvider>
  )
}

const ProtectedRoute = memo(function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
})

const PublicRoute = memo(function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }
  
  return user ? <Navigate to="/projects" replace /> : children
})

const AdminRoute = memo(function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    return <Forbidden />
  }
  
  return children
})

export default App
