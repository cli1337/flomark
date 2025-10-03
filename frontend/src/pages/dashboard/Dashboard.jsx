import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import usePageTitle from '../../hooks/usePageTitle'
import { projectService } from '../../services/projectService'
import { listService } from '../../services/listService'
import { taskService } from '../../services/taskService'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Switch'
import { Separator } from '../../components/ui/Separator'
import LoadingState from '../../components/ui/LoadingState'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../../components/ui/DropdownMenu'
import CreateProjectModal from '../../components/CreateProjectModal'
import TaskModal from '../../components/TaskModal'
import { 
  Menu, 
  Plus, 
  MoreVertical, 
  Sun, 
  Moon, 
  ChevronLeft,
  Building2,
  Calendar,
  Target,
  Users,
  Settings,
  Bell,
  Edit,
  Trash2,
  Copy,
  LogOut,
  User,
  FolderPlus,
  Grid3X3,
  List,
  ArrowLeft,
  Upload,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  
  usePageTitle('Dashboard')

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [view, setView] = useState('projects')
  const [selectedProject, setSelectedProject] = useState(null)

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateList, setShowCreateList] = useState(false)
  const [newListName, setNewListName] = useState('')

  const [projects, setProjects] = useState([])
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectService.getAllProjects()
      if (response.success) {
        setProjects(response.data || [])
      } else {
        showError('Failed to load projects', response.message)
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showError('Failed to load projects', 'Please try again later')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectData = async (projectId) => {
    try {
      setLoading(true)
      const listsResponse = await listService.getListsByProject(projectId)
      
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
    } catch (error) {
      console.error('Error fetching project data:', error)
      showError('Failed to load project data', 'Please try again later')
      setLists([])
      setTasks({})
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim() || !selectedProject) return
    
    try {
      const response = await listService.createList(selectedProject.id, newListName)
      if (response.success) {
        showSuccess('List Created', `${newListName} has been created successfully`)
        setNewListName('')
        setShowCreateList(false)
        await fetchProjectData(selectedProject.id)
      } else {
        showError('Failed to create list', response.message)
      }
    } catch (error) {
      console.error('Error creating list:', error)
      showError('Failed to create list', 'Please try again later')
    }
  }

  const handleProjectSelect = async (project) => {
    setSelectedProject(project)
    setView('kanban')
    await fetchProjectData(project.id)
  }

  const handleBackToProjects = () => {
    setView('projects')
    setSelectedProject(null)
    setLists([])
    setTasks({})
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

  const handleLogout = () => {
    logout()
    showInfo('Logged Out', 'You have been logged out successfully')
  }

  const toggleSidebarCollapse = () => {
    if (sidebarOpen) {
      setSidebarCollapsed(!sidebarCollapsed)
    } else {
      setSidebarOpen(true)
      setSidebarCollapsed(false)
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSidebarCollapsed(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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

  const ProjectCard = ({ project }) => {
    const [projectImage, setProjectImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)

    useEffect(() => {
      if (project.imageHash && !projectImage) {
        setImageLoading(true)
        projectService.getProjectImage(project.id)
          .then(imageData => {
            if (imageData) {
              setProjectImage(imageData)
            }
          })
          .catch(error => {
            console.error('Error loading project image:', error)
          })
          .finally(() => {
            setImageLoading(false)
          })
      }
    }, [project.id, project.imageHash, projectImage])

    return (
      <Card 
        className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden"
        onClick={() => handleProjectSelect(project)}
      >
        {/* Project Image */}
        {project.imageHash && (
          <div className="h-32 bg-[#18191b] relative overflow-hidden">
            {imageLoading ? (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white/60 rounded-full"></div>
              </div>
            ) : projectImage ? (
              <img
                src={projectImage}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {!project.imageHash && (
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold text-lg project-name">{project.name}</h3>
                <p className="text-gray-400 text-sm">Created {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{project.lists?.length || 0} lists</span>
            <span>{project.members?.length || 0} members</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#18191b]">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative flex flex-col sm:flex-row h-screen">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 sm:relative absolute z-50 h-full`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              {!sidebarCollapsed ? (
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-white">TaskManager</h1>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-6 flex-1">
              {!sidebarCollapsed && (
                <h2 className="text-gray-400 text-xs font-bold tracking-wider uppercase mb-4">
                  {view === 'projects' ? 'ALL PROJECTS' : 'PROJECT BOARD'}
                </h2>
              )}
              <div className="space-y-2">
                {view === 'projects' ? (
                  <>
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-400 hover:bg-white/10 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? 'Create Project' : ''}
                    >
                      <FolderPlus className="h-4 w-4" />
                      {!sidebarCollapsed && <span className="font-medium">Create New Project</span>}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBackToProjects}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-400 hover:bg-white/10 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? 'Back to Projects' : ''}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {!sidebarCollapsed && <span className="font-medium">Back to Projects</span>}
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 space-y-4">
              {/* Profile Section */}
              <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="p-2 bg-white/10 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                )}
                {!sidebarCollapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Sidebar Controls */}
              <div className="space-y-2">
                <button
                  onClick={toggleSidebarCollapse}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  <ChevronLeft className={`h-4 w-4 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                  {!sidebarCollapsed && <span className="font-medium">Collapse Sidebar</span>}
                </button>
                {!sidebarCollapsed && (
                  <button
                    onClick={closeSidebar}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="font-medium">Hide Sidebar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="h-5 w-5 text-white" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-white">
                {view === 'projects' ? 'Projects' : selectedProject?.name || 'Kanban Board'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {view === 'kanban' && (
                <Button className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {view === 'projects' ? (
              <div className="space-y-6">
                {/* Projects Grid */}
                {loading ? (
                  <LoadingState message="Loading projects..." />
                ) : projects.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                      <CardContent className="p-12 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold text-lg mb-2">No projects yet</h3>
                        <p className="text-gray-400 mb-6">Create your first project to get started</p>
                        <Button 
                          onClick={() => setShowCreateProject(true)}
                          className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-medium"
                        >
                          Create Project
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Kanban Board */
              <div className="space-y-6">
                {loading ? (
                  <LoadingState message="Loading project data..." />
                ) : lists.length > 0 ? (
                  <div className="flex gap-6 min-w-max">
                    {lists.map(list => (
                      <Column key={list.id} list={list} />
                    ))}
                    
                    {/* Add New Column */}
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
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={fetchProjects}
      />

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
    </div>
  )
}

export default Dashboard