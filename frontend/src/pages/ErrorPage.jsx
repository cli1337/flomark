import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ErrorPage.css'

const ErrorPage = ({ 
  errorCode = '404', 
  title = ['Oops!', 'Page Not', 'Found'],
  description = "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
  showHomeButton = true 
}) => {
  const navigate = useNavigate()

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/projects')
    }
  }

  const goHome = () => {
    navigate('/projects')
  }

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        goBack()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="error-page">
      {/* Animated background */}
      <div className="error-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Main content */}
      <div className="error-container">
        <div className="error-content">
          {/* Status Badge */}
          <div className="status-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span>Error {errorCode}</span>
          </div>

          {/* Title */}
          <h1 className="error-title">
            {title.map((line, index) => (
              <span 
                key={index} 
                className={`title-line ${index === title.length - 1 ? 'gradient-text' : ''}`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {line}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p className="error-description">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={goBack} className="back-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M13 3l-7 7 7 7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>Go Back</span>
            </button>
            {showHomeButton && (
              <button onClick={goHome} className="home-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M9 22V12h6v10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Go Home</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ animationDelay: `${-i * 2}s` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default ErrorPage

