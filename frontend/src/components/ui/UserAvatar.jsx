import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from './Avatar'

const UserAvatar = ({ 
  user, 
  className = '', 
  fallbackClassName = '',
  showImage = true 
}) => {
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.charAt(0).toUpperCase()
  }

  const profileImageUrl = user?.profileImage 
    ? `/api/storage/photos/${user.profileImage}` 
    : null

  return (
    <Avatar className={className}>
      {showImage && profileImageUrl && (
        <AvatarImage 
          src={profileImageUrl} 
          alt={user?.name || 'User'} 
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar

