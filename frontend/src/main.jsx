import React from 'react'
import ReactDOM from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import './index.css'
import '@radix-ui/themes/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Theme>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Theme>
  </React.StrictMode>,
)
