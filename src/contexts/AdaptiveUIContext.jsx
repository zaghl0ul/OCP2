import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useAdaptiveUIStore } from '../stores/adaptiveUIStore'

const AdaptiveUIContext = createContext({})

export const useAdaptiveUI = () => {
  const context = useContext(AdaptiveUIContext)
  if (!context) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider')
  }
  return context
}

export const AdaptiveUIProvider = ({ children }) => {
  const { trackInteraction, userPatterns, adaptations } = useAdaptiveUIStore()
  const interactionTimeouts = useRef(new Map())
  const hoverStartTimes = useRef(new Map())

  // Track click interactions
  const trackClick = (element, feature, data = {}) => {
    const rect = element.getBoundingClientRect()
    const zone = getZoneFromCoordinates(rect.left + rect.width / 2, rect.top + rect.height / 2)
    
    trackInteraction({
      type: 'click',
      feature,
      zone,
      coordinates: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      data,
    })
  }

  // Track hover interactions
  const trackHover = (element, feature, data = {}) => {
    const elementId = `${feature}-${Date.now()}`
    hoverStartTimes.current.set(elementId, Date.now())
    
    return () => {
      const startTime = hoverStartTimes.current.get(elementId)
      if (startTime) {
        const duration = Date.now() - startTime
        if (duration > 500) { // Only track meaningful hovers
          const rect = element.getBoundingClientRect()
          const zone = getZoneFromCoordinates(rect.left + rect.width / 2, rect.top + rect.height / 2)
          
          trackInteraction({
            type: 'hover',
            feature,
            zone,
            duration,
            data,
          })
        }
        hoverStartTimes.current.delete(elementId)
      }
    }
  }

  // Track time spent in areas
  const trackTimeInArea = (area, startTime = Date.now()) => {
    const timeoutId = setTimeout(() => {
      trackInteraction({
        type: 'time_spent',
        feature: area,
        zone: area,
        duration: Date.now() - startTime,
      })
    }, 5000) // Track after 5 seconds
    
    interactionTimeouts.current.set(area, timeoutId)
    
    return () => {
      const timeout = interactionTimeouts.current.get(area)
      if (timeout) {
        clearTimeout(timeout)
        interactionTimeouts.current.delete(area)
        
        const duration = Date.now() - startTime
        if (duration > 1000) { // Only track if spent more than 1 second
          trackInteraction({
            type: 'time_spent',
            feature: area,
            zone: area,
            duration,
          })
        }
      }
    }
  }

  // Track tool usage
  const trackToolUse = (tool, action, data = {}) => {
    trackInteraction({
      type: 'tool_use',
      feature: tool,
      action,
      data,
    })
  }

  // Track workflow patterns
  const trackWorkflow = (workflow, step, data = {}) => {
    trackInteraction({
      type: 'workflow',
      feature: workflow,
      step,
      data,
    })
  }

  // Get zone from screen coordinates
  const getZoneFromCoordinates = (x, y) => {
    const width = window.innerWidth
    const height = window.innerHeight
    
    // Divide screen into zones
    if (x < width * 0.2) return 'sidebar'
    if (x > width * 0.8) return 'right-panel'
    if (y < height * 0.15) return 'header'
    if (y > height * 0.85) return 'footer'
    if (y > height * 0.7) return 'timeline'
    return 'main-content'
  }

  // Get adaptive styles for elements
  const getAdaptiveStyles = (feature) => {
    const isPrioritized = adaptations.prioritizedFeatures.includes(feature)
    const isHidden = adaptations.hiddenFeatures.includes(feature)
    
    if (isHidden) {
      return {
        opacity: 0.5,
        pointerEvents: 'none',
      }
    }
    
    if (isPrioritized) {
      return {
        transform: 'scale(1.02)',
        boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
        borderColor: 'rgb(59 130 246)',
      }
    }
    
    return {}
  }

  // Get adaptive class names
  const getAdaptiveClasses = (feature, baseClasses = '') => {
    const isPrioritized = adaptations.prioritizedFeatures.includes(feature)
    const isHidden = adaptations.hiddenFeatures.includes(feature)
    
    let classes = baseClasses
    
    if (isPrioritized) {
      classes += ' ring-2 ring-primary-500/50 animate-glow'
    }
    
    if (isHidden) {
      classes += ' opacity-50 pointer-events-none'
    }
    
    return classes
  }

  // Check if feature should be highlighted
  const shouldHighlight = (feature) => {
    return adaptations.prioritizedFeatures.includes(feature)
  }

  // Get recommended position for floating elements
  const getRecommendedPosition = (elementType) => {
    const zones = userPatterns.interactionZones
    
    // Position elements near frequently used zones
    if (zones.includes('sidebar')) {
      return { side: 'left', offset: 20 }
    }
    if (zones.includes('right-panel')) {
      return { side: 'right', offset: 20 }
    }
    if (zones.includes('main-content')) {
      return { side: 'center', offset: 0 }
    }
    
    return { side: 'right', offset: 20 } // Default
  }

  // Enhanced click handler with adaptive learning
  const createAdaptiveClickHandler = (feature, originalHandler, data = {}) => {
    return (event) => {
      trackClick(event.currentTarget, feature, data)
      
      // Add visual feedback for learning
      const element = event.currentTarget
      element.classList.add('animate-adaptive-highlight')
      setTimeout(() => {
        element.classList.remove('animate-adaptive-highlight')
      }, 1000)
      
      if (originalHandler) {
        originalHandler(event)
      }
    }
  }

  // Enhanced hover handlers
  const createAdaptiveHoverHandlers = (feature, data = {}) => {
    let cleanup = null
    
    return {
      onMouseEnter: (event) => {
        cleanup = trackHover(event.currentTarget, feature, data)
      },
      onMouseLeave: () => {
        if (cleanup) cleanup()
      },
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      interactionTimeouts.current.forEach(timeout => clearTimeout(timeout))
      interactionTimeouts.current.clear()
      hoverStartTimes.current.clear()
    }
  }, [])

  const contextValue = {
    // Tracking functions
    trackClick,
    trackHover,
    trackTimeInArea,
    trackToolUse,
    trackWorkflow,
    
    // Adaptive styling
    getAdaptiveStyles,
    getAdaptiveClasses,
    shouldHighlight,
    getRecommendedPosition,
    
    // Enhanced handlers
    createAdaptiveClickHandler,
    createAdaptiveHoverHandlers,
    
    // State
    userPatterns,
    adaptations,
  }

  return (
    <AdaptiveUIContext.Provider value={contextValue}>
      {children}
    </AdaptiveUIContext.Provider>
  )
}