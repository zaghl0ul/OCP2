import React from 'react'
import { useAdaptiveUIStore } from '../../stores/adaptiveUIStore'

const AdaptiveSettings = () => {
  const {
    userPatterns,
    resetAdaptations,
    getAdaptiveRecommendations
  } = useAdaptiveUIStore()
  
  const recommendations = getAdaptiveRecommendations()
  
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Learning Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Frequent Tools</h4>
            <div className="space-y-1">
              {userPatterns.frequentTools.length > 0 ? (
                userPatterns.frequentTools.map(tool => (
                  <div key={tool} className="text-sm text-gray-400">
                    {tool}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No patterns detected yet</div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Interaction Zones</h4>
            <div className="space-y-1">
              {userPatterns.interactionZones.length > 0 ? (
                userPatterns.interactionZones.map(zone => (
                  <div key={zone} className="text-sm text-gray-400">
                    {zone}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No patterns detected yet</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Preferred Clip Length: {userPatterns.preferredClipLength}s
            </span>
            <button
              onClick={resetAdaptations}
              className="btn btn-secondary btn-sm"
            >
              Reset Learning
            </button>
          </div>
        </div>
      </div>
      
      {recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                <span className="text-sm text-gray-300">{rec.message}</span>
                <button
                  onClick={rec.action}
                  className="btn btn-primary btn-sm"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdaptiveSettings