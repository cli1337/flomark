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
  Loader2,
  Upload,
  Tag,
  AlertTriangle,
  Pencil
} from 'lucide-react'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { commentService } from '../services/commentService'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import useMobileDetection from '../hooks/useMobileDetection'
import { useSocketEvent } from '../hooks/useSocket'

const TaskModal = ({ task, isOpen, onClose, onUpdate, labelsUpdated, projectId }) => {
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const isMobile = useMobileDetection()
  
  // Helper function to ensure labels is always an array
  const parseLabels = (labels) => {
    if (!labels) return []
    if (Array.isArray(labels)) return labels
    if (typeof labels === 'string') {
      try {
        return JSON.parse(labels)
      } catch (e) {
        return []
      }
    }
    return []
  }
  
  // Helper function to ensure task data has parsed labels
  const normalizeTaskData = (taskData) => {
    if (!taskData) return taskData
    return {
      ...taskData,
      labels: parseLabels(taskData.labels)
    }
  }
  
  const [taskData, setTaskData] = useState(normalizeTaskData(task))
  const [canManageMembers, setCanManageMembers] = useState(false)
  const [newSubTask, setNewSubTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([])
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subTaskLoading, setSubTaskLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [tempName, setTempName] = useState(task?.name || '')
  const [tempDescription, setTempDescription] = useState(task?.description || '')
  

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [showLabelsModal, setShowLabelsModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [availableMembers, setAvailableMembers] = useState([])
  const [availableLabels, setAvailableLabels] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [dueDate, setDueDate] = useState(task?.dueDate || '')
  const [dueTime, setDueTime] = useState('')
  const [selectedLabels, setSelectedLabels] = useState(parseLabels(task?.labels))

  useEffect(() => {
    if (task) {
      const normalized = normalizeTaskData(task)
      setTaskData(normalized)
      setTempName(task.name || '')
      setTempDescription(task.description || '')
      setSelectedLabels(parseLabels(task.labels))
      setDueDate(task.dueDate || '')
      if (task.dueDate) {
        const date = new Date(task.dueDate)
        setDueTime(date.toTimeString().slice(0, 5))
      }
    }
  }, [task])


  useEffect(() => {
    if (isOpen && task) {
      loadAvailableMembers()
      loadAvailableLabels()
      loadComments()
    }
  }, [isOpen, task])

  // Socket event listener for real-time comment updates
  useSocketEvent('comment-updated', (data) => {
    if (!task || !data || data.payload?.taskId !== task.id) return
    
    switch (data.type) {
      case 'comment-added':
        setComments(prev => [...prev, data.payload.comment])
        break
      case 'comment-updated':
        setComments(prev => prev.map(c => 
          c.id === data.payload.comment.id ? data.payload.comment : c
        ))
        break
      case 'comment-deleted':
        setComments(prev => prev.filter(c => c.id !== data.payload.commentId))
        break
      default:
        break
    }
  }, [task?.id])


  useEffect(() => {
    if (isOpen && task && labelsUpdated > 0) {
      loadAvailableLabels()
    }
  }, [labelsUpdated, isOpen, task])

  const handleUpdateTask = async (updates) => {
    try {
      const response = await taskService.updateTask(taskData.id, updates)
      if (response.success) {
        const normalized = normalizeTaskData(response.data)
        setTaskData(normalized)
        onUpdate?.(normalized)
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
        const updatedTaskData = {
          ...taskData,
          subTasks: [...(taskData.subTasks || []), response.data]
        }
        setTaskData(updatedTaskData)
        setNewSubTask('')
        showSuccess('Subtask Added', 'Subtask has been added successfully')
        

        onUpdate?.(updatedTaskData)
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
        const updatedSubTasks = taskData.subTasks?.map(sub => 
          sub.id === subTaskId ? { ...sub, isCompleted } : sub
        ) || []
        
        const updatedTaskData = {
          ...taskData,
          subTasks: updatedSubTasks
        }
        
        setTaskData(updatedTaskData)
        

        const newCompletedCount = updatedSubTasks.filter(sub => sub.isCompleted).length
        const newTotalCount = updatedSubTasks.length
        const newProgressPercentage = newTotalCount > 0 ? Math.round((newCompletedCount / newTotalCount) * 100) : 0
        


        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Update Subtask', 'Please try again later')
    }
  }

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      const response = await taskService.deleteSubTask(subTaskId)
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          subTasks: taskData.subTasks?.filter(sub => sub.id !== subTaskId) || []
        }
        setTaskData(updatedTaskData)
        showSuccess('Subtask Deleted', 'Subtask has been deleted')
        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Delete Subtask', 'Please try again later')
    }
  }

  const loadComments = async () => {
    if (!task?.id) return
    
    // If comments are already in task data, use them
    if (task.comments && Array.isArray(task.comments)) {
      setComments(task.comments)
      return
    }
    
    // Otherwise fetch from API
    try {
      const response = await commentService.getCommentsByTask(task.id)
      if (response.success) {
        setComments(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setCommentLoading(true)
    try {
      const response = await commentService.createComment(task.id, newComment.trim())
      if (response.success) {
        setComments(prev => [...prev, response.data])
        setNewComment('')
        showSuccess('Comment Added', 'Comment has been added successfully')
      }
    } catch (error) {
      showError('Failed to Add Comment', 'Please try again later')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await commentService.deleteComment(commentId)
      if (response.success) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        showSuccess('Comment Deleted', 'Comment has been deleted')
      }
    } catch (error) {
      showError('Failed to Delete Comment', 'Please try again later')
    }
  }


  const loadAvailableMembers = async () => {
    try {
      // Check if taskData exists before accessing its properties
      if (!taskData) return

      // Use projectId from props or fallback to taskData.list.projectId
      const taskProjectId = projectId || taskData.list?.projectId
      if (taskProjectId) {
        const response = await projectService.getMembersByProject(taskProjectId)
        if (response.success) {
          const assignedMemberIds = taskData.members?.map(m => m.userId) || []
          const available = response.data.filter(m => !assignedMemberIds.includes(m.userId))
          setAvailableMembers(available)
          

          const currentUserMember = response.data.find(member => 
            member.userId === user?.id || member.id === user?.id
          )
          const isOwner = currentUserMember?.role === 'OWNER' || currentUserMember?.isOwner
          const isAdmin = currentUserMember?.role === 'ADMIN'
          setCanManageMembers(isOwner || isAdmin)
        }
      }
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const loadAvailableLabels = async () => {
    try {
      // Check if taskData exists before accessing its properties
      if (!taskData) return

      // Use projectId from props or fallback to taskData.list.projectId
      const taskProjectId = projectId || taskData.list?.projectId
      console.log('🔍 TaskModal - Attempting to load labels with projectId:', taskProjectId)
      if (taskProjectId) {
        const response = await projectService.getLabelsByProject(taskProjectId)
        if (response.success) {
          console.log('📋 Loaded labels:', response.data)
          setAvailableLabels(response.data)
        } else {
          console.warn('⚠️ Failed to load labels:', response)
        }
      } else {
        console.warn('⚠️ No projectId found in taskData:', taskData)
      }
    } catch (error) {
      console.error('Error loading labels:', error)
    }
  }

  const handleDeleteTask = async () => {
    try {
      const response = await taskService.deleteTask(taskData.id)
      if (response.success) {
        showSuccess('Task Deleted', 'Task has been deleted successfully')
        onClose()
        onUpdate?.()
      }
    } catch (error) {
      showError('Failed to Delete Task', 'Please try again later')
    }
  }

  const handleAssignMember = async (memberId) => {
    try {
      const response = await taskService.assignMember(taskData.id, memberId)
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          members: [...(taskData.members || []), response.data]
        }
        setTaskData(updatedTaskData)
        setAvailableMembers(prev => prev.filter(m => m.userId !== memberId))
        showSuccess('Member Assigned', 'Member has been assigned to task')
        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Assign Member', 'Please try again later')
    }
  }

  const handleRemoveMember = async (memberId) => {

    if (memberId === user?.id) {
      showError('Cannot Remove Yourself', 'You cannot remove yourself from this task.')
      return
    }

    try {
      const response = await taskService.removeMember(taskData.id, memberId)
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          members: taskData.members?.filter(m => m.userId !== memberId) || []
        }
        setTaskData(updatedTaskData)
        showSuccess('Member Removed', 'Member has been removed from task')
        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Remove Member', 'Please try again later')
    }
  }

  const handleUpdateDueDate = async () => {
    try {
      let dueDateTime = null
      if (dueDate) {
        if (dueTime) {
          dueDateTime = new Date(`${dueDate}T${dueTime}`)
        } else {
          dueDateTime = new Date(dueDate)
        }
      }
      
      await handleUpdateTask({ dueDate: dueDateTime })
      setShowDueDatePicker(false)
    } catch (error) {
      showError('Failed to Update Due Date', 'Please try again later')
    }
  }

  const handleUpdateLabels = async () => {
    try {
      const response = await taskService.updateTask(taskData.id, { labels: selectedLabels })
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          labels: selectedLabels
        }
        setTaskData(updatedTaskData)
        setShowLabelsModal(false)
        

        await loadAvailableLabels()
        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Update Labels', 'Please try again later')
    }
  }

  const handleRemoveLabel = async (labelId) => {
    try {
      const response = await taskService.removeLabel(taskData.id, labelId)
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          labels: taskData.labels?.filter(label => label.id !== labelId) || []
        }
        setTaskData(updatedTaskData)
        setSelectedLabels(prev => prev.filter(label => label.id !== labelId))
        showSuccess('Label Removed', 'Label has been removed from task')
        

        onUpdate?.(updatedTaskData)
      }
    } catch (error) {
      showError('Failed to Remove Label', 'Please try again later')
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return
    
    try {
      setLoading(true)
      
      // Upload each file
      for (const file of selectedFiles) {
        await taskService.uploadAttachment(taskData.id, file)
      }

      // Refresh task data to get updated attachments
      const response = await taskService.getTaskById(taskData.id)
      if (response.success) {
        const normalized = normalizeTaskData(response.data)
        setTaskData(normalized)
        onUpdate?.(normalized)
      }

      showSuccess('Files Uploaded', `${selectedFiles.length} file(s) uploaded successfully`)
      setShowFileUpload(false)
      setSelectedFiles([])
    } catch (error) {
      console.error('Upload error:', error)
      showError('Failed to Upload Files', error.response?.data?.message || 'Please try again later')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await taskService.deleteAttachment(attachmentId)
      if (response.success) {
        const updatedTaskData = {
          ...taskData,
          attachments: taskData.attachments?.filter(att => att.id !== attachmentId) || []
        }
        setTaskData(updatedTaskData)
        onUpdate?.(updatedTaskData)
        showSuccess('Attachment Deleted', 'Attachment has been removed')
      }
    } catch (error) {
      showError('Failed to Delete Attachment', 'Please try again later')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const completedSubTasks = taskData?.subTasks?.filter(sub => sub.isCompleted).length || 0
  const totalSubTasks = taskData?.subTasks?.length || 0
  const progressPercentage = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0

  if (!isOpen || !taskData) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`bg-[#18191b] border border-white/10 rounded-lg w-full max-h-[95vh] overflow-hidden ${
        isMobile ? 'max-w-full mx-2' : 'max-w-4xl'
      }`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            {isEditingName ? (
              <div className="flex">
                <div className="flex items-center gap-5">
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
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                  <h1 
                    className="text-white text-xl font-semibold cursor-pointer hover:bg-white/5 p-2 -m-2 rounded"
                    onClick={() => setIsEditingName(true)}
                  >
                    {taskData.name}
                  </h1>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

        <div className={`flex ${isMobile ? 'flex-col' : ''}`}>
          <div className={`flex-1 space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Members</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {taskData.members?.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1 bg-gray-700 rounded-full px-2 py-1"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium">
                      {member.user?.profileImage ? (
                        <img 
                          src={`/api/storage/photos/${member.user.profileImage}`} 
                          alt={member.user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                          {member.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="text-white text-xs">{member.user?.name}</span>
                    {canManageMembers && member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-0.5 hover:bg-red-500/20 rounded transition-colors"
                        title="Remove member from task"
                      >
                        <X className="h-3 w-3 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setShowMembersModal(true)}
                  className="w-8 h-8 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
                >
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
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">Labels</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedLabels?.map((label, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-700 rounded-full px-2 py-1"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: label.color || '#3b82f6' }}
                    />
                    <span className="text-white text-xs">{label.name}</span>
                    <button
                      onClick={() => handleRemoveLabel(label.id)}
                      className="p-0.5 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setShowLabelsModal(true)}
                  className="w-8 h-8 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">
                  Subtasks ({completedSubTasks} of {totalSubTasks})
                </span>
              </div>
              
              {totalSubTasks > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2 bg-gradient-to-br from-white/[0.03] to-white/[0.08] border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="space-y-2.5">
                  {taskData.subTasks?.map(subTask => (
                    <div 
                      key={subTask.id} 
                      className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors rounded-md p-2.5 border border-white/5"
                    >
                      <button
                        onClick={() => handleToggleSubTask(subTask.id, !subTask.isCompleted)}
                        className={`rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          isMobile ? 'w-6 h-6' : 'w-5 h-5'
                        } ${
                          subTask.isCompleted 
                            ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/50' 
                            : 'border-gray-400 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        {subTask.isCompleted && <Check className={`text-white ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />}
                      </button>
                      <span className={`text-white text-sm flex-1 ${subTask.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {subTask.name}
                      </span>
                      <button
                        onClick={() => handleDeleteSubTask(subTask.id)}
                        className={`hover:bg-red-500/20 rounded transition-colors ${
                          isMobile ? 'p-2' : 'p-1'
                        }`}
                        title="Delete subtask"
                      >
                        <Trash2 className={`text-red-400 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <button className={`border-2 border-dashed border-gray-500 rounded flex items-center justify-center transition-colors hover:border-gray-400 ${
                    isMobile ? 'w-6 h-6' : 'w-5 h-5'
                  }`}>
                    <Plus className={`text-gray-400 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                  </button>
                  <input
                    type="text"
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    placeholder="Add a subtask..."
                    className={`bg-white/5 text-white placeholder-gray-500 border border-white/10 rounded px-3 outline-none flex-1 focus:border-white/30 transition-colors ${
                      isMobile ? 'text-base py-2' : 'text-sm py-1.5'
                    }`}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
                  />
                  {newSubTask.trim() && (
                    <button
                      onClick={handleAddSubTask}
                      disabled={subTaskLoading}
                      className={`hover:bg-green-500/20 rounded transition-colors disabled:opacity-50 bg-green-500/10 ${
                        isMobile ? 'p-2' : 'p-1.5'
                      }`}
                    >
                      {subTaskLoading ? (
                        <Loader2 className={`text-gray-400 animate-spin ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                      ) : (
                        <Check className={`text-green-400 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
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
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium">
                    {user?.profileImage ? (
                      <img 
                        src={`/api/storage/photos/${user.profileImage}`} 
                        alt={user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className={`w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none ${
                        isMobile ? 'p-4 text-base' : 'p-3'
                      }`}
                      rows={isMobile ? 4 : 3}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || commentLoading}
                        className={`bg-white hover:bg-gray-100 text-black disabled:opacity-50 ${
                          isMobile ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
                        }`}
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

                {/* Comments List */}
                {comments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {comment.user?.profileImage ? (
                            <img 
                              src={`/api/storage/photos/${comment.user.profileImage}`} 
                              alt={comment.user?.name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                              {comment.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-white">
                                {comment.user?.name || 'Unknown User'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {comment.userId === user?.id && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            {taskData.attachments && taskData.attachments.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm font-medium">
                    Attachments ({taskData.attachments.length})
                  </span>
                </div>
                
                <div className="space-y-2">
                  {taskData.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white text-sm hover:text-blue-400 transition-colors truncate block"
                          >
                            {attachment.originalName}
                          </a>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                        title="Delete attachment"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`space-y-4 ${isMobile ? 'p-4 border-t border-white/10' : 'w-64 p-6 border-l border-white/10'}`}>
            <div className="space-y-3">
              <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Add to card</span>
              
              <Button 
                onClick={() => setShowMembersModal(true)}
                className={`w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10 ${
                  isMobile ? 'py-3 text-base' : ''
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Members
              </Button>
              
              <Button 
                onClick={() => setShowDueDatePicker(true)}
                className={`w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10 ${
                  isMobile ? 'py-3 text-base' : ''
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Due Date
              </Button>
              
              <Button 
                onClick={() => setShowFileUpload(true)}
                className={`w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10 ${
                  isMobile ? 'py-3 text-base' : ''
                }`}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attachment
              </Button>
              
              <Button 
                onClick={() => setShowLabelsModal(true)}
                className={`w-full justify-start bg-transparent hover:bg-white/10 text-gray-300 border border-white/10 ${
                  isMobile ? 'py-3 text-base' : ''
                }`}
              >
                <Tag className="h-4 w-4 mr-2" />
                Labels
              </Button>
            </div>

            <div className="space-y-3">
              <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Actions</span>
              
              <Button 
                onClick={() => setShowDeleteConfirm(true)}
                className={`w-full justify-start bg-transparent hover:bg-red-500/20 text-red-400 border border-red-500/30 ${
                  isMobile ? 'py-3 text-base' : ''
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold">Delete Task</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{taskData.name}"? This will permanently remove the task and all its subtasks.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTask}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Upload Files</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div 
              className="border border-dashed border-white/20 rounded-lg p-6 text-center mb-4"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-1">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-xs">Images, PDF, Word, Excel, PowerPoint, text files (max 10MB)</p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-gray-400 text-sm font-medium">Selected Files:</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
                    <span className="text-white text-sm">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowFileUpload(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || loading}
                className="bg-white hover:bg-gray-100 text-black px-4 py-2 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Due Date Picker Modal */}
      {showDueDatePicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Set Due Date</h3>
              <button
                onClick={() => setShowDueDatePicker(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Time (Optional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => setShowDueDatePicker(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDueDate}
                className="bg-white hover:bg-gray-100 text-black px-4 py-2"
              >
                Set Due Date
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Labels Modal */}
      {showLabelsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Select Labels</h3>
              <button
                onClick={() => setShowLabelsModal(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {availableLabels.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-2">No labels available</p>
                  <p className="text-gray-500 text-xs">Create labels in the project settings first</p>
                </div>
              ) : (
                availableLabels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                    onClick={() => {
                      const isSelected = selectedLabels.some(l => l.id === label.id)
                      if (isSelected) {
                        setSelectedLabels(prev => prev.filter(l => l.id !== label.id))
                      } else {
                        setSelectedLabels(prev => [...prev, label])
                      }
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-white text-sm flex-1">{label.name}</span>
                    {selectedLabels.some(l => l.id === label.id) && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowLabelsModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLabels}
                className="bg-white hover:bg-gray-100 text-black px-4 py-2"
              >
                Apply Labels
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Assign Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {availableMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                  onClick={() => handleAssignMember(member.userId)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium">
                    {member.user?.profileImage ? (
                      <img 
                        src={`/api/storage/photos/${member.user.profileImage}`} 
                        alt={member.user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                        {member.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm flex-1">{member.user?.name}</span>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              {availableMembers.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No available members</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowMembersModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskModal
