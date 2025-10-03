import React, { useState } from 'react'
import { useToast } from '../contexts/ToastContext'
import { taskService } from '../services/taskService'
import { Button } from './ui/Button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/Dialog'
import { Plus, Calendar, Tag } from 'lucide-react'

const AddCardModal = ({ isOpen, onClose, listId, listName, onCardCreated }) => {
  const { showSuccess, showError } = useToast()
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCard = async () => {
    if (!taskName.trim()) {
      showError('Task name is required', 'Please enter a task name')
      return
    }

    if (taskName.length < 2 || taskName.length > 100) {
      showError('Invalid task name', 'Task name must be between 2 and 100 characters')
      return
    }

    setIsCreating(true)
    try {
      const taskData = {
        name: taskName.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      }

      const response = await taskService.createTask(listId, taskData)
      if (response.success) {
        showSuccess('Card Created', `"${taskName}" has been created successfully`)
        setTaskName('')
        setDescription('')
        setDueDate('')
        onClose()
        if (onCardCreated) {
          onCardCreated(response.data)
        }
      } else {
        showError('Failed to create card', response.message)
      }
    } catch (error) {
      console.error('Error creating card:', error)
      showError('Failed to create card', 'Please try again later')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setTaskName('')
    setDescription('')
    setDueDate('')
    setIsCreating(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCreating && taskName.trim()) {
      handleCreateCard()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white/10 border-white/20 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Card to {listName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new task card in this column
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Task Name *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter task name..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
              disabled={isCreating}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              {taskName.length}/100 characters
            </p>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all resize-none"
              disabled={isCreating}
            />
          </div>

          {/* Due Date Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <Button
            onClick={handleClose}
            disabled={isCreating}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCard}
            disabled={isCreating || !taskName.trim()}
            className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Card
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddCardModal
