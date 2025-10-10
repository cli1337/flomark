import React from 'react'
import ErrorPage from '../ErrorPage'

const ServerError = () => {
  return (
    <ErrorPage
      errorCode="500"
      title={['Server', 'Error']}
      description="Something went wrong on our end. We're working to fix it. Please try again later."
    />
  )
}

export default ServerError

