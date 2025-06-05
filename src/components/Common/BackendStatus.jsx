import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import apiService from '../../services/api';

const BackendStatus = () => {
  const isBackendConnected = useSettingsStore((state) => state.isBackendConnected);
  const [isChecking, setIsChecking] = useState(false);
  const [statusDetails, setStatusDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const healthResponse = await apiService.healthCheck();
      setStatusDetails(healthResponse);
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatusDetails({
        status: 'unhealthy',
        error: error.message
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check status on mount
    checkBackendStatus();
    
    // Set up interval to check periodically
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-md ${
          isBackendConnected 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        <div className="relative">
          <Server className="w-4 h-4" />
          {isChecking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
        <span className="text-xs font-medium">
          {isBackendConnected ? 'Backend Connected' : 'Backend Disconnected'}
        </span>
      </button>
      
      {showDetails && statusDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white rounded-lg shadow-lg p-4 min-w-[300px]">
          <h3 className="text-sm font-medium mb-2">Backend Status</h3>
          <div className="space-y-1 text-xs">
            <div>Status: {statusDetails.status}</div>
            {statusDetails.version && <div>Version: {statusDetails.version}</div>}
            {statusDetails.timestamp && <div>Last Check: {new Date(statusDetails.timestamp).toLocaleTimeString()}</div>}
            {statusDetails.error && <div className="text-red-400">Error: {statusDetails.error}</div>}
          </div>
          
          <button
            onClick={checkBackendStatus}
            className="mt-3 w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          >
                Refresh Status
          </button>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;