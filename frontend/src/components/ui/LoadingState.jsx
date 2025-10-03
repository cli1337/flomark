import React from 'react'
import LoadingSpinner from './LoadingSpinner'

const LoadingState = ({ 
  message = "Loading...", 
  size = "h-4 w-4", 
  className = "",
  spinnerClassName = "text-gray-400"
}) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="flex items-center gap-3 text-gray-400">
        <LoadingSpinner size={size} className={spinnerClassName} />
        <span>{message}</span>
      </div>
    </div>
  )
}

export default LoadingState
