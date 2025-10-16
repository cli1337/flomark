import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../../contexts/ToastContext'
import usePageTitle from '../../../hooks/usePageTitle'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { LockKeyhole, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import * as Form from '@radix-ui/react-form'
import api from '../../../services/api'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  
  usePageTitle('Reset Password')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      showError('Invalid Link', 'Reset token is missing. Please use the link from your email.')
      return
    }

    if (password !== confirmPassword) {
      showError('Error', 'Passwords do not match')
      return
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      showError('Invalid Password', 'Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/user/reset-password', {
        token,
        newPassword: password
      })
      
      if (response.data.success) {
        setResetSuccess(true)
        showSuccess('Success', response.data.message)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.'
      showError('Error', message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Invalid Link</CardTitle>
              <CardDescription className="text-gray-400">
                The reset link is missing or invalid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/forgot-password">
                <Button className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  Request new reset link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {resetSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <LockKeyhole className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {resetSuccess ? 'Password reset successful' : 'Reset your password'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {resetSuccess 
                ? 'You can now log in with your new password' 
                : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/30">
                  <p className="text-sm text-green-300">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                </div>
                <Link to="/login">
                  <Button className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                    Go to login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form.Root onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <Form.Field name="password" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Form.Label htmlFor="password" className="text-sm font-medium text-gray-200">
                      New Password
                    </Form.Label>
                    <Form.Message match="valueMissing" className="text-xs text-destructive">
                      Please enter a password
                    </Form.Message>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Form.Control asChild>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </Form.Control>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Form.Field>

                {/* Confirm Password Field */}
                <Form.Field name="confirmPassword" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Form.Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                      Confirm Password
                    </Form.Label>
                    <Form.Message match="valueMissing" className="text-xs text-destructive">
                      Please confirm your password
                    </Form.Message>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Form.Control asChild>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-12 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </Form.Control>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Form.Field>

                {/* Password requirements */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>At least 8 characters</li>
                    <li>At least 1 uppercase letter</li>
                    <li>At least 1 special character (!@#$%^&*)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Form.Submit asChild>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Resetting password...
                      </span>
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </Form.Submit>
              </Form.Root>
            )}

            {/* Back to login link */}
            {!resetSuccess && (
              <div className="mt-6 text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword

