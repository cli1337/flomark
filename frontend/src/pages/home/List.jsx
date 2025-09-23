import { useAuth } from '../../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, React, useState } from 'react'
import { projectService } from '../../services/projectService'

function Projects() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const fetchProjects = () => {
    setLoading(true)
    projectService.getAllProjects().then(response => {
      setProjects(response.data || [])
    }).catch(error => {
      console.error('Error fetching projects:', error)
      setProjects([])
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`)
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    
    projectService.createProject(newProjectName).then(response => {
      setNewProjectName('')
      fetchProjects()
    }).catch(error => {
      console.error('Error creating project:', error)
    })
  }

  const handleLogout = () => {
    navigate('/logout')
  }

  return (
    <div className="container">
      <div className="profile">
        <h2>Projects</h2>
        <p>Hello <strong>{user?.name}</strong></p>
        <div id="projects">
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <>
              {projects.map(project => (
                <button key={project.id} onClick={() => handleProjectClick(project.id)}>
                  {project.name}
                </button>
              ))}
              {projects.length === 0 && <p>No projects found</p>}
            </>
          )}

          <div>
            <input 
              type="text" 
              placeholder="Project Name" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)} 
            />
            <button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </button>
          </div>

        </div>
        <div style={{paddingTop: "30px"}}>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Projects
