import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const NotificationContext = createContext()

const useNotifications = () => {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)


  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotifications(parsed)
      setUnreadCount(parsed.filter(n => !n.read).length)
    } else {

      const exampleNotifications = [
        {
          id: 1,
          title: 'Welcome to TaskManager!',
          message: 'You have successfully logged in. Start by creating your first project.',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString(),
          icon: 'bell'
        },
        {
          id: 2,
          title: 'Project Created',
          message: 'Your project "My First Project" has been created successfully.',
          type: 'success',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          icon: 'check-circle'
        },
        {
          id: 3,
          title: 'Task Assignment',
          message: 'You have been assigned to a new task: "Design the homepage"',
          type: 'assignment',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          icon: 'user-plus'
        },
        {
          id: 4,
          title: 'Due Date Reminder',
          message: 'Task "Complete user authentication" is due tomorrow.',
          type: 'warning',
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          icon: 'clock'
        },
        {
          id: 5,
          title: 'Team Update',
          message: 'John Doe has joined your project "Website Redesign"',
          type: 'info',
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          icon: 'users'
        }
      ]
      setNotifications(exampleNotifications)
      setUnreadCount(exampleNotifications.filter(n => !n.read).length)
      localStorage.setItem('notifications', JSON.stringify(exampleNotifications))
    }
  }, [])


  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId)
      const newNotifications = prev.filter(n => n.id !== notificationId)
      setUnreadCount(current => notification && !notification.read ? current - 1 : current)
      return newNotifications
    })
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAllNotifications, deleteNotification])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export { useNotifications }
