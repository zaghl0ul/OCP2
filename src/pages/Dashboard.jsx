import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video,
  Upload,
  TrendingUp,
  Clock,
  Play,
  Plus,
  Sparkles,
  Brain,
  Target,
  Zap,
  Coffee,
  ChevronRight
} from 'lucide-react'
import useProjectStore from '../stores/projectStore'
import { useAdaptiveUIStore } from '../stores/adaptiveUIStore'
import { useAdaptiveUI } from '../contexts/AdaptiveUIContext'
import StatsCard from '../components/dashboard/StatsCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import QuickActions from '../components/dashboard/QuickActions'
import { useDashboard } from '../hooks/useDashboard'

const Dashboard = () => {
  const navigate = useNavigate()
  const { projects } = useProjectStore()
  const { personality, uiState, predictions } = useAdaptiveUIStore()
  const { createAdaptiveClickHandler } = useAdaptiveUI()
  const { stats, recentActivity, loading } = useDashboard()
  const [timeGreeting, setTimeGreeting] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState('')
  
  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeGreeting('Good morning')
    else if (hour < 18) setTimeGreeting('Good afternoon')
    else setTimeGreeting('Good evening')
    
    // Random motivational quotes based on personality mood
    const quotes = {
      friendly: [
        "Let's create something amazing together!",
        "Your creativity is inspiring!",
        "Ready to make magic happen?"
      ],
      focused: [
        "Time to get things done.",
        "Focus leads to excellence.",
        "Efficiency is key today."
      ],
      energetic: [
        "You're on fire today! 🔥",
        "High energy, high results!",
        "Let's crush those goals!"
      ],
      calm: [
        "Take it one step at a time.",
        "Quality over quantity.",
        "Peaceful productivity."
      ],
      playful: [
        "Let's have some fun with this!",
        "Creativity loves play!",
        "Time to experiment!"
      ]
    }
    
    const moodQuotes = quotes[personality.mood] || quotes.friendly
    setMotivationalQuote(moodQuotes[Math.floor(Math.random() * moodQuotes.length)])
  }, [personality.mood])
  
  const handleCreateProject = createAdaptiveClickHandler('create-project-dashboard', () => {
    navigate('/projects?create=true')
  })
  
  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }
  
  // Adaptive layout based on user patterns
  const getLayoutPriority = () => {
    if (uiState.activityLevel === 'intense') return 'compact'
    if (personality.mood === 'focused') return 'minimal'
    return 'standard'
  }
  
  const layoutPriority = getLayoutPriority()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Brain className="w-full h-full text-blue-500" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">
            {personality.name} is preparing your workspace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            }}
            animate={{
              x: [0, 100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        
        <div className="relative z-10">
          <motion.h1 
            className="text-3xl font-bold mb-2"
            animate={{
              scale: personality.mood === 'energetic' ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: personality.mood === 'energetic' ? Infinity : 0,
            }}
          >
            {timeGreeting}, Creator!
          </motion.h1>
          <p className="text-lg opacity-90 mb-6">{motivationalQuote}</p>
          
          {/* Quick stats in header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4" />
                <span className="text-sm opacity-80">Projects</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Play className="w-4 h-4" />
                <span className="text-sm opacity-80">Total Clips</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalClips}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm opacity-80">Avg Score</span>
              </div>
              <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm opacity-80">Productivity</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{personality.experience}%</p>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Adaptive Quick Actions */}
      <AnimatePresence>
        {predictions.nextAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Predicted Next Action
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {predictions.nextAction.suggestion}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (predictions.nextAction.action === 'upload') {
                    navigate('/projects?create=true')
                  } else if (predictions.nextAction.action === 'export') {
                    navigate('/clips')
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>Go</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Grid */}
      <div className={`grid ${
        layoutPriority === 'compact' 
          ? 'grid-cols-1 lg:grid-cols-3 gap-4' 
          : 'grid-cols-1 lg:grid-cols-2 gap-6'
      }`}>
        {/* Quick Actions - Adaptive positioning */}
        <motion.div 
          className={`${layoutPriority === 'compact' ? 'lg:col-span-1' : 'lg:col-span-2'}`}
          layout
        >
          <QuickActions />
        </motion.div>
        
        {/* Recent Projects */}
        <motion.div 
          className={`${layoutPriority === 'compact' ? 'lg:col-span-2' : 'lg:col-span-1'}`}
          layout
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Projects
              </h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No projects yet. Start by creating one!
                </p>
                <button
                  onClick={handleCreateProject}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProjectClick(project.id)}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all living-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>{project.clips?.length || 0} clips</span>
                          <span>•</span>
                          <span>{new Date(project.created_at || project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.status === 'analyzing' && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Brain className="w-4 h-4" />
                            </motion.div>
                            <span className="text-sm">Analyzing</span>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Activity & AI Insights */}
        <motion.div 
          className={`${layoutPriority === 'compact' ? 'lg:col-span-3' : 'lg:col-span-1'}`}
          layout
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard