import React, { useState } from 'react'
import { TrashIcon, AlertTriangleIcon } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import useProjectStore from '../../stores/projectStore'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import apiClient from '../../utils/apiClient'
import toast from 'react-hot-toast'

const SecuritySettings = () => {
  const {
    security,
    updateSecuritySetting,
    clearAllSettings
  } = useSettingsStore()
  
  const { clearAllProjects } = useProjectStore()
  const { handleError, withErrorHandling } = useErrorHandler()
  const [isClearingData, setIsClearingData] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  
  const handleClearAllData = withErrorHandling(async () => {
    try {
      setIsClearingData(true)
      
      // Clear data from backend (if any)
      try {
        await apiClient.clearAllData?.()
      } catch (error) {
        // If backend doesn't support this endpoint, continue with local cleanup
        console.warn('Backend clear data not available:', error.message)
      }
      
      // Clear all local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear project store
      clearAllProjects()
      
      // Clear settings store
      clearAllSettings()
      
      // Clear any indexed DB or cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
      toast.success('All data has been cleared successfully')
      setShowClearConfirmation(false)
      
      // Optionally reload the page to reset the app state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      throw error // Will be handled by withErrorHandling
    } finally {
      setIsClearingData(false)
    }
  }, { operation: 'clear_all_data' })

  const ClearDataConfirmationModal = () => {
    if (!showClearConfirmation) return null
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Clear All Data</h3>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-300">
              This will permanently delete:
            </p>
            <ul className="text-sm text-gray-400 space-y-1 ml-4">
              <li>• All projects and their videos</li>
              <li>• All generated clips</li>
              <li>• All settings and preferences</li>
              <li>• All cached data</li>
              <li>• All API keys and configurations</li>
            </ul>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
              <p className="text-sm text-red-400 font-medium">
                Warning: This action is irreversible and will require you to reconfigure the application.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearConfirmation(false)}
              className="btn btn-secondary flex-1"
              disabled={isClearingData}
            >
              Cancel
            </button>
            <button
              onClick={handleClearAllData}
              disabled={isClearingData}
              className="btn btn-danger flex-1"
            >
              {isClearingData ? 'Clearing...' : 'Clear All Data'}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-300">Analytics Collection</span>
              <p className="text-xs text-gray-500">Help improve the app by sharing anonymous usage data</p>
            </div>
            <input
              type="checkbox"
              checked={security?.allowAnalytics || false}
              onChange={(e) => updateSecuritySetting('allowAnalytics', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-300">Crash Reports</span>
              <p className="text-xs text-gray-500">Automatically send crash reports to help fix bugs</p>
            </div>
            <input
              type="checkbox"
              checked={security?.allowCrashReports || true}
              onChange={(e) => updateSecuritySetting('allowCrashReports', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-300">Secure API Storage</span>
              <p className="text-xs text-gray-500">Encrypt API keys in local storage</p>
            </div>
            <input
              type="checkbox"
              checked={security?.encryptApiKeys || true}
              onChange={(e) => updateSecuritySetting('encryptApiKeys', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-300">Auto Lock</span>
              <p className="text-xs text-gray-500">Lock the app after period of inactivity</p>
            </div>
            <input
              type="checkbox"
              checked={security?.autoLock || false}
              onChange={(e) => updateSecuritySetting('autoLock', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              value={security?.dataRetentionDays || 30}
              onChange={(e) => updateSecuritySetting('dataRetentionDays', parseInt(e.target.value))}
              className="input"
              min="1"
              max="365"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto Lock Timeout (minutes)
            </label>
            <input
              type="number"
              value={security?.autoLockTimeout || 15}
              onChange={(e) => updateSecuritySetting('autoLockTimeout', parseInt(e.target.value))}
              className="input"
              min="5"
              max="120"
              disabled={!security?.autoLock}
            />
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-300">Clear All Data</span>
              <p className="text-xs text-gray-500">Remove all projects, settings, and cached data</p>
            </div>
            <button
              onClick={() => setShowClearConfirmation(true)}
              className="btn btn-danger btn-sm flex items-center gap-2"
              disabled={isClearingData}
            >
              <TrashIcon className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>
      </div>
      
      <ClearDataConfirmationModal />
    </div>
  )
}

export default SecuritySettings