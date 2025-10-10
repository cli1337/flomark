import { useEffect, useState } from 'react';
import { Info, Eye } from 'lucide-react';
import api from '../services/api';

/**
 * Demo Mode Banner Component
 * Displays a banner when the app is in demo mode
 */
export default function DemoModeBanner() {
  const [demoMode, setDemoMode] = useState(false);
  const [demoProjectId, setDemoProjectId] = useState(null);

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    try {
      const response = await api.get('/api/demo-info');
      setDemoMode(response.data.demoMode);
      setDemoProjectId(response.data.demoProjectId);
    } catch (error) {
      console.error('Error checking demo mode:', error);
    }
  };

  if (!demoMode) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <Eye className="w-4 h-4" />
        <span className="font-medium">Demo Mode Active</span>
        <span className="hidden sm:inline">• Anyone can view and edit this project</span>
        {demoProjectId && (
          <a 
            href={`/projects/${demoProjectId}`}
            className="ml-2 underline hover:text-purple-100 transition-colors"
          >
            View Demo Project →
          </a>
        )}
      </div>
    </div>
  );
}

