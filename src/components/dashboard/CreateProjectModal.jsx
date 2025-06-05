import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X as XIcon,
  Loader as LoaderIcon
} from 'lucide-react'
import { useAdaptiveUI } from '../../contexts/AdaptiveUIContext'
import { useCreateProjectModal } from '../../hooks/useCreateProjectModal'
import {
  ProjectTypeStep,
  ProjectDetailsStep,
  YouTubeUrlStep,
  VideoUploadStep
} from '../project/steps'

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const { createAdaptiveClickHandler } = useAdaptiveUI()
  const {
    step,
    projectType,
    projectName,
    description,
    youtubeUrl,
    selectedFile,
    isCreating,
    dragActive,
    fileInputRef,
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
  } = useCreateProjectModal()
  
  const handleClose = () => {
    if (!isCreating) {
      resetForm()
      onClose()
    }
  }
  
  const onCreateProject = () => {
    console.log('Create Project button clicked')
    console.log('Form data:', { 
      projectType, 
      projectName, 
      description, 
      youtubeUrl, 
      selectedFile: selectedFile ? selectedFile.name : null 
    })
    console.log('Can proceed?', canProceedToNext())
    handleCreateProject(onProjectCreated, onClose)
  }
  
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  }
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ProjectTypeStep
            projectType={projectType}
            setProjectType={setProjectType}
            createAdaptiveClickHandler={createAdaptiveClickHandler}
          />
        )
      case 2:
        return (
          <ProjectDetailsStep
            projectName={projectName}
            setProjectName={setProjectName}
            description={description}
            setDescription={setDescription}
          />
        )
      case 3:
        if (projectType === 'youtube') {
          return (
            <YouTubeUrlStep
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              validateYouTubeUrl={validateYouTubeUrl}
            />
          )
        }
        return (
          <VideoUploadStep
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            dragActive={dragActive}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            fileInputRef={fileInputRef}
          />
        )
      default:
        return null
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Project
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        stepNum <= step ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || isCreating}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Back
              </button>
              
              <div className="flex items-center gap-3">
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceedToNext()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={onCreateProject}
                    disabled={!canProceedToNext() || isCreating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CreateProjectModal