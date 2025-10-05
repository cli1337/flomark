import { useState, useCallback, useRef } from 'react'
import { taskService } from '../services/taskService'
import { listService } from '../services/listService'

export const useOptimisticUpdates = () => {
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map())
  const rollbackRef = useRef(new Map())


  const addOptimisticUpdate = useCallback((id, update) => {
    const timestamp = Date.now()
    const updateId = `${id}-${timestamp}`
    
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.set(updateId, { id, update, timestamp })
      return newMap
    })

    return updateId
  }, [])


  const removeOptimisticUpdate = useCallback((updateId) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(updateId)
      return newMap
    })
  }, [])


  const optimisticMoveTask = useCallback(async (
    taskId, 
    fromListId, 
    toListId, 
    currentTasks, 
    setTasks,
    onSuccess,
    onError
  ) => {

    const originalTasks = JSON.parse(JSON.stringify(currentTasks))
    rollbackRef.current.set(taskId, originalTasks)


    const fromTasks = currentTasks[fromListId] || []
    const toTasks = currentTasks[toListId] || []
    
    const taskToMove = fromTasks.find(task => task.id === taskId)
    if (!taskToMove) return


    const newFromTasks = fromTasks.filter(task => task.id !== taskId)
    const newToTasks = [...toTasks, { ...taskToMove, listId: toListId }]
    
    const optimisticTasks = {
      ...currentTasks,
      [fromListId]: newFromTasks,
      [toListId]: newToTasks
    }
    
    setTasks(optimisticTasks)
    

    const updateId = addOptimisticUpdate(taskId, { 
      type: 'move', 
      from: fromListId, 
      to: toListId,
      status: 'pending'
    })

    try {

      await taskService.moveTask(taskId, toListId)
      

      const taskIds = newToTasks.map(task => task.id)
      await taskService.reorderTasks(toListId, taskIds)
      

      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete(taskId)
      
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Failed to move task:', error)
      

      setTasks(originalTasks)
      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete(taskId)
      
      if (onError) onError(error)
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate])


  const optimisticReorderTasks = useCallback(async (
    listId,
    newTaskOrder,
    currentTasks,
    setTasks,
    onSuccess,
    onError
  ) => {

    const originalTasks = currentTasks[listId] || []
    rollbackRef.current.set(`reorder-${listId}`, originalTasks)


    const reorderedTasks = newTaskOrder.map(id => 
      originalTasks.find(task => task.id === id)
    ).filter(Boolean)

    setTasks(prev => ({
      ...prev,
      [listId]: reorderedTasks
    }))


    const updateId = addOptimisticUpdate(`reorder-${listId}`, { 
      type: 'reorder', 
      listId,
      status: 'pending'
    })

    try {

      await taskService.reorderTasks(listId, newTaskOrder)
      

      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete(`reorder-${listId}`)
      
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
      

      setTasks(prev => ({
        ...prev,
        [listId]: originalTasks
      }))
      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete(`reorder-${listId}`)
      
      if (onError) onError(error)
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate])


  const optimisticReorderColumns = useCallback(async (
    newColumnOrder,
    currentLists,
    setLists,
    onSuccess,
    onError
  ) => {

    const originalLists = [...currentLists]
    rollbackRef.current.set('reorder-columns', originalLists)


    setLists(newColumnOrder)


    const updateId = addOptimisticUpdate('reorder-columns', { 
      type: 'reorder-columns', 
      status: 'pending'
    })

    try {

      const listIds = newColumnOrder.map(list => list.id)


      console.log('Column reorder (optimistic):', listIds)
      

      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete('reorder-columns')
      
      if (onSuccess) onSuccess()
      
    } catch (error) {
      console.error('Failed to reorder columns:', error)
      

      setLists(originalLists)
      removeOptimisticUpdate(updateId)
      rollbackRef.current.delete('reorder-columns')
      
      if (onError) onError(error)
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate])


  const getOptimisticStatus = useCallback((id) => {
    for (const [updateId, update] of optimisticUpdates) {
      if (update.id === id || update.id === `reorder-${id}`) {
        return update.update.status
      }
    }
    return null
  }, [optimisticUpdates])


  const hasPendingUpdate = useCallback((id) => {
    return getOptimisticStatus(id) === 'pending'
  }, [getOptimisticStatus])

  return {
    optimisticMoveTask,
    optimisticReorderTasks,
    optimisticReorderColumns,
    getOptimisticStatus,
    hasPendingUpdate,
    optimisticUpdates
  }
}
