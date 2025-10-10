import React, { useState } from 'react'
import ErrorPage from '../ErrorPage'
import { NotFound, Forbidden, ServerError, Unauthorized } from './index'

const ErrorShowcase = () => {
  const [currentError, setCurrentError] = useState('404')

  const renderError = () => {
    switch (currentError) {
      case '404':
        return <NotFound />
      case '403':
        return <Forbidden />
      case '401':
        return <Unauthorized />
      case '500':
        return <ServerError />
      case 'custom':
        return (
          <ErrorPage
            errorCode="418"
            title={["I'm a", "Teapot"]}
            description="The requested entity body is short and stout."
          />
        )
      default:
        return <NotFound />
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Error selector overlay */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setCurrentError('404')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: currentError === '404' ? 'white' : 'transparent',
            color: currentError === '404' ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          404
        </button>
        <button
          onClick={() => setCurrentError('403')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: currentError === '403' ? 'white' : 'transparent',
            color: currentError === '403' ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          403
        </button>
        <button
          onClick={() => setCurrentError('401')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: currentError === '401' ? 'white' : 'transparent',
            color: currentError === '401' ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          401
        </button>
        <button
          onClick={() => setCurrentError('500')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: currentError === '500' ? 'white' : 'transparent',
            color: currentError === '500' ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          500
        </button>
        <button
          onClick={() => setCurrentError('custom')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: currentError === 'custom' ? 'white' : 'transparent',
            color: currentError === 'custom' ? '#000' : '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Custom
        </button>
      </div>

      {/* Render selected error */}
      {renderError()}
    </div>
  )
}

export default ErrorShowcase

