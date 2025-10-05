import React, { createContext, useContext, useEffect, useState } from 'react'
import socketService from '../services/socketService'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(new Map())

  useEffect(() => {
    if (user) {

      if (!socketService.isSocketConnected()) {
        const connected = socketService.connect()
        if (connected) {
          setIsConnected(true)
        }
      } else {
        setIsConnected(true)
      }


      const handleConnect = () => {
        setIsConnected(true)
        console.log('🔌 WebSocket connected')
      }

      const handleDisconnect = () => {
        setIsConnected(false)
        console.log('🔌 WebSocket disconnected')
      }

      const handleConnectError = (error) => {
        console.error('❌ WebSocket connection error:', error)
        setIsConnected(false)
      }


      window.addEventListener('socket:connect', handleConnect)
      window.addEventListener('socket:disconnect', handleDisconnect)
      window.addEventListener('socket:connect_error', handleConnectError)

      return () => {
        window.removeEventListener('socket:connect', handleConnect)
        window.removeEventListener('socket:disconnect', handleDisconnect)
        window.removeEventListener('socket:connect_error', handleConnectError)
      }
    } else {
      socketService.disconnect()
      setIsConnected(false)
    }
  }, [user])


  useEffect(() => {
    const handleUserPresenceChanged = (data) => {
      setActiveUsers(prev => {
        const newMap = new Map(prev)
        if (data.isActive) {
          newMap.set(data.userId, {
            id: data.userId,
            name: data.userName,
            isActive: true,
            lastSeen: new Date().toISOString()
          })
        } else {

          newMap.delete(data.userId)
        }
        return newMap
      })
    }

    const unsubscribe = socketService.on('user-presence-changed', handleUserPresenceChanged)
    return unsubscribe
  }, [])



  useEffect(() => {
    const handleActiveUsersUpdated = (data) => {
      if (data.activeUsers) {
        const usersMap = new Map()
        data.activeUsers.forEach(user => {
          usersMap.set(user.id, {
            id: user.id,
            name: user.name,
            isActive: true,
            lastSeen: user.joinedAt || new Date().toISOString()
          })
        })
        
        setActiveUsers(usersMap)
      }
    }

    const unsubscribe = socketService.on('active-users-updated', handleActiveUsersUpdated)
    return unsubscribe
  }, [])


  useEffect(() => {
    const handleUserJoined = (data) => {
      console.log('🔍 WebSocketContext - User joined event received:', data)

    }

    const handleUserLeft = (data) => {
      console.log('🔍 WebSocketContext - User left event received:', data)

    }

    const unsubscribeJoined = socketService.on('user-joined', handleUserJoined)
    const unsubscribeLeft = socketService.on('user-left', handleUserLeft)

    return () => {
      unsubscribeJoined()
      unsubscribeLeft()
    }
  }, [user?.id])

  const value = {
    isConnected,
    activeUsers: Array.from(activeUsers.values()),
    joinProject: socketService.joinProject,
    leaveProject: socketService.leaveProject,
    updateUserPresence: socketService.updateUserPresence,
    on: socketService.on,
    broadcastProjectUpdate: socketService.broadcastProjectUpdate,
    broadcastTaskUpdate: socketService.broadcastTaskUpdate
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContext
