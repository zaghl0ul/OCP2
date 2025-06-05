import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import LivingUI from '../Common/LivingUI'
import BackendStatus from '../Common/BackendStatus'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAdaptiveUIStore } from '../../stores/adaptiveUIStore'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { initializeAdaptiveUI } = useAdaptiveUIStore()
  const appSettings = useSettingsStore((state) => state.app)
  
  // Initialize adaptive UI when layout mounts
  useEffect(() => {
    initializeAdaptiveUI()
  }, [initializeAdaptiveUI])
  
  return (
    <LivingUI>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${
        appSettings?.theme === 'dark' ? 'dark' : ''
      }`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
        <main className="lg:pl-80 pt-16 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
          {children}
          </motion.div>
        </main>
        
          <BackendStatus />
      </div>
    </LivingUI>
  )
}

export default Layout