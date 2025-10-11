import { useEffect, useState } from 'react';
import { Eye, RefreshCw, X } from 'lucide-react';
import demoDataService from '../services/demoDataService';

/**
 * Demo Mode Banner Component
 * Displays a banner when the app is in client-side demo mode
 */
export default function DemoModeBanner() {
  const [isDemoActive, setIsDemoActive] = useState(false);

  useEffect(() => {
    setIsDemoActive(demoDataService.isDemoMode());
  }, []);

  const handleReset = () => {
    demoDataService.resetDemoData();
    window.location.reload();
  };

  const handleExit = () => {
    if (confirm('Exit demo mode? This will clear all demo data and require login.')) {
      demoDataService.disableDemoMode();
      window.location.href = '/login';
    }
  };

  if (!isDemoActive) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Eye className="w-4 h-4" />
          <span className="font-medium">Demo Mode Active</span>
          <span className="hidden sm:inline">• Try all features without signup!</span>
          <span className="hidden sm:inline opacity-80">• All data stored in your browser</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
            title="Reset demo data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
            title="Exit demo mode"
          >
            <X className="w-3 h-3" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

