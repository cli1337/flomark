import React, { createContext, useContext, useState, useCallback } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      title: toast.title || '',
      description: toast.description || '',
      type: toast.type || 'info',
      duration: toast.duration || 5000,
      action: toast.action || null,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((title, description) => {
    return addToast({ type: 'success', title, description })
  }, [addToast])

  const showError = useCallback((title, description) => {
    return addToast({ type: 'error', title, description })
  }, [addToast])

  const showWarning = useCallback((title, description) => {
    return addToast({ type: 'warning', title, description })
  }, [addToast])

  const showInfo = useCallback((title, description) => {
    return addToast({ type: 'info', title, description })
  }, [addToast])

  const showServerStatus = useCallback((isOnline, message) => {
    if (isOnline) {
      return showSuccess('Server Online', message || 'Connection restored')
    } else {
      return showError('Server Offline', message || 'Unable to connect to server')
    }
  }, [showSuccess, showError])

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10'
      case 'error':
        return 'border-red-500/20 bg-red-500/10'
      case 'warning':
        return 'border-yellow-500/20 bg-gray-500/10'
      case 'info':
      default:
        return 'border-blue-500/20 bg-blue-500/10'
    }
  }

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showServerStatus
    }}>
      <Toast.Provider swipeDirection="right" duration={300}>
        {children}
        <Toast.Viewport className="fixed top-4 right-4 z-[9999] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]" />
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all ${getToastStyles(toast.type)} backdrop-blur-xl`}
            duration={toast.duration}
          >
            <div className="flex items-start space-x-3">
              {getToastIcon(toast.type)}
              <div className="flex-1 space-y-1">
                {toast.title && (
                  <Toast.Title className="text-sm font-semibold text-white">
                    {toast.title}
                  </Toast.Title>
                )}
                {toast.description && (
                  <Toast.Description className="text-sm text-gray-300">
                    {toast.description}
                  </Toast.Description>
                )}
              </div>
            </div>
            <Toast.Close asChild>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </Toast.Close>
            {toast.action && (
              <Toast.Action asChild altText="Action">
                {toast.action}
              </Toast.Action>
            )}
          </Toast.Root>
        ))}
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
