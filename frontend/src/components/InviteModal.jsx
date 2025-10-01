import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { inviteService } from '../services/inviteService'
import { useToast } from '../contexts/ToastContext'
import { Copy, Mail, Link2, X } from 'lucide-react'

const InviteModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [email, setEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { showSuccess, showError } = useToast()

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-white/10 bg-white/5 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite to {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!inviteLink ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-4 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-400">
                  The person will need to use this email to join the project
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleGenerateLink}
                  disabled={!email.trim() || isGenerating}
                  className="flex-1 bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Link'}
                </Button>
                <Button
                  onClick={handleClose}
                  className="bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card className="border-white/10 bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-300">Invite Link Generated</span>
                  </div>
                  <div className="border border-white/10 bg-white/5 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-400 break-all">{inviteLink}</p>
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="w-full bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Generate Another
                </Button>
                <Button
                  onClick={handleClose}
                  className="bg-white text-black font-medium py-2.5 px-4 rounded-lg border border-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400 pt-2 border-t border-white/10">
          <p>• Invite links are valid until used or expired</p>
          <p>• The invited person must use the email address you specified</p>
          <p>• They will be added as a project member upon joining</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InviteModal
