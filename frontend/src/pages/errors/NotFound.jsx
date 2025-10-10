import React from 'react'
import ErrorPage from '../ErrorPage'

const NotFound = () => {
  return (
    <ErrorPage
      errorCode="404"
      title={['Oops!', 'Page Not', 'Found']}
      description="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
    />
  )
}

export default NotFound

