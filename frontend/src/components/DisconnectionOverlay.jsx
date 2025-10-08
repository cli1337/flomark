import React from 'react'
import { WifiOff, RefreshCw, Server } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'

const DisconnectionOverlay = ({ isConnected, isReconnecting = false }) => {
  if (isConnected) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-red-500/30 p-4 rounded-full">
                <WifiOff className="h-12 w-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Server Disconnected
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center mb-6">
            The connection to the server has been lost. You cannot make changes until the connection is restored.
          </p>

          {/* Status */}
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              {isReconnecting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="text-yellow-400 font-medium">
                    Attempting to reconnect...
                  </span>
                </>
              ) : (
                <>
                  <Server className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-medium">
                    No connection to server
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-black/20 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center mb-2">
              <strong className="text-white">Troubleshooting:</strong>
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Check if the backend server is running</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Verify your internet connection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Refresh the page once the server is online</span>
              </li>
            </ul>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisconnectionOverlay

