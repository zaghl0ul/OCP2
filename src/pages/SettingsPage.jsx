import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAdaptiveUI } from '../contexts/AdaptiveUIContext'
import {
  ApiSettings,
  AppSettings,
  AdaptiveSettings,
  PerformanceSettings,
  SecuritySettings,
  SettingsHeader,
  SettingsSidebar
} from '../components/settings'

const SettingsPage = () => {
  const { trackTimeInArea } = useAdaptiveUI()
  const [activeTab, setActiveTab] = useState('api')
  
  useEffect(() => {
    const cleanup = trackTimeInArea('settings')
    return cleanup
  }, [])
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'api':
        return <ApiSettings />
      case 'app':
        return <AppSettings />
      case 'performance':
        return <PerformanceSettings />
      case 'security':
        return <SecuritySettings />
      case 'adaptive':
        return <AdaptiveSettings />
      default:
        return <div className="text-center text-gray-400">Coming soon...</div>
    }
  }
  
  return (
    <div className="p-6">
      <SettingsHeader />
      
      <div className="flex gap-6">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage