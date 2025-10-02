import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

const useAuth = () => {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      authService.getProfile()
        .then(userData => {
          setUser(userData)
        })
        .catch((error) => {
          console.log('Profile load failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        setUser(response.data.user)

        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'An error occurred during login' }
    }
  }

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await authService.register(name, email, password, confirmPassword)
      
      if (response.success) {
        return { success: true, message: 'Registration successful! Please login.' }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'An error occurred during registration' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('projectViewMode')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { useAuth }
