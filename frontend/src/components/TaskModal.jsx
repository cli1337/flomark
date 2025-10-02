import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Paperclip, 
  CheckSquare, 
  MessageSquare, 
  Share2, 
  Copy, 
  Trash2,
  Plus,
  Check,
  X as XIcon,
  Loader2
} from 'lucide-react'
import { taskService } from '../services/taskService'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const TaskModal = ({ task, isOpen, onClose, onUpdate }) => {
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [taskData, setTaskData] = useState(task)
  const [newSubTask, setNewSubTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subTaskLoading, setSubTaskLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [tempName, setTempName] = useState(task?.name || '')
  const [tempDescription, setTempDescription] = useState(task?.description || '')

  useEffect(() => {
    if (task) {
      setTaskData(task)
      setTempName(task.name || '')
      setTempDescription(task.description || '')
    }
  }, [task])

  const handleUpdateTask = async (updates) => {
    try {
      const response = await taskService.updateTask(taskData.id, updates)
      if (response.success) {
        setTaskData(response.data)
        onUpdate?.(response.data)
        showSuccess('Task Updated', 'Task has been updated successfully')
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update task')
    }
  }

  const handleNameSave = async () => {
    if (tempName.trim() && tempName !== taskData.name) {
      await handleUpdateTask({ name: tempName })
    }
    setIsEditingName(false)
  }

  const handleDescriptionSave = async () => {
    if (tempDescription !== taskData.description) {
      await handleUpdateTask({ description: tempDescription })
    }
    setIsEditingDescription(false)
  }

  const handleAddSubTask = async () => {
    if (!newSubTask.trim()) return
    
    setSubTaskLoading(true)
    try {
      const response = await taskService.addSubTask(taskData.id, newSubTask)
      if (response.success) {
        setTaskData(prev => ({
          ...prev,
          subTasks: [...(prev.subTasks || []), response.data]
        }))
        setNewSubTask('')
        showSuccess('Subtask Added', 'Subtask has been added successfully')
      }
    } catch (error) {
      showError('Failed to Add Subtask', 'Please try again later')
    } finally {
      setSubTaskLoading(false)
    }
  }

  const handleToggleSubTask = async (subTaskId, isCompleted) => {
    try {
      const response = await taskService.updateSubTask(subTaskId, { isCompleted })
      if (response.success) {
        setTaskData(prev => ({
          ...prev,
          subTasks: prev.subTasks?.map(sub => 
            sub.id === subTaskId ? { ...sub, isCompleted } : sub
          )
        }))
      }
    } catch (error) {
      showError('Failed to Update Subtask', 'Please try again later')
    }
  }

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      const response = await taskService.deleteSubTask(subTaskId)
      if (response.success) {
        setTaskData(prev => ({
          ...prev,
          subTasks: prev.subTasks?.filter(sub => sub.id !== subTaskId)
        }))
        showSuccess('Subtask Deleted', 'Subtask has been deleted')
      }
    } catch (error) {
      showError('Failed to Delete Subtask', 'Please try again later')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setCommentLoading(true)
    try {
      setNewComment('')
      showSuccess('Comment Added', 'Comment has been added successfully')
    } catch (error) {
      showError('Failed to Add Comment', 'Please try again later')
    } finally {
      setCommentLoading(false)
    }
  }

  const completedSubTasks = taskData?.subTasks?.filter(sub => sub.isCompleted).length || 0
  const totalSubTasks = taskData?.subTasks?.length || 0

  if (!isOpen || !taskData) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#18191b] border border-white/10 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <textarea
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-transparent text-white text-xl font-semibold resize-none border-none outline-none"
                  rows={1}
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Check className="h-4 w-4 text-green-400" />
                </button>
                <button
                  onClick={() => {
                    setTempName(taskData.name)
                    setIsEditingName(false)
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <XIcon className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ) : (
              <h1 
                className="text-white text-xl font-semibold cursor-pointer hover:bg-white/5 p-2 -m-2 rounded"
                onClick={() => setIsEditingName(true)}
              >
                {taskData.name}
              </h1>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex">
          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Members</span>
              </div>
              <div className="flex items-center gap-2">
                {taskData.members?.map(member => (
                  <div
                    key={member.id}
                    className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  >
                    {member.user?.name?.charAt(0) || 'U'}
                  </div>
                ))}
                <button className="w-8 h-8 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Description</span>
              </div>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDescriptionSave}
                      className="bg-white hover:bg-gray-100 text-black px-3 py-1 text-sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setTempDescription(taskData.description)
                        setIsEditingDescription(false)
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-white/5 border border-white/10 rounded-lg p-3 min-h-[60px] cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {taskData.description ? (
                    <p className="text-white text-sm whitespace-pre-wrap">{taskData.description}</p>
                  ) : (
                    <p className="text-gray-400 text-sm">Add a description...</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">
                  Subtasks ({completedSubTasks} of {totalSubTasks})
                </span>
              </div>
              
              <div className="space-y-2">
                {taskData.subTasks?.map(subTask => (
                  <div key={subTask.id} className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSubTask(subTask.id, !subTask.isCompleted)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        subTask.isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {subTask.isCompleted && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <span className={`text-white text-sm flex-1 ${subTask.isCompleted ? 'line-through text-gray-400' : ''}`}>
                      {subTask.name}
                    </span>
                    <button
                      onClick={() => handleDeleteSubTask(subTask.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <button className="w-5 h-5 border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
                    <Plus className="h-3 w-3 text-gray-400" />
                  </button>
                  <input
                    type="text"
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    placeholder="Add a subtask..."
                    className="bg-transparent text-white text-sm placeholder-gray-400 border-none outline-none flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                  />
                  {newSubTask.trim() && (
                    <button
                      onClick={handleAddSubTask}
                      disabled={subTaskLoading}
                      className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                    >
                      {subTaskLoading ? (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Comments</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || commentLoading}
                        className="bg-white hover:bg-gray-100 text-black px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {commentLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Commenting...
                          </div>
                        ) : (
                          'Comment'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-64 p-6 border-l border-white/10 space-y-4">
            <div className="space-y-3">
              <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Add to card</span>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <User className="h-4 w-4 mr-2" />
                Members
              </Button>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <Calendar className="h-4 w-4 mr-2" />
                Due Date
              </Button>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <Clock className="h-4 w-4 mr-2" />
                Time Tracking
              </Button>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachment
              </Button>
            </div>

            <div className="space-y-3">
              <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Actions</span>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <Share2 className="h-4 w-4 mr-2" />
                Move
              </Button>
              
              <Button className="w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              
              <Button className="w-full justify-start bg-transparent hover:bg-red-500/20 text-red-400 border border-red-500/30">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskModal
