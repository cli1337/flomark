import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { inviteService } from '../services/inviteService'
import { useToast } from '../contexts/ToastContext'
import { Copy, Mail, Link2 } from 'lucide-react'

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [email, setEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleGenerateLink = async () => {
    if (!email.trim()) {
      showError('Email Required', 'Please enter an email address')
      return
    }

    if (!email.includes('@')) {
      showError('Invalid Email', 'Please enter a valid email address')
      return
    }

    try {
      setIsGenerating(true)
      const response = await inviteService.createInviteLink(projectId, email)
      
      if (response.success) {
        const fullLink = `${window.location.origin}/join/${response.data}`
        setInviteLink(fullLink)
        showSuccess('Invite Link Generated', 'Share this link with the person you want to invite')
      } else {
        showError('Failed to Generate Link', response.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error generating invite link:', error)
      showError('Failed to Generate Link', 'Please try again later')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setIsCopied(true)
      showSuccess('Link Copied', 'Invite link has been copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
      showError('Failed to Copy', 'Could not copy link to clipboard')
    }
  }

  const handleClose = () => {
    setEmail('')
    setInviteLink('')
    setIsCopied(false)
    onClose()
  }

  const handleReset = () => {
    setEmail('')
    setInviteLink('')
    setIsCopied(false)
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-md backdrop-blur-xl relative z-[9999]">
        <h2 className="text-xl font-semibold text-white mb-4">Invite to {projectName}</h2>
        
        <div className="space-y-4">
          {!inviteLink ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-400 mt-1">
                  The person will need to use this email to join the project
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invite Link Generated
                </label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 break-all">{inviteLink}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 rounded-lg border border-transparent hover:border-white/20"
          >
            Cancel
          </button>
          
          {!inviteLink ? (
            <button
              onClick={handleGenerateLink}
              disabled={!email.trim() || isGenerating}
              className="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                'Generate Link'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg border border-transparent hover:border-white/20"
              >
                Generate Another
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Copy className="h-4 w-4" />
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400 pt-4 mt-4 border-t border-white/10">
          <p>• Invite links are valid until used or expired</p>
          <p>• The invited person must use the email address you specified</p>
          <p>• They will be added as a project member upon joining</p>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default InviteModal
