import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  SettingsIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlayIcon,
  ScissorsIcon,
  DownloadIcon,
  UsersIcon,
  ZapIcon
} from 'lucide-react'
import useProjectStore from '../../stores/projectStore'
import { useAdaptiveUIStore } from '../../stores/adaptiveUIStore'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'
import toast from 'react-hot-toast'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import apiClient from '../../utils/apiClient'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, getRecentProjects, getProjectStats } = useProjectStore()
  const { userPatterns, adaptations } = useAdaptiveUIStore()
  const { trackTimeInArea, createAdaptiveClickHandler } = useAdaptiveUI()
  const { handleError, withErrorHandling } = useErrorHandler()
  
  const [expandedSections, setExpandedSections] = useState({
    recent: true,
    tools: true,
    stats: false
  })
  
  useEffect(() => {
    if (isOpen) {
      const cleanup = trackTimeInArea('sidebar')
      return cleanup
    }
  }, [isOpen, trackTimeInArea])
  
  const recentProjects = getRecentProjects(5)
  const stats = getProjectStats()
  
  const mainNavItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      description: 'Overview & analytics'
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: FolderIcon,
      description: 'Manage your projects'
    },
    {
      path: '/clips',
      label: 'All Clips',
      icon: PlayIcon,
      description: 'Browse all clips'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: TrendingUpIcon,
      description: 'Performance insights'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
      description: 'App configuration'
    }
  ]
  
  const handleQuickAnalyze = withErrorHandling(async () => {
    try {
      // Check if there are any projects with videos but no analysis
      const unanalyzedProjects = projects.filter(p => 
        p.video && (!p.clips || p.clips.length === 0) && p.status !== 'analyzing'
      )
      
      if (unanalyzedProjects.length === 0) {
        toast.info('No projects available for quick analysis. Upload a video first!')
        navigate('/projects')
        onClose()
        return
      }

      // If there's only one project, analyze it directly
      if (unanalyzedProjects.length === 1) {
        const project = unanalyzedProjects[0]
        navigate(`/projects/${project.id}?action=analyze`)
        onClose()
        return
      }

      // If multiple projects, show selection or navigate to projects page
      navigate('/projects?filter=unanalyzed')
      onClose()
      toast.info('Select a project to analyze from the list')
    } catch (error) {
      throw error
    }
  }, { operation: 'quick_analyze' })

  const handleTrimClips = withErrorHandling(async () => {
    try {
      // Find projects with clips that can be trimmed
      const projectsWithClips = projects.filter(p => p.clips && p.clips.length > 0)
      
      if (projectsWithClips.length === 0) {
        toast.info('No clips available for trimming. Analyze a video first!')
        navigate('/projects')
        onClose()
        return
      }

      // Navigate to clips page with trim mode
      navigate('/clips?mode=trim')
      onClose()
      toast.info('Select clips to trim from the list')
    } catch (error) {
      throw error
    }
  }, { operation: 'trim_clips' })

  const handleQuickExport = withErrorHandling(async () => {
    try {
      // Find projects with completed clips
      const projectsWithClips = projects.filter(p => 
        p.clips && p.clips.length > 0 && p.status === 'completed'
      )
      
      if (projectsWithClips.length === 0) {
        toast.info('No completed projects available for export!')
        navigate('/projects')
        onClose()
        return
      }

      // If there's only one project, export it directly
      if (projectsWithClips.length === 1) {
        const project = projectsWithClips[0]
        
        const exportSettings = {
          format: 'mp4',
          quality: 'high',
          includeAll: true
        }
        
        await apiClient.exportClips(project.id, exportSettings)
        toast.success(`Exporting clips from "${project.name}". You'll receive a download link shortly.`)
        onClose()
        return
      }

      // If multiple projects, navigate to projects page with export filter
      navigate('/projects?filter=completed')
      onClose()
      toast.info('Select a project to export from the list')
    } catch (error) {
      throw error
    }
  }, { operation: 'quick_export' })
  
  const quickTools = [
    {
      id: 'analyze',
      label: 'Quick Analyze',
      icon: PlayIcon,
      action: handleQuickAnalyze,
      usage: userPatterns.frequentTools.filter(t => t === 'analyze').length,
      description: 'Analyze unprocessed videos'
    },
    {
      id: 'trim',
      label: 'Trim Clips',
      icon: ScissorsIcon,
      action: handleTrimClips,
      usage: userPatterns.frequentTools.filter(t => t === 'trim').length,
      description: 'Edit existing clips'
    },
    {
      id: 'export',
      label: 'Export',
      icon: DownloadIcon,
      action: handleQuickExport,
      usage: userPatterns.frequentTools.filter(t => t === 'export').length,
      description: 'Download completed clips'
    }
  ]
  
  // Sort tools by usage for adaptive ordering
  const sortedTools = [...quickTools].sort((a, b) => b.usage - a.usage)
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Mobile sidebar variants
  const mobileSidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  }
  
  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar - Different implementation for mobile vs desktop */}
      <div className="hidden lg:block w-80 min-h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Desktop sidebar content */}
          <SidebarContent 
            mainNavItems={mainNavItems} 
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            sortedTools={sortedTools}
            location={location}
            recentProjects={recentProjects}
            stats={stats}
            createAdaptiveClickHandler={createAdaptiveClickHandler}
            onClose={onClose}
          />
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <motion.aside
        variants={mobileSidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="lg:hidden fixed left-0 top-16 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Mobile sidebar content - same component */}
          <SidebarContent 
            mainNavItems={mainNavItems} 
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            sortedTools={sortedTools}
            location={location}
            recentProjects={recentProjects}
            stats={stats}
            createAdaptiveClickHandler={createAdaptiveClickHandler}
            onClose={onClose}
          />
        </div>
      </motion.aside>
    </>
  )
}

// Extracted content component to avoid duplication
const SidebarContent = ({ 
  mainNavItems, 
  expandedSections, 
  toggleSection, 
  sortedTools, 
  location, 
  recentProjects, 
  stats, 
  createAdaptiveClickHandler, 
  onClose 
}) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  }
  
  return (
    <>
      {/* Main Navigation */}
      <nav className="space-y-2">
        {mainNavItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <motion.div
              key={item.path}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                to={item.path}
                onClick={() => {
                  createAdaptiveClickHandler(`sidebar-${item.label.toLowerCase()}`, 'navigation')()
                  onClose()
                }}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>
      
      {/* Quick Tools */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('tools')}
          className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            <span className="font-medium">Quick Tools</span>
          </div>
          {expandedSections.tools ? 
            <ChevronDownIcon className="w-4 h-4" /> : 
            <ChevronRightIcon className="w-4 h-4" />
          }
        </button>
        
        <AnimatePresence>
          {expandedSections.tools && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {sortedTools.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <motion.button
                    key={tool.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      createAdaptiveClickHandler(`quick-tool-${tool.id}`, 'tool')()
                      tool.action()
                    }}
                    className="w-full group flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{tool.label}</div>
                      <div className="text-xs opacity-75">{tool.description}</div>
                    </div>
                    {tool.usage > 0 && (
                      <div className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                        {tool.usage}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Recent Projects */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('recent')}
          className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span className="font-medium">Recent Projects</span>
          </div>
          {expandedSections.recent ? 
            <ChevronDownIcon className="w-4 h-4" /> : 
            <ChevronRightIcon className="w-4 h-4" />
          }
        </button>
        
        <AnimatePresence>
          {expandedSections.recent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {recentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                    to={`/projects/${project.id}`}
                      onClick={() => {
                        createAdaptiveClickHandler(`recent-project-${project.id}`, 'navigation')()
                        onClose()
                      }}
                    className="group flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-all duration-200"
                    >
                    <div className={`w-2 h-2 rounded-full ${
                      project.status === 'completed' ? 'bg-green-500' :
                      project.status === 'processing' ? 'bg-yellow-500' :
                      project.status === 'error' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{project.name}</div>
                      <div className="text-xs opacity-75">{project.clips} clips</div>
                    </div>
                    </Link>
                  </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Quick Stats */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('stats')}
          className="w-full flex items-center justify-between text-gray-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            <span className="font-medium">Quick Stats</span>
          </div>
          {expandedSections.stats ? 
            <ChevronDownIcon className="w-4 h-4" /> : 
            <ChevronRightIcon className="w-4 h-4" />
          }
        </button>
        
        <AnimatePresence>
          {expandedSections.stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{stats.totalProjects}</div>
                <div className="text-xs text-gray-400">Projects</div>
                </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{stats.totalClips}</div>
                <div className="text-xs text-gray-400">Clips</div>
                </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">{stats.completedProjects}</div>
                <div className="text-xs text-gray-400">Completed</div>
                </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">{stats.processingProjects}</div>
                <div className="text-xs text-gray-400">Processing</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default Sidebar