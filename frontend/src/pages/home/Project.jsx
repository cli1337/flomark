import { useEffect, useState } from 'react'
import { projectService } from '../../services/projectService'
import { useParams, useNavigate } from 'react-router-dom'

function Project() {
    const { id } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [image, setImage] = useState(null)

    const navigate = useNavigate()

    const fetchProject = async () => {
        setLoading(true)
        const response = await projectService.getProjectById(id)
        if (response.success) {
            setProject(response.data)
            if (response.data.imageHash) {
                let filename = response.data.imageHash
                if (filename.includes('/')) {
                    filename = filename.split('/').pop()
                }
                
                try {
                    const imageData = await projectService.getProjectImage(id)
                    if (imageData) {
                        setImage(imageData)
                    }
                } catch (error) {
                    console.error('Error loading image:', error)
                    setImage(null)
                }
            }
        } else {
            navigate('/projects')
            setProject(null)
        }
        setLoading(false)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        try {
            const response = await projectService.uploadProjectImage(id, file)
            if (response.success) {
                setProject(response.data)
                fetchProject()
            } else {
                console.error(response.message)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
        }
    }
    
    useEffect(() => {
        fetchProject()
    }, [id])

    return (
        <div >
            <h1>Project</h1>
            {loading ? <p>Loading...</p> : (
                project && (
                    <>
                        <div>
                            <h2 className="project-name">{project.name}</h2>
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
                            <p className="truncate" title={project.labels?.map(label => label.name).join(', ') || 'No labels'}>Project Labels: {project.labels?.map(label => label.name).join(', ') || 'No labels'}</p>
                        </div>
                        <div>
                            <h2>Image</h2>
                            {project.imageHash ? (
                                <div>
                                    <img src={image} alt="Project" style={{maxWidth: '200px', maxHeight: '200px'}} />
                                    <p>Current image URL: {image}</p>
                                </div>
                            ) : (
                                <p>No image uploaded</p>
                            )}
                        </div>
                        <div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                style={{marginBottom: '10px'}}
                            />
                        </div>

                    </>
                )
            )}
        </div>
    )
}

export default Project
