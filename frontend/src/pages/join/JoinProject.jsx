import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { inviteService } from '../../services/inviteService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import usePageTitle from '../../hooks/usePageTitle'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Users,
  FolderOpen
} from 'lucide-react'

const JoinProject = () => {
  const { inviteLink } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  usePageTitle('Join Project')
  
  const [status, setStatus] = useState('loading')
  const [countdown, setCountdown] = useState(3)
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    if (inviteLink) {
      handleJoinProject()
    }
  }, [inviteLink])

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'success' && countdown === 0) {
      navigate('/projects')
    }
  }, [status, countdown, navigate])

  const handleJoinProject = async () => {
    try {
      setStatus('loading')
      const response = await inviteService.joinProject(inviteLink)
      
      if (response.success) {
        setStatus('success')
        setProjectName(response.data?.project?.name || 'the project')
        showSuccess('Successfully Joined!', `You have been added to ${projectName}`)
      } else {
        handleError(response)
      }
    } catch (error) {
      console.error('Error joining project:', error)
      handleError(error.response?.data || { message: 'An unexpected error occurred' })
    }
  }

  const handleError = (error) => {
    const key = error.key || error.message
    
    switch (key) {
      case 'invite_link_not_found':
        setStatus('expired')
        break
      case 'project_not_found':
        setStatus('not-found')
        break
      case 'user_not_found':
        setStatus('error')
        showError('User Not Found', 'The email associated with this invite was not found')
        break
      case 'email_mismatch':
        setStatus('email-mismatch')
        break
      case 'already_a_member':
        setStatus('already-member')
        break
      default:
        setStatus('error')
        showError('Failed to Join', error.message || 'Something went wrong')
    }
  }

  const handleGoToProjects = () => {
    navigate('/projects')
  }

  const handleRetry = () => {
    setStatus('loading')
    handleJoinProject()
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Joining Project...</h2>
            <p className="text-gray-400">Please wait while we process your invite</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Project!</h2>
            <p className="text-gray-300 mb-4">
              You have successfully joined <span className="text-white font-semibold">{projectName}</span>
            </p>
            <p className="text-gray-400 mb-6">
              You will be redirected to your projects in {countdown} seconds...
            </p>
            <div className="flex items-center justify-center gap-2 text-white">
              <ArrowRight className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Redirecting...</span>
            </div>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invite Expired</h2>
            <p className="text-gray-300 mb-4">
              This invite link has expired or is no longer valid
            </p>
            <p className="text-gray-400 mb-6">
              Please request a new invite link from the project owner
            </p>
            <Button
              onClick={handleGoToProjects}
              className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Go to Projects
            </Button>
          </div>
        )

      case 'not-found':
        return (
          <div className="text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
            <p className="text-gray-300 mb-4">
              The project associated with this invite no longer exists
            </p>
            <p className="text-gray-400 mb-6">
              The project may have been deleted or the invite is invalid
            </p>
            <Button
              onClick={handleGoToProjects}
              className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Go to Projects
            </Button>
          </div>
        )

      case 'email-mismatch':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Email Mismatch</h2>
            <p className="text-gray-300 mb-4">
              This invite link was created for a specific email address
            </p>
            <p className="text-gray-400 mb-6">
              You can only join this project with the email address the invite was sent to
            </p>
            <Button
              onClick={handleGoToProjects}
              className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Go to Projects
            </Button>
          </div>
        )

      case 'already-member':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Already a Member</h2>
            <p className="text-gray-300 mb-4">
              You are already a member of this project
            </p>
            <p className="text-gray-400 mb-6">
              You can access this project from your projects list
            </p>
            <Button
              onClick={handleGoToProjects}
              className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Go to Projects
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Failed to Join</h2>
            <p className="text-gray-300 mb-4">
              There was an error joining the project
            </p>
            <p className="text-gray-400 mb-6">
              This might be due to a network issue or server problem
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleRetry}
                className="bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Try Again
              </Button>
              <Button
                onClick={handleGoToProjects}
                className="bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Go to Projects
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Content */}
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl text-white">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">
                You need to be logged in to join a project
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Go to Login
              </Button>
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
        <Card className="w-full max-w-lg border-white/10 bg-white/5 backdrop-blur-xl text-white">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JoinProject
