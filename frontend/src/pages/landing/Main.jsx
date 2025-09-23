import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Main() {
    const { user } = useAuth()


    return (
        <div>
        <h1>Task Manager</h1>
        <p>Manage your tasks and projects</p>
        {user ? (
            <Link to="/projects">Projects</Link>
        ) : (
            <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </>
        )}
        </div>
    )
}

export default Main
