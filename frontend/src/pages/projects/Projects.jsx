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
        setTotalPages(Math.ceil(response.total / projectsPerPage))
        setTotalProjects(response.total)
        setCurrentPage(page)
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
        
        // Check if image is already in cache
        if (imageCache.current.has(cacheKey)) {
          setProjectImage(imageCache.current.get(cacheKey))
          setImageLoading(false)
          return
        }

        // If not in cache, load the image
        setImageLoading(true)
        setImageLoadError(false)
        
        projectService.getProjectImage(project.id)
          .then(imageData => {
            if (imageData) {
              // Store in cache
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
        className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden relative"
        onClick={handleProjectClick}
      >
        <div className="h-24 bg-[#18191b] relative overflow-hidden">
          {project.imageHash ? (
            imageLoading ? (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white/60 rounded-full"></div>
              </div>
            ) : projectImage ? (
              <img
                src={projectImage}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-[#18191b] flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gray-600/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold text-base truncate">{project.name}</h3>
                <p className="text-gray-400 text-xs">Created {new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
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
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((member, index) => (
                <div
                  key={member.id || index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-[#18191b] hover:z-10 relative cursor-pointer ${
                    member.isOwner || (member.user && member.user.id === user?.id) 
                      ? 'bg-yellow-500' 
                      : 'bg-purple-600'
                  }`}
                  title={`${member.user?.name || member.name || 'Unknown User'}${member.isOwner || (member.user && member.user.id === user?.id) ? ' (Owner)' : ''}`}
                >
                  {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 
                   member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium border-2 border-[#18191b]">
                  +{members.length - 4}
                </div>
              )}
            </div>

            {assignmentCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                {assignmentCount}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Layout>
      <div className="px-32 py-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                
                <Card 
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group overflow-hidden border-dashed"
                  onClick={() => setShowCreateProject(true)}
                >
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors mb-3">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">Create Project</h3>
                    <p className="text-gray-400 text-xs text-center">Start organizing tasks</p>
                  </CardContent>
                </Card>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="ghost"
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 mr-1" />
                    )}
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 ${
                            pageNum === currentPage
                              ? 'bg-white text-black hover:bg-gray-100'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    variant="ghost"
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                    {loading ? (
                      <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              )}

              {projects.length === 0 && (
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
