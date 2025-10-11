import { useEffect, useState, memo } from 'react';
import { Eye } from 'lucide-react';
import api from '../services/api';

/**
 * Demo Mode Banner Component
 * Displays a banner when the backend is in demo mode
 */
const DemoModeBanner = memo(function DemoModeBanner() {
  const [demoInfo, setDemoInfo] = useState(null);

  useEffect(() => {
    checkDemoMode();
  }, []);

  const checkDemoMode = async () => {
    try {
      const response = await api.get('/demo-info');
      if (response.data.demoMode) {
        setDemoInfo(response.data);
      }
    } catch (error) {
      // Silently fail if backend is not available
      console.log('Could not check demo mode');
    }
  };

  if (!demoInfo) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm flex-wrap">
        <Eye className="w-4 h-4" />
        <span className="font-medium">Demo Mode Active</span>
        <span className="hidden sm:inline">• Logged in as {demoInfo.demoUser?.email}</span>
      </div>
    </div>
  );
})

export default DemoModeBanner

