import { useEffect, useRef } from 'react'
import socketService from '../services/socketService'

export const useWebSocketEvents = (projectId, callbacks = {}) => {

  const callbacksRef = useRef(callbacks)
  

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])


  useEffect(() => {
    const unsubscribe = socketService.on('project-created', (data) => {
      console.log('📁 Project created event received:', data)
      if (callbacksRef.current.onProjectCreated) {
        callbacksRef.current.onProjectCreated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('project-updated', (data) => {

      if (callbacksRef.current.onProjectUpdated) {
        callbacksRef.current.onProjectUpdated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('project-image-updated', (data) => {
      console.log('🖼️ Project image updated event received:', data)
      if (callbacksRef.current.onProjectImageUpdated) {
        callbacksRef.current.onProjectImageUpdated(data)
      }
    })

    return unsubscribe
  }, [])


  useEffect(() => {
    const unsubscribe = socketService.on('list-created', (data) => {
      console.log('📋 List created event received:', data)
      if (callbacksRef.current.onListCreated) {
        callbacksRef.current.onListCreated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('list-updated', (data) => {
      console.log('📋 List updated event received:', data)
      if (callbacksRef.current.onListUpdated) {
        callbacksRef.current.onListUpdated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('lists-reordered', (data) => {
      console.log('📋 Lists reordered event received:', data)
      if (callbacksRef.current.onListsReordered) {
        callbacksRef.current.onListsReordered(data)
      }
    })

    return unsubscribe
  }, [])


  useEffect(() => {
    const unsubscribe = socketService.on('member-joined', (data) => {
      console.log('👤 Member joined event received:', data)
      if (callbacksRef.current.onMemberJoined) {
        callbacksRef.current.onMemberJoined(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('member-removed', (data) => {
      console.log('👤 Member removed event received:', data)
      if (callbacksRef.current.onMemberRemoved) {
        callbacksRef.current.onMemberRemoved(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('member-role-updated', (data) => {
      console.log('👤 Member role updated event received:', data)
      if (callbacksRef.current.onMemberRoleUpdated) {
        callbacksRef.current.onMemberRoleUpdated(data)
      }
    })

    return unsubscribe
  }, [])


  useEffect(() => {
    const unsubscribe = socketService.on('label-created', (data) => {
      console.log('🏷️ Label created event received:', data)
      if (callbacksRef.current.onLabelCreated) {
        callbacksRef.current.onLabelCreated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('label-updated', (data) => {
      console.log('🏷️ Label updated event received:', data)
      if (callbacksRef.current.onLabelUpdated) {
        callbacksRef.current.onLabelUpdated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('label-deleted', (data) => {
      console.log('🏷️ Label deleted event received:', data)
      if (callbacksRef.current.onLabelDeleted) {
        callbacksRef.current.onLabelDeleted(data)
      }
    })

    return unsubscribe
  }, [])


  useEffect(() => {
    const unsubscribe = socketService.on('task-created', (data) => {
      console.log('📋 Task created event received:', data)
      if (callbacksRef.current.onTaskCreated) {
        callbacksRef.current.onTaskCreated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('task-updated', (data) => {
      console.log('📋 Task updated event received:', data)
      if (callbacksRef.current.onTaskUpdated) {
        callbacksRef.current.onTaskUpdated(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('task-moved', (data) => {
      console.log('📋 Task moved event received:', data)
      console.log('📋 Available callbacks:', Object.keys(callbacksRef.current))
      if (callbacksRef.current.onTaskMoved) {
        console.log('📋 Calling onTaskMoved callback')
        callbacksRef.current.onTaskMoved(data)
      } else {
        console.log('📋 No onTaskMoved callback available')
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('task-deleted', (data) => {
      console.log('📋 Task deleted event received:', data)
      if (callbacksRef.current.onTaskDeleted) {
        callbacksRef.current.onTaskDeleted(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('project-deleted', (data) => {
      console.log('📁 Project deleted event received:', data)
      if (callbacksRef.current.onProjectDeleted) {
        callbacksRef.current.onProjectDeleted(data)
      }
    })

    return unsubscribe
  }, [])


  useEffect(() => {
    const unsubscribe = socketService.on('user-joined', (data) => {
      console.log('👤 User joined event received:', data)
      if (callbacksRef.current.onUserJoined) {
        callbacksRef.current.onUserJoined(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('user-left', (data) => {
      console.log('👤 User left event received:', data)
      if (callbacksRef.current.onUserLeft) {
        callbacksRef.current.onUserLeft(data)
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = socketService.on('user-presence-changed', (data) => {
      console.log('👤 User presence changed event received:', data)
      if (callbacksRef.current.onUserPresenceChanged) {
        callbacksRef.current.onUserPresenceChanged(data)
      }
    })

    return unsubscribe
  }, [])




  return {
    joinProject: socketService.joinProject,
    leaveProject: socketService.leaveProject,
    updateUserPresence: socketService.updateUserPresence,
    isConnected: socketService.isSocketConnected()
  }
}

export default useWebSocketEvents