import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'

export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const { showServerStatus } = useToast()

  const checkServerStatus = useCallback(async () => {
    setIsChecking(true)
    try {
      // Try to ping a simple endpoint
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000
      })
      
      const wasOffline = !isOnline
      setIsOnline(response.ok)
      
      // Show notification if status changed
      if (wasOffline && response.ok) {
        showServerStatus(true, 'Server connection restored')
      } else if (isOnline && !response.ok) {
        showServerStatus(false, 'Server connection lost')
      }
    } catch (error) {
      const wasOffline = !isOnline
      setIsOnline(false)
      
      // Show notification if status changed
      if (isOnline) {
        showServerStatus(false, 'Unable to connect to server')
      }
    } finally {
      setIsChecking(false)
    }
  }, [isOnline, showServerStatus])

  const checkAuthEndpoint = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.status === 401) {
        // Server is online but user is not authenticated (this is normal)
        const wasOffline = !isOnline
        setIsOnline(true)
        
        if (wasOffline) {
          showServerStatus(true, 'Server connection restored')
        }
      } else if (response.ok) {
        const wasOffline = !isOnline
        setIsOnline(true)
        
        if (wasOffline) {
          showServerStatus(true, 'Server connection restored')
        }
      }
    } catch (error) {
      const wasOffline = !isOnline
      setIsOnline(false)
      
      if (isOnline) {
        showServerStatus(false, 'Server connection lost')
      }
    }
  }, [isOnline, showServerStatus])

  // Check server status on mount and when window regains focus
  useEffect(() => {
    checkServerStatus()
    
    const handleFocus = () => {
      checkServerStatus()
    }
    
    const handleOnline = () => {
      setIsOnline(true)
      showServerStatus(true, 'Internet connection restored')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      showServerStatus(false, 'Internet connection lost')
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkServerStatus])

  // Periodic status check
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthEndpoint()
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [checkAuthEndpoint])

  return {
    isOnline,
    isChecking,
    checkServerStatus
  }
}
