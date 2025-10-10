import { useEffect, useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import api from '../services/api';

/**
 * Demo Mode Banner Component
 * Displays a banner when the app is in demo mode
 */
export default function DemoModeBanner() {
  const [demoInfo, setDemoInfo] = useState(null);

  useEffect(() => {
    checkDemoMode();
    // Refresh demo info every minute
    const interval = setInterval(checkDemoMode, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkDemoMode = async () => {
    try {
      const response = await api.get('/demo-info');
      if (response.data.demoMode) {
        setDemoInfo(response.data);
      }
    } catch (error) {
      console.error('Error checking demo mode:', error);
    }
  };

  if (!demoInfo) return null;

  const resetMinutes = demoInfo.stats?.timeUntilReset || 0;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm flex-wrap">
        <Eye className="w-4 h-4" />
        <span className="font-medium">Demo Mode Active</span>
        <span className="hidden sm:inline">• Logged in as demo@flomark.app</span>
        {resetMinutes > 0 && (
          <span className="hidden sm:inline">
            Resets in {resetMinutes} min
          </span>
        )}
      </div>
    </div>
  );
}

