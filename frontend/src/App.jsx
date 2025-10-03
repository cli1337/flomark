import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/auth/login/Login'
import Register from './pages/auth/register/Register'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Profile from './pages/profile/Profile'
import JoinProject from './pages/join/JoinProject'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { useServerStatus } from './hooks/useServerStatus'
import LoadingState from './components/ui/LoadingState'

function LogoutRoute() {
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
}

function App() {
  useServerStatus()

  return (
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                  <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/join/:inviteLink" element={<JoinProject />} />
                  <Route path="/logout" element={<LogoutRoute />} />
                  <Route path="/" element={<Navigate to="/projects" />} />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#18191b] flex items-center justify-center">
        <LoadingState message="Loading..." />
      </div>
    )
  }
  
  return user ? <Navigate to="/projects" replace /> : children
}

export default App
