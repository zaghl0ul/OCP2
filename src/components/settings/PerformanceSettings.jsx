import React from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

const PerformanceSettings = () => {
  const {
    performance,
    updatePerformanceSetting
  } = useSettingsStore()
  
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Performance Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Processing Quality
            </label>
            <select
              value={performance?.videoQuality || 'medium'}
              onChange={(e) => updatePerformanceSetting('videoQuality', e.target.value)}
              className="input"
            >
              <option value="low">Low (Faster)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Better Quality)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Concurrent Processing
            </label>
            <input
              type="number"
              value={performance?.maxConcurrentJobs || 2}
              onChange={(e) => updatePerformanceSetting('maxConcurrentJobs', parseInt(e.target.value))}
              className="input"
              min="1"
              max="8"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Hardware Acceleration</span>
            <input
              type="checkbox"
              checked={performance?.hardwareAcceleration || false}
              onChange={(e) => updatePerformanceSetting('hardwareAcceleration', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Cache Previews</span>
            <input
              type="checkbox"
              checked={performance?.cachePreviews || true}
              onChange={(e) => updatePerformanceSetting('cachePreviews', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Memory Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cache Size (MB)
            </label>
            <input
              type="number"
              value={performance?.cacheSize || 512}
              onChange={(e) => updatePerformanceSetting('cacheSize', parseInt(e.target.value))}
              className="input"
              min="128"
              max="4096"
              step="128"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Auto Clear Cache</span>
            <input
              type="checkbox"
              checked={performance?.autoClearCache || true}
              onChange={(e) => updatePerformanceSetting('autoClearCache', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceSettings