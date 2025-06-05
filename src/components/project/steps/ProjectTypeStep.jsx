import React from 'react'
import { motion } from 'framer-motion'
import {
  Upload as UploadIcon,
  Link as LinkIcon,
  Check as CheckIcon
} from 'lucide-react'

const ProjectTypeStep = ({ projectType, setProjectType, createAdaptiveClickHandler }) => {
  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Choose Project Type
        </h3>
        <p className="text-gray-400">
          How would you like to add your video?
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setProjectType('upload')
            createAdaptiveClickHandler('modal-upload-type', 'selection')()
          }}
          className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
            projectType === 'upload'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              projectType === 'upload'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}>
              <UploadIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-medium text-gray-100">Upload Video</h4>
              <p className="text-sm text-gray-400">Upload from your device</p>
            </div>
          </div>
          {projectType === 'upload' && (
            <div className="mt-4 flex items-center gap-2 text-primary-400">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">Selected</span>
            </div>
          )}
        </button>
        
        <button
          onClick={() => {
            setProjectType('youtube')
            createAdaptiveClickHandler('modal-youtube-type', 'selection')()
          }}
          className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
            projectType === 'youtube'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              projectType === 'youtube'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}>
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-medium text-gray-100">YouTube Link</h4>
              <p className="text-sm text-gray-400">Import from YouTube URL</p>
            </div>
          </div>
          {projectType === 'youtube' && (
            <div className="mt-4 flex items-center gap-2 text-primary-400">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">Selected</span>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default ProjectTypeStep