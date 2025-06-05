import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useAdaptiveUIStore } from '../../stores/adaptiveUIStore'
import {
  Sparkles,
  Brain,
  Heart,
  Zap,
  Moon,
  Sun,
  Coffee,
  Activity,
  MessageCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react'

const LivingUI = ({ children }) => {
  const {
    personality,
    uiState,
    predictions,
    isLearning,
    learningProgress,
    getPersonalityMessage,
    getAdaptiveRecommendations,
    updatePersonalityMood,
    toggleFocusMode,
    updateTheme,
    trackInteraction,
  } = useAdaptiveUIStore()
  
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState(null)
  const [particles, setParticles] = useState([])
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [currentRecommendation, setCurrentRecommendation] = useState(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Transform mouse position for parallax effects
  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [-20, 20])
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [-20, 20])
  
  // Generate ambient particles
  useEffect(() => {
    if (!uiState.ambientParticles || uiState.focusMode) return
    
    const generateParticle = () => {
      const particle = {
        id: Date.now() + Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }
      setParticles(prev => [...prev.slice(-20), particle])
    }
    
    const interval = setInterval(generateParticle, 3000)
    return () => clearInterval(interval)
  }, [uiState.ambientParticles, uiState.focusMode])
  
  // Show personality messages periodically
  useEffect(() => {
    const showMessage = () => {
      if (uiState.focusMode) return
      
      const message = getPersonalityMessage()
      setAssistantMessage(message)
      setShowAssistant(true)
      
      setTimeout(() => {
        setShowAssistant(false)
      }, 5000)
    }
    
    // Show initial message
    const initialTimeout = setTimeout(showMessage, 3000)
    
    // Show periodic messages based on mood
    const interval = setInterval(showMessage, personality.mood === 'energetic' ? 30000 : 60000)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [personality.mood, uiState.focusMode])
  
  // Show recommendations
  useEffect(() => {
    const checkRecommendations = () => {
      const recommendations = getAdaptiveRecommendations()
      if (recommendations.length > 0 && !showRecommendation) {
        setCurrentRecommendation(recommendations[0])
        setShowRecommendation(true)
      }
    }
    
    const interval = setInterval(checkRecommendations, 15000)
    return () => clearInterval(interval)
  }, [showRecommendation])
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Get theme colors
  const getThemeColors = () => {
    const themes = {
      aurora: {
        primary: 'from-purple-400 to-pink-400',
        secondary: 'from-blue-400 to-cyan-400',
        accent: 'from-green-400 to-teal-400',
        glow: 'rgba(147, 51, 234, 0.3)',
      },
      sunset: {
        primary: 'from-orange-400 to-red-400',
        secondary: 'from-yellow-400 to-orange-400',
        accent: 'from-pink-400 to-purple-400',
        glow: 'rgba(251, 146, 60, 0.3)',
      },
      ocean: {
        primary: 'from-blue-400 to-cyan-400',
        secondary: 'from-teal-400 to-green-400',
        accent: 'from-indigo-400 to-blue-400',
        glow: 'rgba(59, 130, 246, 0.3)',
      },
      forest: {
        primary: 'from-green-400 to-emerald-400',
        secondary: 'from-lime-400 to-green-400',
        accent: 'from-teal-400 to-cyan-400',
        glow: 'rgba(34, 197, 94, 0.3)',
      },
      space: {
        primary: 'from-purple-600 to-indigo-600',
        secondary: 'from-blue-600 to-purple-600',
        accent: 'from-pink-600 to-purple-600',
        glow: 'rgba(79, 70, 229, 0.3)',
      },
    }
    
    return themes[uiState.currentTheme] || themes.aurora
  }
  
  const theme = getThemeColors()
  
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Dynamic background gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: backgroundX,
          y: backgroundY,
        }}
      >
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-5`}
          style={{
            filter: uiState.isBreathing ? 'blur(100px)' : 'blur(50px)',
            transform: uiState.isBreathing ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 10s ease-in-out',
          }}
        />
      </motion.div>
      
      {/* Ambient particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: particle.y - 200,
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.5],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          >
            <Sparkles
              className={`text-${theme.primary.split('-')[1]}-400`}
              size={particle.size}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Personality Assistant */}
      <AnimatePresence>
        {showAssistant && assistantMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-8 z-50"
          >
            <div className="relative">
              {/* Assistant bubble */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm"
                style={{
                  boxShadow: `0 20px 50px ${theme.glow}`,
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <motion.div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.primary} flex items-center justify-center`}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {personality.mood === 'friendly' && <Heart className="w-6 h-6 text-white" />}
                      {personality.mood === 'focused' && <Brain className="w-6 h-6 text-white" />}
                      {personality.mood === 'energetic' && <Zap className="w-6 h-6 text-white" />}
                      {personality.mood === 'calm' && <Moon className="w-6 h-6 text-white" />}
                      {personality.mood === 'playful' && <Sparkles className="w-6 h-6 text-white" />}
                    </motion.div>
                    
                    {/* Energy indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `conic-gradient(from 0deg, ${
                            personality.energy > 66 ? '#10b981' : 
                            personality.energy > 33 ? '#f59e0b' : '#ef4444'
                          } ${personality.energy * 3.6}deg, #e5e7eb ${personality.energy * 3.6}deg)`,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {personality.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assistantMessage.text}
                    </p>
                  </div>
                </div>
                
                {/* Mood selector */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Mood:</span>
                  <div className="flex gap-1">
                    {['friendly', 'focused', 'energetic', 'calm', 'playful'].map(mood => (
                      <button
                        key={mood}
                        onClick={() => {
                          updatePersonalityMood(mood)
                          trackInteraction({ type: 'mood_change', feature: 'assistant', data: { mood } })
                        }}
                        className={`p-1 rounded transition-all ${
                          personality.mood === mood 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={mood}
                      >
                        {mood === 'friendly' && <Heart size={14} />}
                        {mood === 'focused' && <Brain size={14} />}
                        {mood === 'energetic' && <Zap size={14} />}
                        {mood === 'calm' && <Moon size={14} />}
                        {mood === 'playful' && <Sparkles size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Recommendation popup */}
      <AnimatePresence>
        {showRecommendation && currentRecommendation && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-24 right-8 z-40"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{currentRecommendation.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {currentRecommendation.message}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        currentRecommendation.action()
                        setShowRecommendation(false)
                        trackInteraction({ 
                          type: 'recommendation_accepted', 
                          feature: 'assistant', 
                          data: { type: currentRecommendation.type } 
                        })
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setShowRecommendation(false)
                        trackInteraction({ 
                          type: 'recommendation_declined', 
                          feature: 'assistant', 
                          data: { type: currentRecommendation.type } 
                        })
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Learning indicator */}
      <AnimatePresence>
        {isLearning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-3 flex items-center gap-3">
              <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Learning from your behavior...
              </span>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${learningProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Status bar */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          {/* Activity indicator */}
          <div className="flex items-center gap-2">
            <Activity 
              className={`w-4 h-4 ${
                uiState.activityLevel === 'intense' ? 'text-red-500 animate-pulse' :
                uiState.activityLevel === 'high' ? 'text-orange-500' :
                uiState.activityLevel === 'normal' ? 'text-green-500' :
                'text-gray-400'
              }`}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {uiState.activityLevel}
            </span>
          </div>
          
          {/* Time of day */}
          <div className="flex items-center gap-2">
            {uiState.timeOfDay === 'day' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : uiState.timeOfDay === 'night' ? (
              <Moon className="w-4 h-4 text-indigo-500" />
            ) : (
              <Coffee className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {uiState.timeOfDay}
            </span>
          </div>
          
          {/* Experience level */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Lvl {Math.floor(personality.experience / 10)}
            </span>
          </div>
          
          {/* Focus mode toggle */}
          <button
            onClick={() => {
              toggleFocusMode()
              trackInteraction({ type: 'toggle_focus', feature: 'status_bar' })
            }}
            className={`p-1 rounded transition-all ${
              uiState.focusMode 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Focus Mode"
          >
            <Brain size={16} />
          </button>
        </div>
      </div>
      
      {/* Main content with adaptive animations */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: uiState.focusMode ? 1.02 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
      
      {/* Breathing glow effect */}
      {uiState.isBreathing && !uiState.focusMode && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div 
            className={`w-96 h-96 rounded-full bg-gradient-to-br ${theme.primary} blur-3xl`}
          />
        </motion.div>
      )}
    </div>
  )
}

export default LivingUI 