import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, React, useState } from 'react'

function Projects() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProject, setNewProject] = useState(null)
  const navigate = useNavigate()

  const handleProjectClick = (projectId) => {
    setSelectedProject(projectId)
    navigate(`/projects/${projectId}`)
  }

  const handleNewProjectClick = () => {
    setNewProject(true)
    navigate(`/projects/new`)
  }

  useEffect(() => {
    axios.get('/api/projects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (response.data.success) {
          setProjects(response.data.data)
        } else {
          setProjects([])
        }
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="container">
      <div className="profile">
        <h2>Projects</h2>
        <p>Hello <strong>{user?.name}</strong></p>
        <div id="projects">
          {projects.map(project => (
            <button key={project.id} onClick={() => handleProjectClick(project.id)}>
              {project.name}
            </button>
          ))}
          {projects.length === 0 && <p>No projects found</p>}
          <button onClick={() => handleNewProjectClick()}>
            Create Project
          </button>
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
