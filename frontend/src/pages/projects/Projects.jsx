import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { projectService } from '../../services/projectService'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '../../components/ui/DropdownMenu'
import CreateProjectModal from '../../components/CreateProjectModal'
import Layout from '../../components/Layout'
import { 
  Building2,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  ChevronsLeft,
  ChevronsRight,
  Grid3X3,
  List
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [viewMode, setViewMode] = useState(() => {
    // Load view mode from localStorage, default to 'grid'
    const savedViewMode = localStorage.getItem('projectViewMode')
    return savedViewMode || 'grid'
  })
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  const projectsPerPage = 9
  
  const imageCache = useRef(new Map())
  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true)
      const response = await projectService.getAllProjects(page, projectsPerPage)
      if (response.success) {
        setProjects(response.data || [])
        const total = response.total || (response.data ? response.data.length : 0)
        setTotalPages(Math.ceil(total / projectsPerPage))
        setTotalProjects(total)
        setCurrentPage(page)
      } else {
        showError('Failed to load projects', response.message)
        setProjects([])
        setTotalProjects(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showError('Failed to load projects', 'Please try again later')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    fetchProjects(page)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('projectViewMode', mode)
  }

  const handleEditProject = (project) => {
    setSelectedProject(project)
    setShowEditModal(true)
  }

  const handleDeleteProject = (project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }
  useEffect(() => {
    fetchProjects()
  }, [])

  const ProjectCard = ({ project }) => {
    const [projectImage, setProjectImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageLoadError, setImageLoadError] = useState(false)

    useEffect(() => {
      if (project.imageHash) {
        const cacheKey = `${project.id}-${project.imageHash}`
        
        if (imageCache.current.has(cacheKey)) {
          setProjectImage(imageCache.current.get(cacheKey))
          setImageLoading(false)
          return
        }

        setImageLoading(true)
        setImageLoadError(false)
        
        projectService.getProjectImage(project.id)
          .then(imageData => {
            if (imageData) {
              imageCache.current.set(cacheKey, imageData)
              setProjectImage(imageData)
            }
          })
          .catch(error => {
            console.error('Error loading project image:', error)
            setImageLoadError(true)
          })
          .finally(() => {
            setImageLoading(false)
          })
      }
    }, [project.id, project.imageHash])

    const handleProjectClick = () => {
      window.location.href = `/projects/${project.id}`
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleProjectClick()
      }
    }

    const getProjectMembers = () => {
      if (project.members && project.members.length > 0) {
        return project.members
      }
      return user ? [{ user, isOwner: true }] : []
    }

    const members = getProjectMembers()
    
    // Calculate project statistics
    const totalTasks = project.lists?.reduce((acc, list) => acc + (list.tasks?.length || 0), 0) || 0
    const completedTasks = project.lists?.reduce((acc, list) => 
      acc + (list.tasks?.filter(task => task.isCompleted)?.length || 0), 0) || 0
    const totalLists = project.lists?.length || 0
    const assignmentCount = Math.floor(Math.random() * 5)
    
    // Get last activity (most recent task update or project update)
    const lastActivity = project.updatedAt

    return (
      <Card 
        className="bg-white/5 border-white/10 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all cursor-pointer group relative"
        onClick={handleProjectClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Image/Header Section */}
        <div className="h-24 bg-[#18191b] relative overflow-hidden rounded-t-lg">
          {project.imageHash ? (
            imageLoading ? (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white/60 rounded-full"></div>
              </div>
            ) : projectImage ? (
              <div className="w-full h-full overflow-hidden">
                <img
                  src={projectImage}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )
          ) : (
            <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Project name overlay on image */}
          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-white font-semibold text-sm truncate drop-shadow-lg project-name">{project.name}</h3>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs">Created {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditProject(project)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProject(project)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Project Statistics */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>{totalLists} lists</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {assignmentCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-lg h-5 w-5 flex items-center justify-center font-medium border border-red-400/30">
                  {assignmentCount}
                </div>
              )}
            </div>
          </div>


          <div className="flex items-center justify-between">
            <div className="flex -space-x-1">
              {members.slice(0, 3).map((member, index) => {
                const userName = member.user?.name || member.name || 'Unknown User'
                const userRole = member.role || (member.isOwner || (member.user && member.user.id === user?.id) ? 'OWNER' : 'MEMBER')
                const userInitial = userName.charAt(0).toUpperCase()
                const isOwner = member.isOwner || (member.user && member.user.id === user?.id)
                
                return (
                  <div
                    key={member.id || index}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium border-2 border-white/30 hover:border-white/50 hover:z-10 relative cursor-pointer transition-all duration-200 member-tooltip-trigger ${
                      isOwner ? 'bg-gray-500' : 'bg-gray-600'
                    }`}
                    title={`${userName} - ${userRole}`}
                  >
                    <span>{userInitial}</span>
                    
                    {/* Enhanced tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs whitespace-nowrap opacity-0 member-tooltip transition-opacity duration-200 pointer-events-none z-[9999] backdrop-blur-xl">
                      <div className="font-medium text-white">{userName}</div>
                      <div className="text-gray-400 text-xs">{userRole}</div>
                      {/* Tooltip arrow */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white/5"></div>
                    </div>
                  </div>
                )
              })}
              {members.length > 3 && (
                <div 
                  className="w-7 h-7 rounded-lg bg-gray-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white/30 hover:border-white/50 cursor-pointer transition-all duration-200 member-tooltip-trigger relative"
                  title={`${members.length - 3} more members`}
                >
                  +{members.length - 3}
                  
                  {/* Enhanced tooltip for more members */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs whitespace-nowrap opacity-0 member-tooltip transition-opacity duration-200 pointer-events-none z-[9999] backdrop-blur-xl max-w-xs">
                    <div className="font-medium text-white">{members.length - 3} more members</div>
                    <div className="text-gray-400 text-xs">
                      {members.slice(3).map(m => m.user?.name || m.name || 'Unknown').join(', ')}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white/5"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400">
              {new Date(lastActivity).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TableRow = ({ project }) => {
    const [projectImage, setProjectImage] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)

    useEffect(() => {
      if (project.imageHash) {
        const cacheKey = `${project.id}-${project.imageHash}`
        
        if (imageCache.current.has(cacheKey)) {
          setProjectImage(imageCache.current.get(cacheKey))
          setImageLoading(false)
          return
        }

        setImageLoading(true)
        
        projectService.getProjectImage(project.id)
          .then(imageData => {
            if (imageData) {
              imageCache.current.set(cacheKey, imageData)
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
    }, [project.id, project.imageHash])

    const getProjectMembers = () => {
      if (project.members && project.members.length > 0) {
        return project.members
      }
      return user ? [{ user, isOwner: true }] : []
    }

    const members = getProjectMembers()
    
    // Calculate project statistics
    const totalTasks = project.lists?.reduce((acc, list) => acc + (list.tasks?.length || 0), 0) || 0
    const completedTasks = project.lists?.reduce((acc, list) => 
      acc + (list.tasks?.filter(task => task.isCompleted)?.length || 0), 0) || 0
    const totalLists = project.lists?.length || 0
    const assignmentCount = Math.floor(Math.random() * 5)

    return (
      <tr 
        className="bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={() => window.location.href = `/projects/${project.id}`}
      >
        <td className="px-6 py-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#18191b] rounded-lg flex items-center justify-center flex-shrink-0">
              {project.imageHash ? (
                imageLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white/60 rounded-full"></div>
                ) : projectImage ? (
                  <img
                    src={projectImage}
                    alt={project.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                )
              ) : (
                <Building2 className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm project-name">{project.name}</h3>
              <p className="text-gray-400 text-xs">Created {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 text-left">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>{totalLists} lists</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 text-left">
          <div className="flex -space-x-1">
            {members.slice(0, 3).map((member, index) => {
              const userName = member.user?.name || member.name || 'Unknown User'
              const userInitial = userName.charAt(0).toUpperCase()
              const isOwner = member.isOwner || (member.user && member.user.id === user?.id)
              
              return (
                <div
                  key={member.id || index}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-medium border-2 border-white/30 hover:border-white/50 hover:z-10 relative cursor-pointer transition-all duration-200 ${
                    isOwner ? 'bg-gray-500' : 'bg-gray-600'
                  }`}
                  title={`${userName} - ${isOwner ? 'OWNER' : 'MEMBER'}`}
                >
                  <span>{userInitial}</span>
                </div>
              )
            })}
            {members.length > 3 && (
              <div className="w-6 h-6 rounded-lg bg-gray-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white/30">
                +{members.length - 3}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-3 text-left">
          <div className="flex items-center gap-2">
            <div className={`text-white text-xs rounded-lg h-5 w-5 flex items-center justify-center font-medium border ${assignmentCount > 0 ? 'bg-red-500 border-red-400/30' : 'bg-gray-600 border-gray-500/30'}`}>
              {assignmentCount}
            </div>

          </div>
        </td>
        <td className="px-6 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditProject(project)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteProject(project)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    )
  }

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = ({ isOpen, onClose, project }) => {
    const [confirmName, setConfirmName] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
      if (confirmName !== project.name) {
        showError('Project name does not match', 'Please type the exact project name to confirm deletion')
        return
      }

      setIsDeleting(true)
      try {
        // TODO: Implement delete project API call
        showSuccess('Project deleted successfully')
        onClose()
        fetchProjects(currentPage)
      } catch (error) {
        showError('Failed to delete project', 'Please try again later')
      } finally {
        setIsDeleting(false)
      }
    }

    const handleClose = () => {
      setConfirmName('')
      setIsDeleting(false)
      onClose()
    }

    if (!isOpen || !project) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-md backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Delete Project</h2>
          <p className="text-gray-300 mb-4">
            This action cannot be undone. This will permanently delete the project and all its data.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Type <span className="font-mono text-red-400">{project.name}</span> to confirm deletion:
          </p>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 mb-6"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmName !== project.name}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Edit Project Modal Component
  const EditProjectModal = ({ isOpen, onClose, project }) => {
    const [projectName, setProjectName] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
      if (project) {
        setProjectName(project.name)
        setSelectedImage(null)
      }
    }, [project])

    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setSelectedImage(file)
      }
    }

    const handleUpdate = async () => {
      if (!projectName.trim()) {
        showError('Project name is required', 'Please enter a project name')
        return
      }

      setIsUpdating(true)
      try {
        // TODO: Implement update project API call
        showSuccess('Project updated successfully')
        onClose()
        fetchProjects(currentPage)
      } catch (error) {
        showError('Failed to update project', 'Please try again later')
      } finally {
        setIsUpdating(false)
      }
    }

    const handleClose = () => {
      setProjectName('')
      setSelectedImage(null)
      setIsUpdating(false)
      onClose()
    }

    if (!isOpen || !project) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-md backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Edit Project</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Image
              </label>
              <div className="space-y-3">
                {project.imageHash && (
                  <div className="text-xs text-gray-400">
                    Current image: {project.imageHash}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
                {selectedImage && (
                  <div className="text-xs text-green-400">
                    Selected: {selectedImage.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || !projectName.trim()}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-4 sm:py-6 custom-scrollbar">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            
            {/* View Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Grid</span>
              </button>
              <button
                onClick={() => handleViewModeChange('table')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading projects...</div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  
                  {projects.length > 0 && (
                    <Card
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden border-dashed"
                      onClick={() => setShowCreateProject(true)}
                    >
                      <div className="h-24 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col items-center justify-center">
                        <h3 className="text-white font-semibold text-sm mb-1">Create Project</h3>
                        <p className="text-gray-400 text-xs text-center">Start organizing tasks</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full">
                     <thead className="bg-white/5 border-b border-white/10">
                       <tr>
                         <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Project</th>
                         <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Progress</th>
                         <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Members</th>
                         <th className="px-6 py-4 text-left text-gray-400 text-sm font-medium">Notifications</th>
                         <th className="px-6 py-4 text-right text-gray-400 text-sm font-medium">Actions</th>
                       </tr>
                     </thead>
                    <tbody>
                      {projects.map(project => (
                        <TableRow key={project.id} project={project} />
                      ))}
                    </tbody>
                  </table>
                  
                  {projects.length > 0 && (
                    <div className="p-4 border-t border-white/10">
                      <button
                        onClick={() => setShowCreateProject(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-lg border border-dashed border-white/20"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Create New Project</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mt-8 sm:mt-12">
                {/* Left Side - Page Info and Quick Jump */}
                <div className="flex items-center gap-4">
                  {/* Page Info */}
                  <div className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages} • {projects.length} projects
                  </div>
                  
                  {/* Quick Jump */}
                  {totalPages > 5 && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value)
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          }
                        }}
                        className="w-12 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center text-sm focus:outline-none focus:border-white/30"
                      />
                    </div>
                  )}
                </div>

                {/* Pagination on Right */}
                <div className="flex items-center gap-4">
                  {/* Modern Pagination */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex items-center gap-1">
                  {/* First Page Button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || loading}
                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = []
                      const maxVisible = 5
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                      
                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1)
                      }
                      
                      // First page + ellipsis
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all font-medium ${
                              1 === currentPage
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            1
                          </button>
                        )
                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="text-gray-400 px-1">
                              ...
                            </span>
                          )
                        }
                      }
                      
                      // Page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all font-medium ${
                              i === currentPage
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {i}
                          </button>
                        )
                      }
                      
                      // Ellipsis + last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="text-gray-400 px-1">
                              ...
                            </span>
                          )
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all font-medium ${
                              totalPages === currentPage
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {totalPages}
                          </button>
                        )
                      }
                      
                      return pages
                    })()}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages || loading}
                    className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                  </div>
                </div>
              </div>

              {projects.length === 0 && (
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl border-dashed">
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">No projects yet</h3>
                    <p className="text-gray-400 text-xs text-center mb-4">Create your first project to get started</p>
                    <Button 
                      onClick={() => setShowCreateProject(true)}
                      className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-medium"
                    >
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={() => fetchProjects(currentPage)}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        project={selectedProject}
      />

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={selectedProject}
      />
    </Layout>
  )
}

export default Projects
