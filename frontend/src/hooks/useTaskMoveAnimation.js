import { useState, useCallback, useRef } from 'react'

export const useTaskMoveAnimation = () => {
  const [animations, setAnimations] = useState(new Map())
  const taskElementsRef = useRef(new Map())


  const getTaskPosition = useCallback((taskId) => {
    const element = taskElementsRef.current.get(taskId)
    if (element) {
      const rect = element.getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }
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

    const fromPosition = getTaskPosition(taskId)
    

    const toColumnElement = document.querySelector(`[data-list-id="${toListId}"]`)
    let toPosition = null
    
    if (toColumnElement) {
      const rect = toColumnElement.getBoundingClientRect()
      toPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
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
