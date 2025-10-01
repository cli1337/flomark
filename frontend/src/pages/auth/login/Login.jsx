import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { LockKeyhole, Mail, Eye, EyeOff } from 'lucide-react'
import * as Form from '@radix-ui/react-form'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      showSuccess('Login Successful', 'Welcome back!')
      navigate('/dashboard')
    } else {
      showError('Login Failed', result.message)
    }

    setLoading(false)
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
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
              <CardContent>
            <Form.Root onSubmit={handleSubmit} className="space-y-4">
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
              </Form.Field>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
                  />
                  Remember me
                </label>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Form.Submit>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </Form.Root>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
