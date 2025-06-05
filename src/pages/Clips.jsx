import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Edit,
  Download,
  Trash2,
  Share2,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Clock,
  Eye,
  Star
} from 'lucide-react';
import useProjectStore from '../stores/projectStore';
import { useErrorHandler } from '../hooks/useErrorHandler';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

const Clips = () => {
  const { projects, deleteClip } = useProjectStore();
  const { handleError, withErrorHandling } = useErrorHandler();
  
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedClip, setSelectedClip] = useState(null);
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadClips();
  }, [projects]);

  const loadClips = async () => {
    try {
      setLoading(true);
  // Get all clips from all projects
      const allClips = [];
      for (const project of projects) {
        if (project.clips && project.clips.length > 0) {
          const projectClips = project.clips.map(clip => ({
      ...clip,
            projectName: project.name,
            projectId: project.id
    }));
          allClips.push(...projectClips);
        }
      }
      setClips(allClips);
    } catch (error) {
      handleError(error, { operation: 'load_clips' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedClips = clips
    .filter(clip => {
      const matchesSearch = clip.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clip.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'high-score') return matchesSearch && clip.score >= 80;
      if (filterBy === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return matchesSearch && new Date(clip.createdAt) > oneWeekAgo;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      switch (sortBy) {
        case 'name':
          return multiplier * (a.name || '').localeCompare(b.name || '');
        case 'duration':
          return multiplier * (a.duration - b.duration);
        case 'score':
          return multiplier * (a.score - b.score);
        case 'project':
          return multiplier * (a.projectName || '').localeCompare(b.projectName || '');
        case 'created':
        default:
          return multiplier * (new Date(b.createdAt) - new Date(a.createdAt));
      }
    });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClip = withErrorHandling(async (clipId, projectId) => {
    if (!window.confirm('Are you sure you want to delete this clip?')) {
      return;
    }

    try {
      await apiClient.deleteClip(projectId, clipId);
      
      // Update local state
      setClips(prev => prev.filter(clip => clip.id !== clipId));
      
      // Update project store
      await deleteClip(projectId, clipId);
      
      toast.success('Clip deleted successfully');
      setSelectedClip(null);
    } catch (error) {
      throw error; // Will be handled by withErrorHandling
    }
  }, { operation: 'delete_clip' });

  const handleDownloadClip = withErrorHandling(async (clip) => {
    try {
      const blob = await apiClient.downloadFile(
        `/api/projects/${clip.projectId}/clips/${clip.id}/download`,
        `${clip.name || 'clip'}.mp4`
      );
      
      toast.success('Clip download started');
      setSelectedClip(null);
    } catch (error) {
      throw error; // Will be handled by withErrorHandling
    }
  }, { operation: 'download_clip' });

  const handleShareClip = async (clip) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: clip.name || 'Video Clip',
          text: clip.description || 'Check out this video clip',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
      setSelectedClip(null);
    } catch (error) {
      handleError(error, { operation: 'share_clip' });
    }
  };

  const ClipCard = ({ clip }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Clip Thumbnail */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative group">
        {clip.thumbnail ? (
          <img
            src={clip.thumbnail}
            alt={clip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="p-3 bg-white/90 hover:bg-white rounded-full transition-colors">
            <Play className="w-6 h-6 text-gray-900" />
          </button>
        </div>
        
        {/* Duration Badge */}
        {clip.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {formatDuration(clip.duration)}
          </div>
        )}
        
        {/* Score Badge */}
        {clip.score && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600/80 text-white text-xs rounded flex items-center gap-1">
            <Star className="w-3 h-3" />
            {clip.score}
          </div>
        )}
        
        {/* Actions */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setSelectedClip(selectedClip === clip.id ? null : clip.id)}
              className="p-1 bg-black/20 hover:bg-black/40 text-white rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {selectedClip === clip.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                    Edit Clip
                  </button>
                  <button 
                    onClick={() => handleDownloadClip(clip)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button 
                    onClick={() => handleShareClip(clip)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDeleteClip(clip.id, clip.projectId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Clip Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {clip.name || 'Untitled Clip'}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          From: {clip.projectName}
        </p>
        
        {clip.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {clip.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(clip.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDownloadClip(clip)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ClipListItem = ({ clip }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center relative">
            {clip.thumbnail ? (
              <img
                src={clip.thumbnail}
                alt={clip.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Video className="w-6 h-6 text-gray-400" />
            )}
            {clip.duration && (
              <div className="absolute bottom-0 right-0 px-1 bg-black/70 text-white text-xs rounded-tl">
                {formatDuration(clip.duration)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
              {clip.name || 'Untitled Clip'}
            </h3>
              {clip.score && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                  <Star className="w-3 h-3" />
                  {clip.score}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              From: {clip.projectName}
            </p>
            {clip.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {clip.description}
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(clip.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDownloadClip(clip)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClip(clip.id, clip.projectId)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading clips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Clips
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
            Manage and organize all your video clips in one place
          </p>
        </div>
        
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
              </div>
          </div>
          
            {/* Filters and Sort */}
            <div className="flex items-center gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Clips</option>
                <option value="high-score">High Score (80+)</option>
                <option value="recent">Recent (7 days)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="created">Date Created</option>
              <option value="name">Name</option>
              <option value="duration">Duration</option>
                <option value="score">Score</option>
                <option value="project">Project</option>
            </select>
            
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </button>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clips</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{clips.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Duration</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(clips.reduce((acc, clip) => acc + (clip.duration || 0), 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {clips.length > 0 
                ? Math.round(clips.reduce((acc, clip) => acc + (clip.score || 0), 0) / clips.length)
                : 0
              }
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(clips.map(clip => clip.projectId)).size}
            </p>
          </div>
        </div>
        
        {/* Clips Grid/List */}
        {filteredAndSortedClips.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterBy !== 'all' ? 'No clips found' : 'No clips yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create a project and analyze a video to generate clips'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredAndSortedClips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </motion.div>
        ) : (
          <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredAndSortedClips.map((clip) => (
                  <ClipListItem key={clip.id} clip={clip} />
              ))}
              </motion.div>
            )}
            </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Clips;