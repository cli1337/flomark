import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/auth/login/Login'
import Register from './pages/auth/register/Register'
import Projects from './pages/home/List'
import Main from './pages/landing/Main'
import Project from './pages/home/Project'
import Dashboard from './pages/dashboard/Dashboard'

import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useServerStatus } from './hooks/useServerStatus'

function LogoutRoute() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  return <div className="container">Logging out...</div>
}

function App() {
  // Monitor server status
  useServerStatus()

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/logout" element={<LogoutRoute />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {/* <Route path="/" element={<Main />} /> */}
            <Route path="/projects/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="container">Loading...</div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="container">Loading...</div>
  }
    
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default App
