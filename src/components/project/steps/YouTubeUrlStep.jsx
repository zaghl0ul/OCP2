import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle as AlertCircleIcon } from 'lucide-react'

const YouTubeUrlStep = ({ youtubeUrl, setYoutubeUrl, validateYouTubeUrl }) => {
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
          YouTube URL
        </h3>
        <p className="text-gray-400">
          Enter the YouTube video URL you want to analyze
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube URL *
        </label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="input"
          autoFocus
        />
        {youtubeUrl && !validateYouTubeUrl(youtubeUrl) && (
          <div className="flex items-center gap-2 mt-2 text-red-400">
            <AlertCircleIcon className="w-4 h-4" />
            <span className="text-sm">Please enter a valid YouTube URL</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default YouTubeUrlStep