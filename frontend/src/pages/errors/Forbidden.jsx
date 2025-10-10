import React from 'react'
import ErrorPage from '../ErrorPage'

const Forbidden = () => {
  return (
    <ErrorPage
      errorCode="403"
      title={['Access', 'Denied']}
      description="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
    />
  )
}

export default Forbidden

