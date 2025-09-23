import { useEffect, useState } from 'react'
import { projectService } from '../../services/projectService'
import { useParams, useNavigate } from 'react-router-dom'

function Project() {
    const { id } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    const fetchProject = async () => {
        setLoading(true)
        const response = await projectService.getProjectById(id)
        if (response.success) {
            setProject(response.data)
        } else {
            navigate('/projects')
            setProject(null)
        }
        setLoading(false)
    }
    
    useEffect(() => {
        fetchProject()
    }, [id])

    return (
        <div>
            <h1>Project</h1>
            {loading ? <p>Loading...</p> : (
                project && (
                    <>
                        <div>
                            <h2>{project.name}</h2>
                            <p>Project ID: {project.id}</p>
                            <p>Project Created At: {project.createdAt}</p>
                            <p>Project Updated At: {project.updatedAt}</p>
                            <p>Project Members: {project.members?.map(member => member.userId).join(', ') || 'No members'}</p>
                        </div>
                        <div>
                            <h2>Members</h2>
                            <p>Project Members: {project.members?.map(member => member.userId).join(', ') || 'No members'}</p>
                        </div>
                        <div>
                            <h2>Tasks</h2>
                            <p>Project Tasks: {project.tasks?.map(task => task.name).join(', ') || 'No tasks'}</p>
                        </div>
                        <div>
                            <h2>Notes</h2>
                            <p>Project Notes: {project.notes?.map(note => note.content).join(', ') || 'No notes'}</p>
                        </div>
                        <div>
                            <h2>Labels</h2>
                            <p>Project Labels: {project.labels?.map(label => label.name).join(', ') || 'No labels'}</p>
                        </div>
                        <div>
                            <h2>Image</h2>
                            <p>Project Image: {project.imageHash || 'No image'}</p>
                        </div>
                    </>
                )
            )}
        </div>
    )
}

export default Project
