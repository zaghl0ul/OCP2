import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdaptiveUIProvider } from './contexts/AdaptiveUIContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Clips from './pages/Clips';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import useProjectStore from './stores/projectStore';
import { useSettingsStore } from './stores/settingsStore';
import toast from 'react-hot-toast';
import './index.css';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  
  const initializeProject = useProjectStore((state) => state.initialize);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const isBackendConnected = useSettingsStore((state) => state.isBackendConnected);
  
  useEffect(() => {
    // Initialize stores on app startup
    const initializeApp = async () => {
      setIsInitializing(true);
      setInitError(null);
      
      try {
        // Initialize settings first (contains backend connection info)
        await initializeSettings();
        
        // Then initialize projects
        await initializeProject();
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error.message || 'Failed to initialize application');
        setIsInitializing(false);
        toast.error('Application initialization failed. Please check if backend is running.');
      }
    };
    
    initializeApp();
  }, [initializeProject, initializeSettings]);
  
  // Show loading state or error during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Initializing Application...</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we set things up</p>
        </div>
      </div>
    );
  }
  
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Initialization Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <AdaptiveUIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={<Layout><Dashboard /></Layout>} 
          />
          <Route 
            path="/projects" 
            element={<Layout><Projects /></Layout>} 
          />
          <Route 
            path="/projects/:id" 
            element={<Layout><ProjectDetail /></Layout>} 
          />
          <Route 
            path="/clips" 
            element={<Layout><Clips /></Layout>} 
          />
          <Route 
            path="/analytics" 
            element={<Layout><Analytics /></Layout>} 
          />
          <Route 
            path="/settings" 
            element={<Layout><Settings /></Layout>} 
          />
        </Routes>
      </Router>
    </AdaptiveUIProvider>
  );
}

export default App