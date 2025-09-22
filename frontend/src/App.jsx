import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
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
  
  // Debug logging to help identify the issue
  console.log('PublicRoute - user:', user, 'loading:', loading)
  
  return user ? <Navigate to="/profile" replace /> : children
}

export default App
