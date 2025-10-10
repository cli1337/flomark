import React from 'react'
import ErrorPage from '../pages/ErrorPage'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          errorCode="500"
          title={['Something', 'Went', 'Wrong']}
          description="An unexpected error occurred. We've logged the issue and will look into it. Please try refreshing the page."
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

