import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import usePageTitle from '../../hooks/usePageTitle'
import useMobileDetection from '../../hooks/useMobileDetection'
import { useProjectSocket, useSocketEvent } from '../../hooks/useSocket'
import useWebSocketEvents from '../../hooks/useWebSocketEvents'
import { useOptimisticUpdates } from '../../hooks/useOptimisticUpdates'
import { useTaskMoveAnimation } from '../../hooks/useTaskMoveAnimation'
import TaskMoveAnimation from '../../components/TaskMoveAnimation'
import DisconnectionOverlay from '../../components/DisconnectionOverlay'
import { projectService } from '../../services/projectService'
import { listService } from '../../services/listService'
import { taskService } from '../../services/taskService'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import LoadingState from '../../components/ui/LoadingState'
import TaskModal from '../../components/TaskModal'
import CreateColumnModal from '../../components/CreateColumnModal'
import AddCardModal from '../../components/AddCardModal'
import ProjectBoardHeader from '../../components/ProjectBoardHeader'
import Layout from '../../components/Layout'
import { 
  Plus, 
  List,
  Edit2,
  Check,
  X,
  Calendar,
  Users,
  GripVertical,
  Search
} from 'lucide-react'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  const { isConnected, isReconnecting } = useWebSocket()
  const isMobile = useMobileDetection()
  

  const optimisticUpdates = useOptimisticUpdates()
  

  const taskMoveAnimation = useTaskMoveAnimation()
  
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [selectedListForCard, setSelectedListForCard] = useState(null)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [labelsUpdated, setLabelsUpdated] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTasks, setFilteredTasks] = useState({})
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editingColumnName, setEditingColumnName] = useState('')
  
  const [project, setProject] = useState(null)
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState({})
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingCards, setProcessingCards] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  
  usePageTitle(project ? project.name : 'Project')

  const { broadcastProjectUpdate, broadcastTaskUpdate } = useProjectSocket(id)
  





  const handleProjectUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {


      if (data.type && ['task-moved', 'task-updated', 'task-created', 'task-deleted'].includes(data.type)) {
        return // Skip task-related project updates
      }
      
      if (data.payload?.project) {
        setProject(data.payload.project)
        showSuccess('Project Updated', `${data.userName} updated the project`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleProjectImageUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.project) {
        setProject(data.payload.project)
        showSuccess('Project Image Updated', `${data.userName} updated the project image`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleListCreated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.list) {
        setLists(prev => [...prev, data.payload.list])
        showSuccess('New List', `${data.userName} created a new list`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleListUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.list) {
        setLists(prev => prev.map(list => 
          list.id === data.payload.list.id ? data.payload.list : list
        ))
        showSuccess('List Updated', `${data.userName} updated a list`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleListsReordered = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.lists) {
        setLists(data.payload.lists)
        showSuccess('Lists Reordered', `${data.userName} reordered the lists`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleTaskCreated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.task) {
        setTasks(prev => ({
          ...prev,
          [data.payload.task.listId]: [
            ...(prev[data.payload.task.listId] || []),
            data.payload.task
          ]
        }))
        showSuccess('New Task', `${data.userName} created a new task`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleTaskUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.task) {
        setTasks(prev => {
          const newTasks = { ...prev }
          Object.keys(newTasks).forEach(listId => {
            newTasks[listId] = newTasks[listId].map(task => 
              task.id === data.payload.task.id ? data.payload.task : task
            )
          })
          return newTasks
        })
        showSuccess('Task Updated', `${data.userName} updated a task`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleTaskMoved = useCallback((data) => {
    console.log('🎯 handleTaskMoved called:', data)
    console.log('🎯 Current project ID:', id)
    console.log('🎯 Current user ID:', user?.id)
    console.log('🎯 Event user ID:', data.userId)
    
    if (data.projectId === id && data.userId !== user?.id) {
      console.log('🎯 Processing task move for other user')
      if (data.payload?.task) {
        console.log('🎯 Task data:', data.payload.task)
        console.log('🎯 From list:', data.payload.fromListId)
        console.log('🎯 To list:', data.payload.toListId)
        
        // Wait for next frame to ensure DOM is ready
        requestAnimationFrame(() => {
          setTimeout(() => {
            console.log('🎯 Starting animation for remote user')
            taskMoveAnimation.startTaskMoveAnimation(
              data.payload.task.id,
              data.payload.task,
              data.payload.fromListId,
              data.payload.toListId
            )
          }, 50)
        })

        // Update state after animation completes (800ms animation + buffer)
        setTimeout(() => {
          setTasks(prev => {
            console.log('🎯 Updating tasks state after animation')
            const newTasks = { ...prev }

            // Remove from source list
            if (data.payload.fromListId) {
              const sourceTasks = newTasks[data.payload.fromListId] || []
              newTasks[data.payload.fromListId] = sourceTasks
                .filter(task => task.id !== data.payload.task.id)
            }

            // Add to destination list
            if (data.payload.toListId) {
              const destTasks = newTasks[data.payload.toListId] || []
              newTasks[data.payload.toListId] = [
                ...destTasks,
                data.payload.task
              ]
            }
            
            return newTasks
          })
        }, 1200) // Animation duration (800ms) + exit (300ms) + buffer (100ms)
        
      } else {
        console.log('🎯 No task data in payload')
      }
    } else {
      console.log('🎯 Skipping task move - conditions not met')
    }
  }, [id, user?.id, taskMoveAnimation])

  const handleTaskDeleted = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.taskId) {
        setTasks(prev => {
          const newTasks = { ...prev }
          Object.keys(newTasks).forEach(listId => {
            newTasks[listId] = newTasks[listId].filter(task => task.id !== data.payload.taskId)
          })
          return newTasks
        })
        showSuccess('Task Deleted', `${data.userName} deleted a task`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleMemberJoined = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.project) {
        setProject(data.payload.project)
        setMembers(data.payload.project.members || [])
        showSuccess('New Member', `${data.userName} joined the project`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleMemberRemoved = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.member) {
        setMembers(prev => prev.filter(member => member.id !== data.payload.member.id))
        showSuccess('Member Removed', `${data.userName} removed a member`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleMemberRoleUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.member) {
        setMembers(prev => prev.map(member => 
          member.id === data.payload.member.id ? data.payload.member : member
        ))
        showSuccess('Member Role Updated', `${data.userName} updated a member's role`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleLabelCreated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.label) {
        setProject(prev => ({
          ...prev,
          labels: [...(prev.labels || []), data.payload.label]
        }))
        setLabelsUpdated(prev => prev + 1)
        showSuccess('New Label', `${data.userName} created a new label`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleLabelUpdated = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.label) {
        setProject(prev => ({
          ...prev,
          labels: (prev.labels || []).map(label => 
            label.id === data.payload.label.id ? data.payload.label : label
          )
        }))
        setLabelsUpdated(prev => prev + 1)
        showSuccess('Label Updated', `${data.userName} updated a label`)
      }
    }
  }, [id, user?.id, showSuccess])

  const handleLabelDeleted = useCallback((data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      if (data.payload?.labelId) {
        setProject(prev => ({
          ...prev,
          labels: (prev.labels || []).filter(label => label.id !== data.payload.labelId)
        }))
        setLabelsUpdated(prev => prev + 1)
        showSuccess('Label Deleted', `${data.userName} deleted a label`)
      }
    }
  }, [id, user?.id, showSuccess])


  useWebSocketEvents(id, {
    onProjectUpdated: handleProjectUpdated,
    onProjectImageUpdated: handleProjectImageUpdated,
    onListCreated: handleListCreated,
    onListUpdated: handleListUpdated,
    onListsReordered: handleListsReordered,
    onTaskCreated: handleTaskCreated,
    onTaskUpdated: handleTaskUpdated,
    onTaskMoved: handleTaskMoved,
    onTaskDeleted: handleTaskDeleted,
    onMemberJoined: handleMemberJoined,
    onMemberRemoved: handleMemberRemoved,
    onMemberRoleUpdated: handleMemberRoleUpdated,
    onLabelCreated: handleLabelCreated,
    onLabelUpdated: handleLabelUpdated,
    onLabelDeleted: handleLabelDeleted
  })

  useSocketEvent('user-joined', (data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      showInfo(`${data.userName} joined the project`)
    }
  }, [id, user?.id, showInfo])

  useSocketEvent('user-left', (data) => {
    if (data.projectId === id && data.userId !== user?.id) {
      showInfo(`${data.userName} left the project`)
    }
  }, [id, user?.id, showInfo])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 999999 : 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  const isDraggingColumn = activeId && lists.some(list => list.id === activeId)
  

  const isDraggingCard = activeId && Object.values(tasks).flat().some(task => task.id === activeId)

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Use the optimized endpoint that fetches everything in one request
      const response = await projectService.getProjectDataOptimized(id)
      
      if (response.success) {
        const { project, lists, tasks, members } = response.data
        
        setProject(project)
        setMembers(members || [])
        setLists(lists || [])
        setTasks(tasks || {})
      } else {
        showError('Project not found', 'The project you are looking for does not exist')
        navigate('/projects')
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
      showError('Failed to load project', 'Please try again later')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }, [id, showError, navigate])

  const handleColumnCreated = async (newColumn) => {
    await fetchProjectData()
  }


  const handleStartEditColumn = (column) => {
    setEditingColumnId(column.id)
    setEditingColumnName(column.name)
  }

  const handleSaveColumnName = async () => {
    if (!editingColumnName.trim()) {
      showError('Column name cannot be empty', 'Please enter a valid column name')
      return
    }

    try {
      const response = await listService.updateList(editingColumnId, { name: editingColumnName })
      
      if (response.success) {

        setLists(prev => prev.map(list => 
          list.id === editingColumnId 
            ? { ...list, name: editingColumnName }
            : list
        ))
        
        setEditingColumnId(null)
        setEditingColumnName('')
        showSuccess('Column updated', 'Column name has been updated successfully')
      } else {
        showError('Failed to update column', response.message)
      }
    } catch (error) {
      console.error('Error updating column name:', error)
      showError('Failed to update column', 'Please try again later')
    }
  }

  const handleCancelEditColumn = () => {
    setEditingColumnId(null)
    setEditingColumnName('')
  }

  const handleAddCard = (list) => {
    setSelectedListForCard(list)
    setShowAddCardModal(true)
  }

  const handleCardCreated = async (newCard) => {

    setTasks(prev => ({
      ...prev,
      [selectedListForCard.id]: [...(prev[selectedListForCard.id] || []), newCard]
    }))
    setShowAddCardModal(false)
    setSelectedListForCard(null)
  }


  const handleReorderColumns = useCallback(async (newLists) => {
    try {
      const response = await listService.reorderLists(id, newLists.map(list => list.id))
      
      if (response.success) {
        showSuccess('Columns reordered', 'Column order has been updated')
        
        // Broadcast to other users
        broadcastProjectUpdate({
          type: 'lists-reordered',
          payload: { lists: newLists }
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error reordering columns:', error)
      showError('Failed to reorder columns', 'Please try again later')

      await fetchProjectData()
    }
  }, [id, showSuccess, showError, fetchProjectData, broadcastProjectUpdate])

  const handleTaskClick = async (task) => {
    try {
      const response = await taskService.getTaskById(task.id)
      if (response.success) {
        setSelectedTask(response.data)
        setShowTaskModal(true)
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
      showError('Failed to load task', 'Please try again later')
    }
  }

  const handleLabelsUpdated = (labelId, labelData) => {

    setLabelsUpdated(prev => prev + 1)
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }


  const filterTasks = (tasks, query, labelFilters, memberFilters) => {
    if (!query && labelFilters.length === 0 && memberFilters.length === 0) {
      return tasks
    }

    return tasks.filter(task => {

      const matchesSearch = !query || 
        task.name.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))


      const matchesLabels = labelFilters.length === 0 || 
        labelFilters.some(labelId => 
          task.labels && task.labels.some(label => 
            typeof label === 'string' ? label === labelId : label.id === labelId
          )
        )


      const matchesMembers = memberFilters.length === 0 ||
        memberFilters.some(userId =>
          task.members && task.members.some(member => 
            member.userId === userId
          )
        )

      return matchesSearch && matchesLabels && matchesMembers
    })
  }


  useEffect(() => {
    const filtered = {}
    Object.keys(tasks).forEach(listId => {
      filtered[listId] = filterTasks(tasks[listId], searchQuery, selectedLabels, selectedMembers)
    })
    setFilteredTasks(filtered)
  }, [tasks, searchQuery, selectedLabels, selectedMembers])


  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])


  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over || active.id === over.id) {
      return
    }


    const activeList = lists.find(list => list.id === active.id)
    const overList = lists.find(list => list.id === over.id)
    
    if (activeList && overList) {
      const oldIndex = lists.findIndex(list => list.id === active.id)
      const newIndex = lists.findIndex(list => list.id === over.id)
      
      if (oldIndex === -1 || newIndex === -1) {
        return
      }

      const newLists = arrayMove(lists, oldIndex, newIndex)
      

      await optimisticUpdates.optimisticReorderColumns(
        newLists,
        lists,
        setLists,
        () => {
          console.log('✅ Column reordered successfully')
        },
        (error) => {
          console.error('❌ Failed to reorder columns:', error)
          showError('Failed to reorder column', 'Please try again')
        }
      )
      

      handleReorderColumns(newLists)
    } else {

      const activeTask = Object.values(tasks).flat().find(task => task.id === active.id)
      
      if (!activeTask) {
        return
      }
      
      const overDroppableId = over.id.toString().startsWith('droppable-') ? over.id : null
      const overTask = !overDroppableId ? Object.values(tasks).flat().find(task => task.id === over.id) : null
      
      const activeListId = Object.keys(tasks).find(listId => 
        tasks[listId].some(task => task.id === active.id)
      )
      
      if (activeListId) {
        if (overDroppableId) {

          const targetListId = overDroppableId.replace('droppable-', '')
          
          if (activeListId !== targetListId) {
            await optimisticUpdates.optimisticMoveTask(
              active.id,
              activeListId,
              targetListId,
              tasks,
              setTasks,
              () => {
                console.log('✅ Task moved to column successfully')
              },
              (error) => {
                console.error('❌ Failed to move task:', error)
                showError('Failed to move task', 'Please try again')
              }
            )
          }
        } else if (overTask) {

          const overListId = Object.keys(tasks).find(listId => 
            tasks[listId].some(task => task.id === over.id)
          )
          
          if (overListId && activeListId === overListId) {

            const listTasks = tasks[activeListId] || []
            const oldIndex = listTasks.findIndex(task => task.id === active.id)
            const newIndex = listTasks.findIndex(task => task.id === over.id)
            
            if (oldIndex !== -1 && newIndex !== -1) {
              const newTasks = arrayMove(listTasks, oldIndex, newIndex)
              const taskIds = newTasks.map(task => task.id)
              
              await optimisticUpdates.optimisticReorderTasks(
                activeListId,
                taskIds,
                tasks,
                setTasks,
                () => {
                  console.log('✅ Tasks reordered successfully')
                },
                (error) => {
                  console.error('❌ Failed to reorder tasks:', error)
                  showError('Failed to reorder tasks', 'Please try again')
                }
              )
            }
          } else if (overListId && activeListId !== overListId) {

            await optimisticUpdates.optimisticMoveTask(
              active.id,
              activeListId,
              overListId,
              tasks,
              setTasks,
              () => {
                console.log('✅ Task moved between columns successfully')
              },
              (error) => {
                console.error('❌ Failed to move task between columns:', error)
                showError('Failed to move task', 'Please try again')
              }
            )
          }
        }
      }
    }
  }, [lists, tasks, optimisticUpdates, showError, handleReorderColumns])

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const SortableTaskCard = ({ task, index }) => {
    const isProcessing = processingCards.has(task.id)
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id })

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: task.id,
      disabled: isDraggingColumn,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    const completedSubtasks = task.subTasks?.filter(sub => sub.isCompleted).length || 0
    const totalSubtasks = task.subTasks?.length || 0
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0
    

    const formatDeadline = (deadline) => {
      if (!deadline) return null
      const date = new Date(deadline)
      const now = new Date()
      const diffTime = date - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return { text: 'Overdue', className: 'text-red-400' }
      } else if (diffDays === 0) {
        return { text: 'Today', className: 'text-orange-400' }
      } else if (diffDays === 1) {
        return { text: 'Tomorrow', className: 'text-yellow-400' }
      } else if (diffDays <= 7) {
        return { text: `${diffDays}d left`, className: 'text-yellow-400' }
      } else {
        return { text: date.toLocaleDateString(), className: 'text-gray-400' }
      }
    }
    
    const deadlineInfo = formatDeadline(task.dueDate)
    
    return (
      <div
        ref={(node) => {
          setNodeRef(node)
          setDroppableRef(node)
        }}
        style={style}
        data-task-id={task.id}
        className={`bg-white/5 border border-white/10 transition-all group shadow-sm rounded-lg relative mb-3 task-card ${
          isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : isDragging
            ? 'opacity-50 rotate-1 scale-105 ring-2 ring-blue-400 ring-opacity-50'
            : isOver && !isDraggingColumn
            ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-500/10'
            : 'hover:bg-white/10 cursor-pointer'
        }`}
        onClick={() => {
          if (!isProcessing && !isDragging && !isDraggingColumn) {
            handleTaskClick(task)
          }
        }}
      >
        <div className="p-4">
          {/* Labels Row - Top */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.slice(0, 5).map((label, index) => {
                const labelName = typeof label === 'string' ? label : label.name
                const truncatedName = labelName.length > 10 ? labelName.substring(0, 10) + '...' : labelName
                
                return (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
                    style={{ 
                      backgroundColor: typeof label === 'string' ? '#ef4444' : (label.color || '#ef4444')
                    }}
                    title={labelName}
                  >
                    {truncatedName}
                  </span>
                )
              })}
            </div>
          )}
          
          {/* Task Title */}
          <div className="mb-3">
            <h3 className="text-white font-medium text-sm line-clamp-2">{task.name}</h3>
          </div>
          
          {/* Subtasks Progress - Middle */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : '0/0'}
            </span>
          </div>
          
          {/* Bottom Row - Deadline and Members */}
          <div className="flex items-center justify-between gap-2">
            {/* Deadline */}
            {deadlineInfo && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className={`text-xs font-medium ${deadlineInfo.className}`}>
                  {deadlineInfo.text}
                </span>
              </div>
            )}
            
            {/* Members - Bottom Right */}
            <div className="flex -space-x-1">
              {task.members && task.members.length > 0 ? (
                <>
                  {task.members.slice(0, 3).map(member => (
                    <div
                      key={member.id}
                      className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white/20"
                      style={{
                        backgroundImage: member.user?.avatar ? `url(${member.user.avatar})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      title={member.user?.name || 'Unknown'}
                    >
                      {member.user?.profileImage ? (
                        <img 
                          src={`/api/storage/photos/${member.user.profileImage}`} 
                          alt={member.user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                  ))}
                  {task.members.length > 3 && (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white/20">
                      +{task.members.length - 3}
                    </div>
                  )}
                </>
              ) : (
                <div 
                  className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-xs font-medium border-2 border-white/20"
                  title="No users assigned"
                >
                  <Users className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Drag Handle and Edit Button - Top Right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Drag Handle - Hidden on mobile */}
          {!isMobile && !isDraggingColumn && (
            <div 
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded cursor-grab hover:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <GripVertical className="h-3 w-3 text-gray-400 hover:text-white" />
            </div>
          )}
          
          {/* Edit Button - Always visible on mobile */}
          {!isProcessing && !isDraggingColumn && (
            <button 
              className={`transition-opacity p-1 hover:bg-white/10 rounded ${
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (!isDragging && !isDraggingColumn) {
                  handleTaskClick(task)
                }
              }}
            >
              <Edit2 className="h-3 w-3 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    )
  }

  const SortableColumn = ({ list }) => {
    const isEditing = editingColumnId === list.id
    const listTasks = filteredTasks[list.id] || []
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: list.id })

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: `droppable-${list.id}`,
      disabled: isDraggingCard && listTasks.length > 0,
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
          <div
        ref={setNodeRef}
        style={style}
        data-list-id={list.id}
            className={`w-80 min-w-80 max-w-80 flex-shrink-0 group overflow-visible bg-white/5 border border-white/10 rounded-lg p-3 transition-all relative ${
          isDragging ? 'opacity-50 rotate-2 scale-105 ring-2 ring-gray-400 ring-opacity-50' : ''
            }`}
          >
            {/* Column Header - Draggable */}
            <div 
              {...(!isDraggingCard && !isMobile ? attributes : {})}
              {...(!isDraggingCard && !isMobile ? listeners : {})}
              className={`p-3 mb-3 rounded transition-colors ${
                !isDraggingCard && !isMobile
                  ? 'cursor-grab hover:cursor-grabbing hover:bg-white/5' 
                  : 'cursor-default'
              }`}
              style={{ touchAction: 'none' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
              {/* Drag Handle - Hidden on mobile */}
              {!isMobile && <GripVertical className="h-4 w-4 text-gray-400" />}
                  {/* Color indicator */}
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: list.color || '#3b82f6' }}
                  ></div>
                      
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingColumnName}
                        onChange={(e) => setEditingColumnName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveColumnName()
                          }
                        }}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-white/40 flex-1 min-w-0 max-w-full"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '150px' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h2 className="text-gray-400 font-bold text-xs tracking-wider uppercase flex-1">
                        {list.name} ({listTasks.length})
                      </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDraggingCard) {
                        handleStartEditColumn(list)
                      }
                    }}
                    className={`p-1 rounded transition-colors ${
                      !isDraggingCard 
                        ? 'hover:bg-white/10' 
                        : 'cursor-default'
                    }`}
                    title="Edit column name"
                    disabled={isDraggingCard}
                  >
                    <Edit2 className="h-3 w-3 text-gray-400 hover:text-white" />
                  </button>
                    </div>
                  )}
                </div>
                
                {/* Action buttons for editing mode */}
                {isEditing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveColumnName()
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Save"
                    >
                      <Check className="h-4 w-4 text-green-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelEditColumn()
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

        {/* Tasks Area - Droppable */}
        <div 
          ref={setDroppableRef}
          className={`min-h-[120px] p-2 transition-colors ${
            isOver && (!isDraggingCard || listTasks.length === 0) ? 'bg-blue-500/10 rounded-lg border-2 border-dashed border-blue-400' : ''
          }`}
        >
          <SortableContext items={listTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              {listTasks.map((task, taskIndex) => (
              <SortableTaskCard key={task.id} task={task} index={taskIndex} />
              ))}
          </SortableContext>
              
          {/* Add Card Button */}
          <Card 
            className={`bg-white/5 border border-white/10 border-dashed transition-colors mt-2 rounded-lg ${
              !isDraggingCard 
                ? 'hover:bg-white/10 cursor-pointer' 
                : 'cursor-default opacity-50'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDraggingCard) {
                handleAddCard(list)
              }
            }}
          >
                <CardContent className="p-3 text-center">
                  <Plus className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                  <span className="text-gray-400 text-xs">Add card</span>
                </CardContent>
              </Card>
            </div>
          </div>
    )
  }

  if (!project) return null

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <ProjectBoardHeader 
          project={project} 
          members={members}
          projectOwner={user}
          onLabelsChange={setSelectedLabels}
          onMembersChange={setSelectedMembers}
          onLabelsUpdated={handleLabelsUpdated}
          onSearchChange={handleSearchChange}
        />

        <div className="flex-1 px-16 py-4 sm:px-24 sm:py-6 overflow-auto custom-scrollbar">
          {/* Search Results Indicator */}
          {(searchQuery || selectedLabels.length > 0 || selectedMembers.length > 0) && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {Object.values(filteredTasks).flat().length} task(s) found
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {searchQuery && <span>Search: "{searchQuery}"</span>}
                  {selectedLabels.length > 0 && <span>{selectedLabels.length} label(s)</span>}
                  {selectedMembers.length > 0 && <span>{selectedMembers.length} member(s)</span>}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {loading ? (
              <LoadingState message="Loading project data..." />
            ) : lists.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={lists.map(list => list.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-4 sm:gap-6 min-w-max overflow-x-auto custom-scrollbar pb-4" style={{ paddingRight: '4rem' }}>
                    {lists.map((list) => (
                      <SortableColumn key={list.id} list={list} />
                    ))}
                      
                      <div className="min-w-96 sm:min-w-[28rem] flex-shrink-0 h-24">
                        <Card 
                          className="bg-white/5 border border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer w-full rounded-lg"
                          onClick={() => setShowCreateColumnModal(true)}
                          style={{ animation: 'none' }}
                        >
                          <CardContent className="p-8 text-center">
                            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-gray-400 text-lg font-medium">Create Column</span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg opacity-90 max-w-xs">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm font-medium truncate">
                          {(() => {
                            const task = Object.values(tasks).flat().find(t => t.id === activeId)
                            const list = lists.find(l => l.id === activeId)
                            return task ? task.name : list ? list.name : 'Dragging...'
                          })()}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-lg">
                  <CardContent className="p-12 text-center">
                    <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">No columns yet</h3>
                    <p className="text-gray-400 mb-6">Create your first column to start organizing tasks</p>
                    <Button 
                      onClick={() => setShowCreateColumnModal(true)}
                      className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-medium"
                    >
                      Create Column
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={showTaskModal}
        labelsUpdated={labelsUpdated}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onUpdate={async (updatedTask) => {

          setSelectedTask(updatedTask)
          

          const listId = updatedTask.listId
          if (listId) {
            try {
              const tasksResponse = await taskService.getTasksByList(listId)
              if (tasksResponse.success) {
                setTasks(prev => ({
                  ...prev,
                  [listId]: tasksResponse.data || []
                }))
              }
            } catch (error) {
              console.error('Error refreshing tasks:', error)
            }
          }
        }}
      />

      <CreateColumnModal
        isOpen={showCreateColumnModal}
        onClose={() => setShowCreateColumnModal(false)}
        projectId={project?.id}
        onColumnCreated={handleColumnCreated}
      />

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false)
          setSelectedListForCard(null)
        }}
        listId={selectedListForCard?.id}
        listName={selectedListForCard?.name}
        onCardCreated={handleCardCreated}
      />

      {/* Task Move Animations */}
      {taskMoveAnimation.getActiveAnimations().map((animation) => (
        <TaskMoveAnimation
          key={animation.id}
          task={animation.task}
          fromPosition={animation.fromPosition}
          toPosition={animation.toPosition}
          onComplete={() => taskMoveAnimation.completeAnimation(animation.id)}
          isVisible={animation.isVisible}
        />
      ))}

      {/* Disconnection Overlay */}
      <DisconnectionOverlay isConnected={isConnected} isReconnecting={isReconnecting} />
    </Layout>
  )
}

export default ProjectDetail