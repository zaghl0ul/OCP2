import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoaderIcon, SparklesIcon } from 'lucide-react'

const ProcessingOverlay = ({ isVisible, progress = 0, status = 'Processing...' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto"
                >
                  <SparklesIcon className="w-full h-full text-blue-400" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 w-16 h-16 mx-auto"
                >
                  <LoaderIcon className="w-full h-full text-blue-600/30" />
                </motion.div>
              </div>

              {/* Status Text */}
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">
                  AI Analysis in Progress
                </h3>
                <p className="text-gray-400">
                  {status}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Processing Steps */}
              <div className="text-left space-y-2">
                <div className="text-sm font-medium text-gray-300 mb-3">
                  Processing Steps:
                </div>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${
                    progress >= 20 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= 20 ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                    Video upload and validation
                  </div>
                  <div className={`flex items-center gap-2 ${
                    progress >= 40 ? 'text-green-400' : progress >= 20 ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= 40 ? 'bg-green-400' : progress >= 20 ? 'bg-blue-400' : 'bg-gray-600'
                    }`} />
                    Audio extraction and transcription
                  </div>
                  <div className={`flex items-center gap-2 ${
                    progress >= 70 ? 'text-green-400' : progress >= 40 ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= 70 ? 'bg-green-400' : progress >= 40 ? 'bg-blue-400' : 'bg-gray-600'
                    }`} />
                    AI content analysis
                  </div>
                  <div className={`flex items-center gap-2 ${
                    progress >= 90 ? 'text-green-400' : progress >= 70 ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= 90 ? 'bg-green-400' : progress >= 70 ? 'bg-blue-400' : 'bg-gray-600'
                    }`} />
                    Clip generation and scoring
                  </div>
                  <div className={`flex items-center gap-2 ${
                    progress >= 100 ? 'text-green-400' : progress >= 90 ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      progress >= 100 ? 'bg-green-400' : progress >= 90 ? 'bg-blue-400' : 'bg-gray-600'
                    }`} />
                    Finalizing results
                  </div>
                </div>
              </div>

              {/* Estimated Time */}
              {progress > 0 && progress < 100 && (
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Estimated time remaining:</span>
                  <span className="ml-2">
                    {progress < 20 ? '3-4 minutes' :
                     progress < 50 ? '2-3 minutes' :
                     progress < 80 ? '1-2 minutes' :
                     'Less than 1 minute'}
                  </span>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                <div className="text-sm text-blue-400">
                  <div className="font-medium mb-1">💡 Pro Tip:</div>
                  <div className="text-blue-300">
                    The AI is analyzing your video content to find the most engaging moments. 
                    This process ensures high-quality clips that match your analysis prompt.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProcessingOverlay