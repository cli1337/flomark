import React from 'react'
import { useWebSocket } from '../contexts/WebSocketContext'
import { useAuth } from '../contexts/AuthContext'
import { Users, Wifi, WifiOff } from 'lucide-react'

const ActivityIndicator = ({ projectId }) => {
  const { isConnected, activeUsers } = useWebSocket()
  const { user } = useAuth()


  const activeUsersInProject = activeUsers

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <span className="text-xs">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Active Users */}
      {activeUsersInProject.length > 0 && (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-blue-400" />
          <span className="text-xs">
            {activeUsersInProject.length} active
          </span>
        </div>
      )}

      {/* User Avatars */}
      {activeUsersInProject.length > 0 && (
        <div className="flex -space-x-1">
          {activeUsersInProject.slice(0, 3).map((activeUser) => {
            const isCurrentUser = activeUser.id === user?.id
            return (
              <div
                key={activeUser.id}
                className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-medium border-2 ${
                  isCurrentUser 
                    ? 'bg-green-500 border-green-300' 
                    : 'bg-blue-500 border-white/30'
                }`}
                title={`${activeUser.name} is online${isCurrentUser ? ' (You)' : ''}`}
              >
                {activeUser.profileImage ? (
                  <img 
                    src={`/api/storage/photos/${activeUser.profileImage}`} 
                    alt={activeUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeUser.name.charAt(0).toUpperCase()
                )}
              </div>
            )
          })}
          {activeUsersInProject.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white/30">
              +{activeUsersInProject.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityIndicator
