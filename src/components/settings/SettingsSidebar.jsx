import React from 'react'
import {
  KeyIcon,
  CpuIcon,
  PaletteIcon,
  ShieldIcon,
  RefreshCwIcon
} from 'lucide-react'

const SettingsSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'api', label: 'API & Models', icon: KeyIcon },
    { id: 'app', label: 'Application', icon: PaletteIcon },
    { id: 'performance', label: 'Performance', icon: CpuIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    { id: 'adaptive', label: 'Adaptive UI', icon: RefreshCwIcon },
  ]
  
  return (
    <div className="w-64 space-y-1">
      {tabs.map(tab => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default SettingsSidebar