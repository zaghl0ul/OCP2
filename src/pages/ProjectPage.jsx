import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useProjectStore from '../stores/projectStore'
import { useAdaptiveUI } from '../contexts/AdaptiveUIContext'
import { 
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  UploadIcon,
  SparklesIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  PlusIcon
} from 'lucide-react'
import VideoUpload from '../components/Video/VideoUpload'
import VideoPlayer from '../components/Video/VideoPlayer'
import AnalysisPrompt from '../components/Analysis/AnalysisPrompt'
import ClipsList from '../components/Clips/ClipsList'
import ClipEditor from '../components/Clips/ClipEditor'
import ProcessingOverlay from '../components/Common/ProcessingOverlay'
import toast from 'react-hot-toast'

const ProjectPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentProject,
    setCurrentProject,
    updateProject,
    addVideoToProject,
    setAnalysisPrompt,
    startAnalysis,
    isProcessing,
    processingProgress,
    processingStatus
  } = useProjectStore()
  
  const {
    trackTimeInArea,
    trackWorkflow,
    createAdaptiveClickHandler,
    getAdaptiveClasses
  } = useAdaptiveUI()
  
  const [selectedClip, setSelectedClip] = useState(null)
  const [showClipEditor, setShowClipEditor] = useState(false)
  const [currentStep, setCurrentStep] = useState('upload') // upload, prompt, analyze, clips
  
  useEffect(() => {
    if (id) {
      setCurrentProject(id)
    }
  }, [id, setCurrentProject])
  
  useEffect(() => {
    const cleanup = trackTimeInArea('project-page')
    return cleanup
  }, [])
  
  useEffect(() => {
    if (currentProject) {
      // Determine current step based on project state
      if (!currentProject.video) {
        setCurrentStep('upload')
      } else if (!currentProject.analysisPrompt) {
        setCurrentStep('prompt')
      } else if (currentProject.status === 'analyzing') {
        setCurrentStep('analyze')
      } else if (currentProject.clips.length > 0) {
        setCurrentStep('clips')
      } else {
        setCurrentStep('analyze')
      }
    }
  }, [currentProject])
  
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            Project not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  const handleVideoUpload = async (videoData) => {
    try {
      await addVideoToProject(currentProject.id, videoData)
      trackWorkflow('video-upload', 'completed', { videoSize: videoData.size })
      toast.success('Video uploaded successfully!')
      setCurrentStep('prompt')
    } catch (error) {
      toast.error('Failed to upload video')
      console.error('Upload error:', error)
    }
  }
  
  const handlePromptSubmit = (prompt) => {
    setAnalysisPrompt(currentProject.id, prompt)
    trackWorkflow('analysis-prompt', 'submitted', { promptLength: prompt.length })
    toast.success('Analysis prompt saved!')
    setCurrentStep('analyze')
  }
  
  const handleStartAnalysis = async () => {
    try {
      trackWorkflow('analysis', 'started')
      await startAnalysis(currentProject.id)
      trackWorkflow('analysis', 'completed', { 
        clipsGenerated: currentProject.clips.length 
      })
      toast.success('Analysis completed!')
      setCurrentStep('clips')
    } catch (error) {
      toast.error('Analysis failed: ' + error.message)
      console.error('Analysis error:', error)
    }
  }
  
  const handleClipSelect = (clip) => {
    setSelectedClip(clip)
    setShowClipEditor(true)
    trackWorkflow('clip-editing', 'opened', { clipId: clip.id })
  }
  
  const renderStepIndicator = () => {
    const steps = [
      { id: 'upload', label: 'Upload Video', icon: UploadIcon },
      { id: 'prompt', label: 'Analysis Prompt', icon: EditIcon },
      { id: 'analyze', label: 'AI Analysis', icon: SparklesIcon },
      { id: 'clips', label: 'Generated Clips', icon: PlayIcon },
    ]
    
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index
          const Icon = step.icon
          
          return (
            <React.Fragment key={step.id}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary-600 text-white' 
                  : isCompleted 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400'
              }`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Upload Your Video
              </h2>
              <p className="text-gray-400">
                Upload a video file or provide a YouTube link to get started
              </p>
            </div>
            <VideoUpload onUpload={handleVideoUpload} />
          </motion.div>
        )
        
      case 'prompt':
        return (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-100 mb-2">
                  Define Your Analysis Goal
                </h2>
                <p className="text-gray-400 mb-6">
                  Tell the AI what kind of clips you're looking for
                </p>
                <AnalysisPrompt
                  initialPrompt={currentProject.analysisPrompt}
                  onSubmit={handlePromptSubmit}
                />
              </div>
              <div>
                <VideoPlayer
                  src={currentProject.video?.url}
                  poster={currentProject.video?.thumbnail}
                />
              </div>
            </div>
          </motion.div>
        )
        
      case 'analyze':
        return (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Ready for AI Analysis
              </h2>
              <p className="text-gray-400 mb-6">
                The AI will analyze your video and generate clips based on your prompt
              </p>
            </div>
            
            <div className="card p-8 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  <strong>Video:</strong> {currentProject.video?.name}
                </div>
                <div className="text-sm text-gray-400">
                  <strong>Analysis Goal:</strong> {currentProject.analysisPrompt}
                </div>
                <button
                  onClick={createAdaptiveClickHandler('start-analysis', handleStartAnalysis)}
                  disabled={isProcessing}
                  className={getAdaptiveClasses('start-analysis', 'btn btn-primary btn-lg w-full')}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner w-5 h-5 mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Start AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )
        
      case 'clips':
        return (
          <motion.div
            key="clips"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-100 mb-2">
                  Generated Clips
                </h2>
                <p className="text-gray-400">
                  {currentProject.clips.length} clips generated • Average score: {Math.round(currentProject.metadata?.averageScore || 0)}/100
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('analyze')}
                className="btn btn-secondary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Generate More
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClipsList
                  clips={currentProject.clips}
                  onClipSelect={handleClipSelect}
                  projectId={currentProject.id}
                />
              </div>
              <div>
                <VideoPlayer
                  src={currentProject.video?.url}
                  poster={currentProject.video?.thumbnail}
                />
              </div>
            </div>
          </motion.div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p className="text-gray-400 text-sm">
                {currentProject.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentProject.status === 'completed' ? 'bg-green-600 text-white' :
            currentProject.status === 'analyzing' ? 'bg-blue-600 text-white' :
            currentProject.status === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {currentProject.status}
          </span>
        </div>
      </div>
      
      {/* Step Indicator */}
      {renderStepIndicator()}
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>
      
      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isProcessing}
        progress={processingProgress}
        status={processingStatus}
      />
      
      {/* Clip Editor Modal */}
      {showClipEditor && selectedClip && (
        <ClipEditor
          clip={selectedClip}
          projectId={currentProject.id}
          onClose={() => {
            setShowClipEditor(false)
            setSelectedClip(null)
          }}
        />
      )}
    </div>
  )
}

export default ProjectPage