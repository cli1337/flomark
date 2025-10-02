import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { User, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react'
import * as Form from '@radix-ui/react-form'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const { register } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return minLength && hasUpperCase && hasSpecialChar
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!validatePassword(password)) {
      showError('Invalid Password', 'Password must be at least 8 characters with 1 uppercase letter and 1 special character')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      showError('Password Mismatch', 'Passwords do not match')
      setLoading(false)
      return
    }

    if (!agreedToTerms) {
      showError('Terms Required', 'Please agree to the Terms of Service and Privacy Policy')
      setLoading(false)
      return
    }

    const result = await register(name, email, password, confirmPassword)

    if (result.success) {
      showSuccess('Registration Successful', result.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      showError('Registration Failed', result.message)
    }

    setLoading(false)
  }

  const passwordStrength = () => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    if (score <= 2) return { strength: score, text: 'Weak', color: 'text-red-400' }
    if (score <= 3) return { strength: score, text: 'Fair', color: 'text-yellow-400' }
    if (score <= 4) return { strength: score, text: 'Good', color: 'text-blue-400' }
    return { strength: score, text: 'Strong', color: 'text-green-400' }
  }

  const passwordInfo = passwordStrength()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4 py-8">
            <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Create your account</CardTitle>
            <CardDescription className="text-gray-400">Start managing your tasks today</CardDescription>
          </CardHeader>
              <CardContent>
            <Form.Root onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <Form.Field name="name" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Form.Label htmlFor="name" className="text-sm font-medium text-gray-200">
                    Full Name
                  </Form.Label>
                  <Form.Message match="valueMissing" className="text-xs text-destructive">
                    Please enter your full name
                  </Form.Message>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Form.Control asChild>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </Form.Control>
                </div>
              </Form.Field>

              {/* Email Field */}
              <Form.Field name="email" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Form.Label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Email
                  </Form.Label>
                  <Form.Message match="valueMissing" className="text-xs text-destructive">
                    Please enter your email
                  </Form.Message>
                  <Form.Message match="typeMismatch" className="text-xs text-destructive">
                    Please provide a valid email
                  </Form.Message>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Form.Control asChild>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </Form.Control>
                </div>
              </Form.Field>

              {/* Password Field */}
              <Form.Field name="password" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Form.Label htmlFor="password" className="text-sm font-medium text-gray-200">
                    Password
                  </Form.Label>
                  <Form.Message match="valueMissing" className="text-xs text-destructive">
                    Please enter your password
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordInfo.strength <= 2 ? 'bg-red-500' :
                            passwordInfo.strength <= 3 ? 'bg-gray-500' :
                            passwordInfo.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordInfo.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${passwordInfo.color}`}>
                        {passwordInfo.text}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Must be at least 8 characters with 1 uppercase letter and 1 special character
                    </div>
                  </div>
                )}
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
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-1 flex items-center space-x-2">
                    {password === confirmPassword ? (
                      <>
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </Form.Field>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>


              {/* Submit Button */}
              <Form.Submit asChild>
                <Button
                  type="submit"
                  disabled={loading || !agreedToTerms}
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
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </Form.Submit>

              {/* Sign in link */}
              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </Form.Root>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
