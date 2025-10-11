import { useState, useEffect, memo } from 'react';
import { X, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { checkForUpdates, formatVersion } from '../services/versionService';
import { useAuth } from '../contexts/AuthContext';

/**
 * UpdateNotification Component
 * Automatically checks for updates and shows a notification banner
 * Shows for all users but only OWNER can see detailed instructions
 */
const UpdateNotification = memo(function UpdateNotification() {
  const { user } = useAuth();
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only check for updates if user is authenticated
    if (!user) return;

    // Check for updates on mount
    checkForUpdatesOnMount();

    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdatesOnMount, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const checkForUpdatesOnMount = async () => {
    try {
      setIsChecking(true);
      const result = await checkForUpdates();
      
      if (result.hasUpdate) {
        // Check if user has dismissed this version
        const dismissedVersion = localStorage.getItem('dismissed_update_version');
        const latestVersion = `${result.latest.backend}-${result.latest.frontend}`;
        
        if (dismissedVersion !== latestVersion) {
          setUpdateInfo(result);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDismiss = () => {
    if (updateInfo) {
      const latestVersion = `${updateInfo.latest.backend}-${updateInfo.latest.frontend}`;
      localStorage.setItem('dismissed_update_version', latestVersion);
    }
    setIsVisible(false);
  };

  const handleUpdate = () => {
    window.open('https://github.com/cli1337/flomark#-update', '_blank');
  };

  if (!isVisible || !updateInfo) {
    return null;
  }

  const backendNeedsUpdate = updateInfo.latest.backend !== updateInfo.current.backend;
  const frontendNeedsUpdate = updateInfo.latest.frontend !== updateInfo.current.frontend;
  const isOwner = user?.role === 'OWNER';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg animate-slideDown">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">
                  🎉 New version available!
                </p>
              </div>
              
              <div className="text-xs opacity-90 space-y-0.5 mb-2">
                {backendNeedsUpdate && (
                  <p>
                    <span className="font-medium">Backend:</span> {formatVersion(updateInfo.current.backend)} → <span className="font-semibold">{formatVersion(updateInfo.latest.backend)}</span>
                  </p>
                )}
                {frontendNeedsUpdate && (
                  <p>
                    <span className="font-medium">Frontend:</span> {formatVersion(updateInfo.current.frontend)} → <span className="font-semibold">{formatVersion(updateInfo.latest.frontend)}</span>
                  </p>
                )}
              </div>

              {isOwner && (
                <>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs underline opacity-90 hover:opacity-100 mb-2"
                  >
                    {showDetails ? '▼ Hide' : '▶ Show'} update instructions
                  </button>

                  {showDetails && (
                    <div className="mt-2 p-3 bg-black/20 rounded-md text-xs space-y-2 backdrop-blur-sm">
                      <div>
                        <p className="font-semibold mb-1">🔄 Full Update (Recommended):</p>
                        <code className="bg-black/30 px-2 py-1 rounded block font-mono">
                          sudo bash update.sh
                        </code>
                        <p className="text-white/80 mt-1 text-[10px]">
                          Updates both backend and frontend, preserves .env and storage
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/20">
                        <p className="text-white/80 text-[10px]">
                          ⚠️ <strong>Important:</strong> Always backup before updating!
                          <br />
                          📚 <a 
                            href="https://github.com/cli1337/flomark#-update" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:text-white"
                          >
                            Read full update guide →
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && (
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                Update Guide
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
})

export default UpdateNotification
