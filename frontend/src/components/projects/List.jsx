import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { useEffect, React } from 'react'

function Projects() {
  const { user, logout } = useAuth()

  useEffect(() => {
    axios.get('/api/projects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        console.log(response.data)
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
