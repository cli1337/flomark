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
  Copy,
  Plus,
  MoreVertical,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  const [showCreateProject, setShowCreateProject] = useState(false)
  
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
    const assignmentCount = Math.floor(Math.random() * 5)

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
                      isOwner ? 'bg-yellow-500' : 'bg-purple-600'
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

            <div className="flex items-center gap-2">
              {assignmentCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-lg h-5 w-5 flex items-center justify-center font-medium border border-red-400/30">
                  {assignmentCount}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-4 sm:py-6 custom-scrollbar">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Projects</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading projects...</div>
            </div>
          ) : (
            <>
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

              {/* Pagination Section */}
              <div className="flex flex-col items-center gap-4 sm:gap-6 mt-8 sm:mt-12">
                {/* Page Info */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages} • {projects.length} projects
                  </p>
                </div>

                {/* Modern Navigation */}
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center gap-2 p-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {(() => {
                      const pages = []
                      const maxVisible = 3
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                      
                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1)
                      }
                      
                      // First page + ellipsis
                      if (startPage > 1) {
                        pages.push(
                          <Button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all ${
                              1 === currentPage
                                ? 'bg-white text-black font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            1
                          </Button>
                        )
                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="text-gray-400 px-2">
                              ...
                            </span>
                          )
                        }
                      }
                      
                      // Page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all ${
                              i === currentPage
                                ? 'bg-white text-black font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {i}
                          </Button>
                        )
                      }
                      
                      // Ellipsis + last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="text-gray-400 px-2">
                              ...
                            </span>
                          )
                        }
                        pages.push(
                          <Button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            disabled={loading}
                            className={`w-8 h-8 text-sm rounded-lg transition-all ${
                              totalPages === currentPage
                                ? 'bg-white text-black font-medium'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {totalPages}
                          </Button>
                        )
                      }
                      
                      return pages
                    })()}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="flex items-center gap-2 p-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Jump */}
                {totalPages > 5 && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap justify-center">
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
    </Layout>
  )
}

export default Projects
