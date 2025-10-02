import { useState, useCallback } from 'react'

export const useDragAndDrop = (initialItems, onReorder) => {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback((e, item) => {
    setDraggedItem(item)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    
    // Add visual feedback
    e.target.style.opacity = '0.5'
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
  }, [])

  const handleDragEnd = useCallback((e) => {
    // Reset visual feedback
    e.target.style.opacity = '1'
    document.body.style.userSelect = ''
    
    setDraggedItem(null)
    setDragOverItem(null)
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e, item) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedItem && draggedItem.id !== item.id) {
      setDragOverItem(item)
    }
  }, [draggedItem])

  const handleDragLeave = useCallback((e) => {
    // Only clear dragOverItem if we're leaving the item entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverItem(null)
    }
  }, [])

  const handleDrop = useCallback((e, targetItem) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDragOverItem(null)
      return
    }

    // Find current positions
    const draggedIndex = initialItems.findIndex(item => item.id === draggedItem.id)
    const targetIndex = initialItems.findIndex(item => item.id === targetItem.id)
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDragOverItem(null)
      return
    }

    // Create new order
    const newItems = [...initialItems]
    const [draggedElement] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedElement)
    
    // Call the reorder callback
    if (onReorder) {
      onReorder(newItems)
    }
    
    setDragOverItem(null)
  }, [draggedItem, initialItems, onReorder])

  const getDragProps = useCallback((item) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, item),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, item),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, item),
    className: `
      ${isDragging && draggedItem?.id === item.id ? 'opacity-50 scale-95' : ''}
      ${dragOverItem?.id === item.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      transition-all duration-200 ease-in-out
      ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    `.trim()
  }), [isDragging, draggedItem, dragOverItem, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop])

  return {
    draggedItem,
    dragOverItem,
    isDragging,
    getDragProps
  }
}

export default useDragAndDrop
