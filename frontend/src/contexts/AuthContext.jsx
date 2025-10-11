import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
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


    if (token && token.trim() !== '') {
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

      if (token === '') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password)
      
      if (response.success) {
        if (response.data?.requires2fa && response.data?.pendingToken) {
          return { success: true, needs2FA: true, pendingToken: response.data.pendingToken }
        }
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
  }, [])

  const completeTwoFactorLogin = useCallback(async (pendingToken, code) => {
    try {
      const response = await authService.verify2FALogin(pendingToken, code)
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        setUser(response.data.user)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'Failed to verify 2FA code' }
    }
  }, [])

  const register = useCallback(async (name, email, password, confirmPassword) => {
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
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('projectViewMode')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (name) => {
    try {
      const response = await authService.updateProfile(name)
      
      if (response.success) {
        setUser(response.data)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'An error occurred while updating profile' }
    }
  }, [])

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword(currentPassword, newPassword)
      
      if (response.success) {
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'An error occurred while updating password' }
    }
  }, [])

  const uploadProfileImage = useCallback(async (file) => {
    try {
      const response = await authService.uploadProfileImage(file)
      
      if (response.success) {
        setUser(response.data)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      if (error.error && error.data) {
        return { success: false, message: error.data.message }
      }
      return { success: false, message: error.message || 'An error occurred while uploading image' }
    }
  }, [])

  const value = useMemo(() => ({
    user,
    login,
    completeTwoFactorLogin,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadProfileImage,
    loading
  }), [user, login, completeTwoFactorLogin, register, logout, updateProfile, updatePassword, uploadProfileImage, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { useAuth }
