import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../../contexts/ToastContext'
import usePageTitle from '../../../hooks/usePageTitle'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import * as Form from '@radix-ui/react-form'
import api from '../../../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [smtpConfigured, setSmtpConfigured] = useState(true)
  const [checkingSmtp, setCheckingSmtp] = useState(true)

  const { showError, showSuccess } = useToast()
  
  usePageTitle('Forgot Password')

  // Check SMTP status on mount
  useEffect(() => {
    const checkSmtpStatus = async () => {
      try {
        const response = await api.get('/health')
        setSmtpConfigured(response.data.smtp?.configured || false)
      } catch (error) {
        console.error('Failed to check SMTP status:', error)
        setSmtpConfigured(false)
      } finally {
        setCheckingSmtp(false)
      }
    }
    checkSmtpStatus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!smtpConfigured) {
      showError('Service Unavailable', 'Email service is not configured. Password reset is currently unavailable.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/user/forgot-password', { email })
      
      if (response.data.success) {
        setEmailSent(true)
        showSuccess('Email Sent', response.data.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.'
      showError('Error', message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingSmtp) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="text-white">Loading...</div>
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
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {emailSent ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {emailSent 
                ? 'We\'ve sent you a password reset link' 
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!smtpConfigured && (
              <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-500">Email Service Unavailable</p>
                    <p className="text-xs text-yellow-500/80 mt-1">
                      Password reset is currently unavailable because the email service is not configured. 
                      Please contact your system administrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {emailSent ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/30">
                  <p className="text-sm text-green-300">
                    If an account exists with <strong>{email}</strong>, you will receive a password reset email shortly.
                  </p>
                  <p className="text-xs text-green-300/70 mt-2">
                    The link will expire in 1 hour.
                  </p>
                </div>
                <div className="text-center text-sm text-gray-400">
                  Didn't receive the email? Check your spam folder or try again.
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Try again
                </Button>
              </div>
            ) : (
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
                        disabled={!smtpConfigured}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </Form.Control>
                  </div>
                </Form.Field>

                {/* Submit Button */}
                <Form.Submit asChild>
                  <Button
                    type="submit"
                    disabled={loading || !smtpConfigured}
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
                        Sending...
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </Form.Submit>
              </Form.Root>
            )}

            {/* Back to login link */}
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword

