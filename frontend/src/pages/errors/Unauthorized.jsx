import React from 'react'
import ErrorPage from '../ErrorPage'

const Unauthorized = () => {
  return (
    <ErrorPage
      errorCode="401"
      title={['Authentication', 'Required']}
      description="You need to be logged in to access this page. Please sign in to continue."
      showHomeButton={false}
    />
  )
}

export default Unauthorized

