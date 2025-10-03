import React, { useState } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from './ui/DropdownMenu'
import { Button } from './ui/Button'
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  UserPlus, 
  Clock, 
  Users,
  MoreVertical
} from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications, 
    deleteNotification 
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type, icon) => {
    const iconMap = {
      'check-circle': CheckCircle,
      'clock': Clock,
      'user-plus': UserPlus,
      'users': Users,
      'bell': Bell,
      'info': Info,
      'warning': AlertTriangle,
      'success': CheckCircle,
      'assignment': UserPlus
    }
    
    const IconComponent = iconMap[icon] || iconMap[type] || Bell
    return <IconComponent className="h-4 w-4" />
  }

  const getNotificationColor = (type) => {
    const colorMap = {
      'success': 'text-green-400',
      'warning': 'text-yellow-400',
      'error': 'text-red-400',
      'info': 'text-blue-400',
      'assignment': 'text-purple-400'
    }
    return colorMap[type] || 'text-blue-400'
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  className="text-xs text-gray-400 hover:text-white hover:bg-white/10 px-2 py-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                onClick={clearAllNotifications}
                variant="ghost"
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                    !notification.read ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type, notification.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-white' : 'text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
