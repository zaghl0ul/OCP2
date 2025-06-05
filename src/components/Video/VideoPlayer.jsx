import React from 'react'
import { PlayIcon } from 'lucide-react'
import { useVideoPlayer } from '../../hooks/useVideoPlayer'
import VideoControls from './VideoControls'

const VideoPlayer = ({ src, poster, onTimeUpdate, onLoadedMetadata, className = '' }) => {
  const {
    // Refs
    videoRef,
    
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    showControls,
    
    // Handlers
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skip,
    toggleFullscreen,
    formatTime,
    handleMouseMove,
    handleMouseLeave
  } = useVideoPlayer({ onTimeUpdate, onLoadedMetadata })

  if (!src) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <PlayIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No video selected</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <VideoControls
        showControls={showControls}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        togglePlay={togglePlay}
        handleSeek={handleSeek}
        skip={skip}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
        toggleFullscreen={toggleFullscreen}
        formatTime={formatTime}
      />
    </div>
  )
}

export default VideoPlayer