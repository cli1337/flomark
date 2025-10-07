import { useState, useCallback, useRef } from 'react'

export const useTaskMoveAnimation = () => {
  const [animations, setAnimations] = useState(new Map())
  const taskElementsRef = useRef(new Map())

  // Get position from registered ref OR find in DOM
  const getTaskPosition = useCallback((taskId, listId) => {
    // Try registered element first
    let element = taskElementsRef.current.get(taskId)
    
    // If not found, search in DOM by data-task-id attribute
    if (!element) {
      element = document.querySelector(`[data-task-id="${taskId}"]`)
      console.log(`🔍 Found task element in DOM for ${taskId}:`, !!element)
    }
    
    // If still not found but we have a listId, use the list center as starting point
    if (!element && listId) {
      const columnElement = document.querySelector(`[data-list-id="${listId}"]`)
      if (columnElement) {
        console.log(`📍 Using column center for task ${taskId} from list ${listId}`)
        const rect = columnElement.getBoundingClientRect()
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + 150 // Offset from top to simulate task position
        }
      }
    }
    
    if (element) {
      const rect = element.getBoundingClientRect()
      console.log(`✅ Got task position for ${taskId}:`, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }
    
    console.warn(`❌ Could not find position for task ${taskId}`)
    return null
  }, [])

  const registerTaskElement = useCallback((taskId, element) => {
    if (element) {
      taskElementsRef.current.set(taskId, element)
    } else {
      taskElementsRef.current.delete(taskId)
    }
  }, [])

  const startTaskMoveAnimation = useCallback((taskId, task, fromListId, toListId) => {
    console.log('🚀 Starting animation with:', { taskId, fromListId, toListId })

    // Get FROM position (from the source list)
    const fromPosition = getTaskPosition(taskId, fromListId)
    
    // Get TO position (center of destination list)
    console.log('🔍 Looking for destination column with data-list-id:', toListId)
    let toColumnElement = document.querySelector(`[data-list-id="${toListId}"]`)
    console.log('🔍 Found destination column:', !!toColumnElement)
    
    // If not found, try finding all columns and matching
    if (!toColumnElement) {
      const allColumns = document.querySelectorAll('[data-list-id]')
      console.log('🔍 All columns found:', allColumns.length, Array.from(allColumns).map(c => c.getAttribute('data-list-id')))
    }
    
    let toPosition = null
    
    if (toColumnElement) {
      const rect = toColumnElement.getBoundingClientRect()
      toPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      console.log('✅ Got destination position:', toPosition)
    } else {
      console.warn('⚠️ Destination column not found, using fallback')
      // Use a fallback - animate to the right side of the screen
      toPosition = {
        x: window.innerWidth - 200,
        y: window.innerHeight / 2
      }
    }

    if (!fromPosition || !toPosition) {
      console.log('🚀 Cannot animate - missing positions:', { fromPosition, toPosition })
      return
    }

    console.log('🚀 Starting task move animation:', {
      taskId,
      fromPosition,
      toPosition,
      fromListId,
      toListId
    })

    const animationId = `${taskId}-${Date.now()}`
    
    setAnimations(prev => {
      const newAnimations = new Map(prev)
      newAnimations.set(animationId, {
        id: animationId,
        task,
        fromPosition,
        toPosition,
        isVisible: true
      })
      return newAnimations
    })
  }, [getTaskPosition])


  const completeAnimation = useCallback((animationId) => {
    setAnimations(prev => {
      const newAnimations = new Map(prev)
      newAnimations.delete(animationId)
      return newAnimations
    })
  }, [])


  const getActiveAnimations = useCallback(() => {
    return Array.from(animations.values())
  }, [animations])

  return {
    registerTaskElement,
    startTaskMoveAnimation,
    completeAnimation,
    getActiveAnimations,
    animations
  }
}
