import { useState, useRef } from 'react'
import useProjectStore from '../stores/projectStore'
import toast from 'react-hot-toast'
import apiService from '../services/api'

export const useCreateProjectModal = () => {
  const { createProject } = useProjectStore()
  
  const [step, setStep] = useState(1)
  const [projectType, setProjectType] = useState('upload')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef(null)
  
  const resetForm = () => {
    setStep(1)
    setProjectType('upload')
    setProjectName('')
    setDescription('')
    setYoutubeUrl('')
    setSelectedFile(null)
    setIsCreating(false)
    setDragActive(false)
  }
  
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      if (!projectName) {
        setProjectName(file.name.replace(/\.[^/.]+$/, ''))
      }
    } else {
      toast.error('Please select a valid video file')
    }
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }
  
  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }
  
  const handleCreateProject = async (onProjectCreated, onClose) => {
    if (!projectName.trim()) {
      toast.error('Project name is required')
      return
    }
    
    if (projectType === 'youtube' && !validateYouTubeUrl(youtubeUrl)) {
      toast.error('Please enter a valid YouTube URL')
      return
    }
    
    if (projectType === 'upload' && !selectedFile) {
      toast.error('Please select a video file')
      return
    }
    
    setIsCreating(true)
    console.log('Creating project with:', { projectName, description, projectType })
    
    try {
      // Create the project with the correct API structure
      const projectData = {
        name: projectName.trim(),
        description: description.trim(),
        type: projectType,
        youtube_url: projectType === 'youtube' ? youtubeUrl : null
      };
      
      console.log('Project data being sent to API:', projectData)
      
      // Call the createProject function with the complete projectData object
      const project = await createProject(projectData);
      console.log('Project created successfully:', project)
      
      if (project) {
        // If it's a file upload, handle the file upload after project creation
        if (projectType === 'upload' && selectedFile) {
          try {
            await apiService.uploadVideo(project.id, selectedFile);
            toast.success('Project created and video uploaded successfully!');
          } catch (uploadError) {
            console.error('Video upload error:', uploadError)
            toast.error('Project created but failed to upload video');
          }
        } else if (projectType === 'youtube') {
          // If it's a YouTube project, process the YouTube URL
          try {
            const loadingToast = toast.loading('Processing YouTube video...');
            await apiService.processYouTube(project.id, youtubeUrl);
            toast.dismiss(loadingToast);
            toast.success('YouTube video processed successfully!');
          } catch (youtubeError) {
            console.error('YouTube processing error:', youtubeError);
            toast.error(`Failed to process YouTube video: ${youtubeError.message || 'Unknown error'}`);
          }
        }
        
        if (onProjectCreated) {
          console.log('Calling onProjectCreated callback')
          onProjectCreated(project);
        } else {
          console.warn('onProjectCreated callback is not provided')
        }
        
        resetForm();
        
        if (onClose) {
          console.log('Calling onClose callback')
          onClose();
        } else {
          console.warn('onClose callback is not provided')
        }
      }
    } catch (error) {
      console.error('Project creation error details:', error)
      toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  }
  
  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return projectType !== null
      case 2:
        return projectName.trim().length > 0
      case 3:
        if (projectType === 'youtube') {
          return validateYouTubeUrl(youtubeUrl)
        }
        return selectedFile !== null
      default:
        return false
    }
  }
  
  return {
    // State
    step,
    projectType,
    projectName,
    description,
    youtubeUrl,
    selectedFile,
    isCreating,
    dragActive,
    fileInputRef,
    
    // Actions
    setStep,
    setProjectType,
    setProjectName,
    setDescription,
    setYoutubeUrl,
    resetForm,
    handleFileSelect,
    handleDrag,
    handleDrop,
    validateYouTubeUrl,
    handleCreateProject,
    canProceedToNext
  }
}