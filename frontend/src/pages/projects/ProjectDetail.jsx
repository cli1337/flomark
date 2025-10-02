import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { projectService } from '../../services/projectService'
import { listService } from '../../services/listService'
import { taskService } from '../../services/taskService'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import TaskModal from '../../components/TaskModal'
import CreateColumnModal from '../../components/CreateColumnModal'
import ProjectBoardHeader from '../../components/ProjectBoardHeader'
import Layout from '../../components/Layout'
import useDragAndDrop from '../../hooks/useDragAndDrop'
import { 
  Plus, 
  List,
  GripVertical,
  Edit2,
  Check,
  X
} from 'lucide-react'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editingColumnName, setEditingColumnName] = useState('')
  
  const [project, setProject] = useState(null)
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState({})
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchProjectData = async () => {
    try {
      setLoading(true)
      
      const projectResponse = await projectService.getProjectById(id)
      if (projectResponse.success) {
        setProject(projectResponse.data)
        setMembers(projectResponse.data.members || [])
        
        const listsResponse = await listService.getListsByProject(id)
        if (listsResponse.success) {
          const projectLists = listsResponse.data || []
          setLists(projectLists)
          const tasksData = {}
          for (const list of projectLists) {
            const tasksResponse = await taskService.getTasksByList(list.id)
            if (tasksResponse.success) {
              tasksData[list.id] = tasksResponse.data || []
            }
          }
          setTasks(tasksData)
        } else {
          showError('Failed to load project data', listsResponse.message)
          setLists([])
          setTasks({})
        }
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
  }

  const handleColumnCreated = async (newColumn) => {
    await fetchProjectData()
  }

  const handleColumnReorder = async (newOrder) => {
    try {
      // Update local state immediately for better UX
      setLists(newOrder)
      
      const response = await listService.reorderLists(project.id, newOrder.map(col => col.id))
      
      if (response.success) {
        showSuccess('Columns reordered', 'Column order has been updated')
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Error reordering columns:', error)
      showError('Failed to reorder columns', 'Please try again later')
      // Revert to original order on error
      await fetchProjectData()
    }
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
        // Update local state
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

  // Initialize drag and drop
  const { getDragProps } = useDragAndDrop(lists, handleColumnReorder)

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const TaskCard = ({ task }) => (
    <Card 
      className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer mb-3"
      onClick={() => handleTaskClick(task)}
    >
      <CardContent className="p-4">
        <h3 className="text-white font-medium text-sm mb-2">{task.name}</h3>
        {task.description && (
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{task.description}</p>
        )}
        {task.subTasks && task.subTasks.length > 0 && (
          <p className="text-gray-400 text-xs">
            {task.subTasks.filter(sub => sub.isCompleted).length} of {task.subTasks.length} subtasks
          </p>
        )}
        {task.members && task.members.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {task.members.slice(0, 3).map(member => (
              <div
                key={member.id}
                className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
              >
                {member.user?.name?.charAt(0) || 'U'}
              </div>
            ))}
            {task.members.length > 3 && (
              <span className="text-gray-400 text-xs">+{task.members.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const Column = ({ list }) => {
    const isEditing = editingColumnId === list.id

    return (
      <div 
        className="flex-1 min-w-64 sm:min-w-72 group"
        {...getDragProps(list)}
      >
        {/* Column Header */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <GripVertical className="h-4 w-4 text-gray-600 cursor-grab hover:text-gray-400 transition-colors" />
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: list.color || '#3b82f6' }}
              ></div>
              
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveColumnName()
                      }
                    }}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-white/40 flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveColumnName}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Save"
                  >
                    <Check className="h-4 w-4 text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelEditColumn}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <h2 className="text-gray-400 font-bold text-xs tracking-wider uppercase flex-1">
                    {list.name} ({tasks[list.id]?.length || 0})
                  </h2>
                  <button
                    onClick={() => handleStartEditColumn(list)}
                    className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit column name"
                  >
                    <Edit2 className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Add Task Button */}
            <button
              className="ml-2 p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Add task"
            >
              <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {tasks[list.id]?.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          <Card className="bg-white/5 border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <span className="text-gray-400 text-sm">Add card</span>
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
        />

        <div className="flex-1 px-16 py-4 sm:px-24 sm:py-6 overflow-auto custom-scrollbar">
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading project data...</div>
              </div>
            ) : lists.length > 0 ? (
              <div className="flex gap-4 sm:gap-6 min-w-max overflow-x-auto custom-scrollbar pb-4">
                {lists.map(list => (
                  <Column key={list.id} list={list} />
                ))}
                
                <div className="flex-1 min-w-64 sm:min-w-72 flex items-center justify-center">
                  <Card 
                    className="bg-white/5 border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer w-full"
                    onClick={() => setShowCreateColumnModal(true)}
                  >
                    <CardContent className="p-8 text-center">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-400 text-lg font-medium">Create Column</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
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
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onUpdate={(updatedTask) => {
          setTasks(prev => {
            const newTasks = { ...prev }
            Object.keys(newTasks).forEach(listId => {
              newTasks[listId] = newTasks[listId].map(task => 
                task.id === updatedTask.id ? updatedTask : task
              )
            })
            return newTasks
          })
        }}
      />

      <CreateColumnModal
        isOpen={showCreateColumnModal}
        onClose={() => setShowCreateColumnModal(false)}
        projectId={project?.id}
        onColumnCreated={handleColumnCreated}
      />
    </Layout>
  )
}

export default ProjectDetail
