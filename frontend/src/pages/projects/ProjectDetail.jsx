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
import ProjectBoardHeader from '../../components/ProjectBoardHeader'
import Layout from '../../components/Layout'
import { 
  Plus, 
  List
} from 'lucide-react'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateList, setShowCreateList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  
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

  const handleCreateList = async () => {
    if (!newListName.trim() || !project) return
    
    try {
      const response = await listService.createList(project.id, newListName)
      if (response.success) {
        showSuccess('List Created', `${newListName} has been created successfully`)
        setNewListName('')
        setShowCreateList(false)
        await fetchProjectData()
      } else {
        showError('Failed to create list', response.message)
      }
    } catch (error) {
      console.error('Error creating list:', error)
      showError('Failed to create list', 'Please try again later')
    }
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
                className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
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

  const Column = ({ list }) => (
    <div className="flex-1 min-w-64">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <h2 className="text-gray-400 font-bold text-xs tracking-wider uppercase">
          {list.name} ({tasks[list.id]?.length || 0})
        </h2>
      </div>
      <div className="space-y-3">
        {tasks[list.id]?.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        <Card className="bg-white/5 border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <span className="text-gray-400 text-sm">+ New Task</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )

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

        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading project data...</div>
              </div>
            ) : lists.length > 0 ? (
              <div className="flex gap-6 min-w-max">
                {lists.map(list => (
                  <Column key={list.id} list={list} />
                ))}
                
                {showCreateList ? (
                  <div className="flex-1 min-w-64">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <input
                          type="text"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder="Enter list name..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 mb-3"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateList}
                            disabled={!newListName.trim()}
                            className="bg-white hover:bg-gray-100 text-black px-3 py-1 text-sm"
                          >
                            Add List
                          </Button>
                          <Button
                            onClick={() => {
                              setShowCreateList(false)
                              setNewListName('')
                            }}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex-1 min-w-64 flex items-center justify-center">
                    <Card 
                      className="bg-white/5 border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer w-full"
                      onClick={() => setShowCreateList(true)}
                    >
                      <CardContent className="p-8 text-center">
                        <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-400 text-lg font-medium">+ New Column</span>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-12 text-center">
                    <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">No columns yet</h3>
                    <p className="text-gray-400 mb-6">Create your first column to start organizing tasks</p>
                    <Button 
                      onClick={() => setShowCreateList(true)}
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
    </Layout>
  )
}

export default ProjectDetail
