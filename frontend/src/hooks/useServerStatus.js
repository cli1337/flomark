import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'
import demoDataService from '../services/demoDataService'

export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const { showServerStatus } = useToast()

  const checkServerStatus = useCallback(async () => {
    // Skip server checks in demo mode
    if (demoDataService.isDemoMode()) {
      setIsOnline(true);
      return;
    }

    setIsChecking(true)
    try {
      const response = await api.get('/health')
      
      const wasOffline = !isOnline
      setIsOnline(true)

      if (wasOffline) {
        showServerStatus(true, 'Server connection restored')
      }
    } catch (error) {
      const wasOffline = !isOnline
      setIsOnline(false)
      
      if (isOnline) {
        showServerStatus(false, 'Unable to connect to server')
      }
    } finally {
      setIsChecking(false)
    }
  }, [isOnline, showServerStatus])

  const checkAuthEndpoint = useCallback(async () => {
    // Skip server checks in demo mode
    if (demoDataService.isDemoMode()) {
      setIsOnline(true);
      return;
    }

    try {
      const response = await api.get('/user/profile')
      
      const wasOffline = !isOnline
      setIsOnline(true)
      
      if (wasOffline) {
        showServerStatus(true, 'Server connection restored')
      }
    } catch (error) {


      if (error.status === 401) {
        const wasOffline = !isOnline
        setIsOnline(true)
        
        if (wasOffline) {
          showServerStatus(true, 'Server connection restored')
        }
      } else {

        const wasOffline = !isOnline
        setIsOnline(false)
        
        if (isOnline) {
          showServerStatus(false, 'Server connection lost')
        }
      }
    }
  }, [isOnline, showServerStatus])

  useEffect(() => {
    // Skip server checks in demo mode
    if (demoDataService.isDemoMode()) {
      setIsOnline(true);
      return;
    }

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

  useEffect(() => {
    // Skip server checks in demo mode
    if (demoDataService.isDemoMode()) {
      return;
    }

    const interval = setInterval(() => {
      checkAuthEndpoint()
    }, 30000) 

    return () => clearInterval(interval)
  }, [checkAuthEndpoint])

  return {
    isOnline,
    isChecking,
    checkServerStatus
  }
}
