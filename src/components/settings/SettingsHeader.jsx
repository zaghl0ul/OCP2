import React from 'react'
import { DownloadIcon, UploadIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '../../stores/settingsStore'

const SettingsHeader = () => {
  const {
    exportSettings: exportSettingsData,
    importSettings
  } = useSettingsStore()
  
  const handleExportSettings = () => {
    try {
      const data = exportSettingsData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'openclip-settings.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Settings exported successfully')
    } catch (error) {
      toast.error('Failed to export settings')
    }
  }
  
  const handleImportSettings = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = importSettings(e.target.result)
        if (result.success) {
          toast.success('Settings imported successfully')
        } else {
          toast.error(`Import failed: ${result.error}`)
        }
      } catch (error) {
        toast.error('Failed to import settings')
      }
    }
    reader.readAsText(file)
  }
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-gray-400">Configure your OpenClip Pro experience</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportSettings}
          className="btn btn-secondary btn-sm"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export
        </button>
        <label className="btn btn-secondary btn-sm cursor-pointer">
          <UploadIcon className="w-4 h-4 mr-2" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}

export default SettingsHeader