import React from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

const AppSettings = () => {
  const {
    app,
    export: exportSettings,
    updateAppSetting,
    updateExportSetting
  } = useSettingsStore()
  
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Application Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={app.theme}
              onChange={(e) => updateAppSetting('theme', e.target.value)}
              className="input"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={app.language}
              onChange={(e) => updateAppSetting('language', e.target.value)}
              className="input"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Auto Save</span>
            <input
              type="checkbox"
              checked={app.autoSave}
              onChange={(e) => updateAppSetting('autoSave', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto Save Interval (seconds)
            </label>
            <input
              type="number"
              value={app.autoSaveInterval}
              onChange={(e) => updateAppSetting('autoSaveInterval', parseInt(e.target.value))}
              className="input"
              min="10"
              max="300"
            />
          </div>
        </div>
      </div>
      
      {/* Export Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Export Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Format
            </label>
            <select
              value={exportSettings.defaultFormat}
              onChange={(e) => updateExportSetting('defaultFormat', e.target.value)}
              className="input"
            >
              <option value="mp4">MP4</option>
              <option value="mov">MOV</option>
              <option value="avi">AVI</option>
              <option value="webm">WebM</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Default Quality
            </label>
            <select
              value={exportSettings.defaultQuality}
              onChange={(e) => updateExportSetting('defaultQuality', e.target.value)}
              className="input"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="1440p">1440p</option>
              <option value="4k">4K</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Include Metadata</span>
            <input
              type="checkbox"
              checked={exportSettings.includeMetadata}
              onChange={(e) => updateExportSetting('includeMetadata', e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Auto Open After Export</span>
            <input
              type="checkbox"
              checked={exportSettings.autoOpenAfterExport}
              onChange={(e) => updateExportSetting('autoOpenAfterExport', e.target.checked)}
              className="rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppSettings