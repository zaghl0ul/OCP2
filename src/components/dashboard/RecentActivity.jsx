import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ClockIcon, 
  VideoIcon, 
  SparklesIcon, 
  DownloadIcon,
  EditIcon,
  PlayIcon,
  Clock,
  ArrowRight,
  Video,
  Scissors,
  Check,
  Play,
  Upload,
  AlertCircle
} from 'lucide-react'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'

const RecentActivity = () => {
  const { createAdaptiveClickHandler, getAdaptiveClasses } = useAdaptiveUI()
  const navigate = useNavigate()

  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: 'project_created',
      projectId: 'project-1',
      projectName: 'Marketing Video 2023',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'success'
    },
    {
      id: 2,
      type: 'video_uploaded',
      projectId: 'project-2',
      projectName: 'Product Demo',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: 'success'
    },
    {
      id: 3,
      type: 'analysis_completed',
      projectId: 'project-3',
      projectName: 'Training Webinar',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'success',
      resultCount: 5
    },
    {
      id: 4,
      type: 'clip_exported',
      projectId: 'project-2',
      projectName: 'Product Demo',
      clipName: 'Feature Highlight',
      clipId: 'clip-1',
      timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      status: 'success'
    },
    {
      id: 5,
      type: 'analysis_failed',
      projectId: 'project-4',
      projectName: 'Customer Testimonial',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      status: 'error',
      error: 'API connection failed'
    }
  ]

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'project_created':
        return <Video className="w-5 h-5 text-blue-500" />
      case 'video_uploaded':
        return <Upload className="w-5 h-5 text-green-500" />
      case 'analysis_completed':
        return <Check className="w-5 h-5 text-emerald-500" />
      case 'analysis_failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'clip_exported':
        return <Scissors className="w-5 h-5 text-purple-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'project_created':
        return `Created project "${activity.projectName}"`
      case 'video_uploaded':
        return `Uploaded video to "${activity.projectName}"`
      case 'analysis_completed':
        return `Completed analysis for "${activity.projectName}" with ${activity.resultCount} clips`
      case 'analysis_failed':
        return `Analysis failed for "${activity.projectName}": ${activity.error}`
      case 'clip_exported':
        return `Exported clip "${activity.clipName}" from "${activity.projectName}"`
      default:
        return 'Unknown activity'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diffMs = now - timestamp
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffDay > 0) return `${diffDay}d ago`
    if (diffHour > 0) return `${diffHour}h ago`
    if (diffMin > 0) return `${diffMin}m ago`
    return 'Just now'
  }

  const getNavigationUrl = (activity) => {
    switch (activity.type) {
      case 'project_created':
      case 'video_uploaded':
        // Navigate to project page
        return `/projects/${activity.projectId}`
      
      case 'analysis_completed':
        // Navigate to project page with clips view
        return `/projects/${activity.projectId}?tab=clips`
      
      case 'analysis_failed':
        // Navigate to project page with error details
        return `/projects/${activity.projectId}?tab=analysis&error=true`
      
      case 'clip_exported':
        // Navigate to clips page or specific clip if ID is available
        if (activity.clipId) {
          return `/clips?project=${activity.projectId}&clip=${activity.clipId}`
        }
        return `/clips?project=${activity.projectId}`
      
      default:
        return `/projects/${activity.projectId}`
    }
  }

  const getActionLabel = (activity) => {
    switch (activity.type) {
      case 'project_created':
        return 'Edit'
      case 'video_uploaded':
        return 'Analyze'
      case 'analysis_completed':
        return 'View Clips'
      case 'analysis_failed':
        return 'Retry'
      case 'clip_exported':
        return 'View Clip'
      default:
        return 'View'
    }
  }

  const handleActivityClick = (activity) => {
    createAdaptiveClickHandler(`activity-${activity.type}`, 'navigation')()
    
    const url = getNavigationUrl(activity)
    navigate(url)
  }

  const handleQuickAction = (activity, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    createAdaptiveClickHandler(`activity-action-${activity.type}`, 'action')()
    
    switch (activity.type) {
      case 'project_created':
        navigate(`/projects/${activity.projectId}?action=edit`)
        break
      
      case 'video_uploaded':
        navigate(`/projects/${activity.projectId}?action=analyze`)
        break
      
      case 'analysis_completed':
        navigate(`/projects/${activity.projectId}?tab=clips`)
        break
      
      case 'analysis_failed':
        navigate(`/projects/${activity.projectId}?action=retry-analysis`)
        break
      
      case 'clip_exported':
        if (activity.clipId) {
          navigate(`/clips?project=${activity.projectId}&clip=${activity.clipId}&action=view`)
        } else {
          navigate(`/clips?project=${activity.projectId}`)
        }
        break
      
      default:
        navigate(`/projects/${activity.projectId}`)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <Link to="/analytics" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-sm">
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                activity.status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : ''
              }`}
              onClick={() => handleActivityClick(activity)}
            >
              <div className="mr-4">
                {getActivityIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              <button
                onClick={(e) => handleQuickAction(activity, e)}
                className="ml-4 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {getActionLabel(activity)}
              </button>
            </motion.div>
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by creating a project or uploading a video
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Video className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity