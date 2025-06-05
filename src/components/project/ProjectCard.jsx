import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VideoIcon,
  PlayIcon, 
  CalendarIcon,
  MoreVerticalIcon,
  EditIcon,
  DownloadIcon,
  TrashIcon,
  ShareIcon,
  ArchiveIcon,
  StarIcon
} from 'lucide-react'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import useProjectStore from '../../stores/projectStore'
import apiClient from '../../utils/apiClient'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ProjectCard = ({ project, onClick }) => {
  const { createAdaptiveClickHandler, getAdaptiveClasses } = useAdaptiveUI()
  const { handleError, withErrorHandling } = useErrorHandler()
  const { deleteProject } = useProjectStore()
  const navigate = useNavigate()
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white'
      case 'analyzing':
        return 'bg-blue-600 text-white'
      case 'processing':
        return 'bg-yellow-600 text-white'
      case 'error':
        return 'bg-red-600 text-white'
      case 'draft':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'analyzing':
        return 'Analyzing'
      case 'processing':
        return 'Processing'
      case 'error':
        return 'Error'
      case 'draft':
        return 'Draft'
      default:
        return 'Unknown'
    }
  }

  const handleCardClick = (e) => {
    // Prevent card click when clicking on action buttons
    if (e.target.closest('.action-button')) {
      return
    }
    onClick()
  }

  const handleEditProject = () => {
    setShowActionsMenu(false)
    navigate(`/projects/${project.id}`)
  }

  const handleDownloadProject = withErrorHandling(async () => {
    try {
      setShowActionsMenu(false)
      
      if (!project.clips || project.clips.length === 0) {
        toast.error('No clips available to download')
        return
      }

      // Export all clips
      const exportSettings = {
        format: 'mp4',
        quality: 'high',
        includeAll: true
      }
      
      await apiClient.exportClips(project.id, exportSettings)
      toast.success('Project export started! You will receive the download link shortly.')
    } catch (error) {
      throw error // Will be handled by withErrorHandling
    }
  }, { operation: 'download_project' })

  const handleDeleteProject = withErrorHandling(async () => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setShowActionsMenu(false)
      await deleteProject(project.id)
      toast.success('Project deleted successfully')
    } catch (error) {
      throw error // Will be handled by withErrorHandling
    }
  }, { operation: 'delete_project' })

  const handleShareProject = async () => {
    try {
      setShowActionsMenu(false)
      
      const shareData = {
        title: project.name,
        text: project.description || 'Check out this video project',
        url: `${window.location.origin}/projects/${project.id}`
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Project link copied to clipboard')
      }
    } catch (error) {
      handleError(error, { operation: 'share_project' })
    }
  }

  const handleArchiveProject = withErrorHandling(async () => {
    try {
      setShowActionsMenu(false)
      
      // Toggle archive status
      const newStatus = project.status === 'archived' ? 'completed' : 'archived'
      
      await apiClient.updateProject(project.id, { status: newStatus })
      toast.success(newStatus === 'archived' ? 'Project archived' : 'Project unarchived')
    } catch (error) {
      throw error // Will be handled by withErrorHandling
    }
  }, { operation: 'archive_project' })

  const handleAction = (action, e) => {
    e.stopPropagation()
    
    switch (action) {
      case 'edit':
        handleEditProject()
        break
      case 'download':
        handleDownloadProject()
        break
      case 'delete':
        handleDeleteProject()
        break
      case 'share':
        handleShareProject()
        break
      case 'archive':
        handleArchiveProject()
        break
      default:
        console.log(`Unknown action: ${action}`)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card p-0 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
      onClick={createAdaptiveClickHandler('project-card', handleCardClick)}
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {project.video?.thumbnail ? (
          <img 
            src={project.video.thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>

        {/* Duration Badge */}
        {project.video?.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(project.video.duration)}
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3"
          >
            <PlayIcon className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowActionsMenu(!showActionsMenu)
              }}
              className="action-button bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleAction('edit', e)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    Edit Project
                  </button>
                  
                  <button
                    onClick={(e) => handleAction('download', e)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    disabled={!project.clips || project.clips.length === 0}
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Download All Clips
                  </button>
                  
                  <button
                    onClick={(e) => handleAction('share', e)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                    Share Project
                  </button>
                  
                  <button
                    onClick={(e) => handleAction('archive', e)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ArchiveIcon className="w-4 h-4" />
                    {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                  
                  <hr className="border-gray-700 my-1" />
                  
                  <button
                    onClick={(e) => handleAction('delete', e)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Description */}
        <div>
          <h3 className="font-semibold text-gray-100 text-lg mb-1 line-clamp-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(project.createdAt || project.updatedAt || new Date())}</span>
          </div>
          {project.clips && (
            <div className="flex items-center gap-1">
              <VideoIcon className="w-4 h-4" />
              <span>{project.clips.length} clips</span>
            </div>
          )}
        </div>

        {/* Progress Bar (for processing projects) */}
        {(project.status === 'analyzing' || project.status === 'processing') && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{Math.round(project.progress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress || 0}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {project.status === 'completed' && project.clips && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              <span className="font-medium text-gray-300">{project.clips.length}</span> clips generated
            </div>
            {project.metadata?.averageScore && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <StarIcon className="w-3 h-3" />
                <span className="font-medium text-gray-300">{Math.round(project.metadata.averageScore)}/100</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => handleAction('edit', e)}
            className="action-button btn btn-ghost btn-sm flex-1"
          >
            <EditIcon className="w-3 h-3 mr-1" />
            Edit
          </button>
          <button
            onClick={(e) => handleAction('download', e)}
            className="action-button btn btn-ghost btn-sm"
            disabled={!project.clips || project.clips.length === 0}
            title="Download all clips"
          >
            <DownloadIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => handleAction('delete', e)}
            className="action-button btn btn-ghost btn-sm text-red-400 hover:text-red-300"
            title="Delete project"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard