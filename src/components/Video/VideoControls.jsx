import React from 'react'
import { motion } from 'framer-motion'
import {
  PlayIcon,
  PauseIcon,
  VolumeXIcon,
  Volume2Icon,
  MaximizeIcon,
  SkipBackIcon,
  SkipForwardIcon
} from 'lucide-react'

const VideoControls = ({
  showControls,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  togglePlay,
  handleSeek,
  skip,
  toggleMute,
  handleVolumeChange,
  toggleFullscreen,
  formatTime
}) => {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      initial={{ opacity: 1 }}
      animate={{ opacity: showControls ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.button
          onClick={togglePlay}
          className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <PauseIcon className="w-8 h-8" />
          ) : (
            <PlayIcon className="w-8 h-8 ml-1" />
          )}
        </motion.button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-white hover:text-primary-400 transition-colors"
            >
              <SkipBackIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={() => skip(10)}
              className="p-2 text-white hover:text-primary-400 transition-colors"
            >
              <SkipForwardIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={toggleMute}
                className="p-1 text-white hover:text-primary-400 transition-colors"
              >
                {isMuted ? (
                  <VolumeXIcon className="w-4 h-4" />
                ) : (
                  <Volume2Icon className="w-4 h-4" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-primary-400 transition-colors"
            >
              <MaximizeIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VideoControls