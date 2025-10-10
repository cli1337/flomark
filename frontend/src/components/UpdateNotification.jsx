import { useState, useEffect } from 'react';
import { AlertCircle, Download, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Update Notification Component
 * Shows update warning for OWNER role users
 */
export default function UpdateNotification() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const isDismissed = localStorage.getItem('update-notification-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('update-notification-dismissed', 'true');
    setDismissed(true);
  };

  // Only show for OWNER role
  if (!user || user.role !== 'OWNER' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">System Updates Available</h3>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-white/90 mb-3">
              Keep your Flomark instance up to date with the latest features and security patches.
            </p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline text-white/90 hover:text-white mb-2"
            >
              {showDetails ? 'Hide' : 'Show'} update instructions
            </button>

            {showDetails && (
              <div className="mt-3 p-3 bg-black/20 rounded-md text-xs space-y-2">
                <div>
                  <p className="font-semibold mb-1">🔄 Update Backend Only:</p>
                  <code className="bg-black/30 px-2 py-1 rounded block">
                    ./update-backend.sh
                  </code>
                  <p className="text-white/70 mt-1 text-[10px]">
                    Updates server code, preserves .env and uploads
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-1">🎨 Update Frontend Only:</p>
                  <code className="bg-black/30 px-2 py-1 rounded block">
                    ./update-frontend.sh
                  </code>
                  <p className="text-white/70 mt-1 text-[10px]">
                    Updates UI, preserves customizations in custom/
                  </p>
                </div>

                <div className="pt-2 border-t border-white/20">
                  <p className="text-white/70 text-[10px]">
                    ⚠️ <strong>Important:</strong> Always backup before updating!
                    <br />
                    📚 <a 
                      href="https://github.com/cli1337/flomark#updates" 
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

            <div className="flex gap-2 mt-3">
              <a
                href="https://github.com/cli1337/flomark/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                View Releases
              </a>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-md transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

