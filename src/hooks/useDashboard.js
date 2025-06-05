import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '../stores/projectStore'
import { useAdaptiveUI } from '../contexts/AdaptiveUIContext'
import toast from 'react-hot-toast'

export const useDashboard = () => {
  const navigate = useNavigate()
  const { 
    projects, 
    getRecentProjects, 
    getProjectStats,
    createProject 
  } = useProjectStore()
  const { 
    trackTimeInArea, 
    createAdaptiveClickHandler,
    getAdaptiveClasses 
  } = useAdaptiveUI()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const recentProjects = getRecentProjects(6)
  const stats = getProjectStats()
  
  // Safety check to ensure projects is always an array
  const safeProjects = Array.isArray(projects) ? projects : []
  
  // Track time spent on dashboard
  useEffect(() => {
    const cleanup = trackTimeInArea('dashboard')
    return cleanup
  }, [trackTimeInArea])
  
  const handleCreateProject = async (projectData) => {
    try {
      const project = await createProject(projectData)
      setShowCreateModal(false)
      toast.success('Project created successfully!')
      navigate(`/projects/${project.id}`)
      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error(`Failed to create project: ${error.message}`)
      return null
    }
  }
  
  // Filter projects by search query (case-insensitive)
  const filteredProjects = safeProjects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => setShowCreateModal(true)
  const closeCreateModal = () => setShowCreateModal(false)

  const navigateToProject = (projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`)
    } else {
      console.error('Invalid project ID for navigation')
    }
  }
  
  return {
    // State
    showCreateModal,
    searchQuery,
    setSearchQuery,
    
    // Data
    recentProjects,
    stats,
    filteredProjects,
    
    // Handlers
    handleCreateProject,
    openCreateModal,
    closeCreateModal,
    navigateToProject,
    
    // Adaptive UI
    createAdaptiveClickHandler,
    getAdaptiveClasses
  }
}