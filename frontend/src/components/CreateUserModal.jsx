import React, { useState } from 'react'
import { X, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { adminService } from '../services/adminService'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'

const CreateUserModal = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()

  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const specialChars = '!@#$%^&*'
    
    let password = ''
    
    // Ensure at least 1 uppercase
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    
    // Ensure at least 1 special character
    password += specialChars[Math.floor(Math.random() * specialChars.length)]
    
    // Ensure at least 1 number
    password += numbers[Math.floor(Math.random() * numbers.length)]
    
    // Fill the rest (make it 12 characters total for good security)
    const allChars = lowercase + uppercase + numbers + specialChars
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password to randomize the position of required characters
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setFormData(prev => ({ ...prev, password }))
    setShowPassword(true)
    
    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
      showToast('Password generated and copied to clipboard!', 'success')
    }).catch(() => {
      showToast('Password generated!', 'success')
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('All fields are required', 'error')
      return
    }

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error')
      return
    }

    if (!/[A-Z]/.test(formData.password)) {
      showToast('Password must contain at least 1 uppercase letter', 'error')
      return
    }

    if (!/[!@#$%^&*]/.test(formData.password)) {
      showToast('Password must contain at least 1 special character', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await adminService.createUser(formData)
      if (response.success) {
        showToast('User created successfully', 'success')
        onUserCreated()
      } else {
        showToast(response.message || 'Failed to create user', 'error')
      }
    } catch (error) {
      showToast(error.data?.message || 'Failed to create user', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-md backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New User</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              placeholder="Enter full name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md transition-all"
              >
                <Sparkles className="h-3 w-3" />
                Generate
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                placeholder="Enter password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Must be 8+ characters with uppercase and special character
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 cursor-pointer"
              disabled={loading || currentUser.role === 'ADMIN'}
              style={{ colorScheme: 'dark' }}
            >
              <option value="USER" className="bg-[#1a1b1e]">User</option>
              {currentUser.role === 'OWNER' && (
                <option value="ADMIN" className="bg-[#1a1b1e]">Admin</option>
              )}
            </select>
            {currentUser.role === 'ADMIN' && (
              <p className="text-xs text-gray-400 mt-1">
                Admins can only create regular user accounts
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal

