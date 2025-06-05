import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Play,
  Upload,
  Download,
  Share2,
  MoreVertical,
  Video,
  FileText,
  Clock,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Plus,
  Eye,
  Scissors,
  Zap
} from 'lucide-react';
import useProjectStore from '../stores/projectStore';
import ClipsList from '../components/clips/ClipsList';
import ClipEditor from '../components/clips/ClipEditor';
import ProcessingOverlay from '../components/Common/ProcessingOverlay';
import VideoUploadModal from '../components/Video/VideoUploadModal';
import AnalysisModal from '../components/Analysis/AnalysisModal';
import apiService from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    getProject,
    updateProject,
    deleteProject,
    addVideoToProject,
    startAnalysis,
    isLoading
  } = useProjectStore();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);

  // Helper: check if project has a video
  const hasVideo = !!(project?.video_data || (project?.videos && project.videos.length > 0));
  // Helper: check if analysis has been run
  const hasAnalysis = Array.isArray(project?.clips) && project.clips.length > 0;

  // Show analysis prompt after video upload
  useEffect(() => {
    if (hasVideo && !hasAnalysis && !showAnalysisModal) {
      // Show prompt to start analysis after video upload
      setShowAnalysisModal(true);
    }
    // Only run this effect when project changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, hasAnalysis]);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await getProject(id);
        if (!projectData || typeof projectData !== 'object') {
          setError('Project not found or invalid data.');
          setProject(null);
          return;
        }
        setProject(projectData);
        setEditForm({
          name: projectData.name,
          description: projectData.description || ''
        });
        setError(null);
      } catch (error) {
        setError('Failed to load project: ' + (error?.message || error));
        setProject(null);
        navigate('/projects');
      }
    };

    loadProject();
  }, [id, getProject, navigate]);

  const handleSaveEdit = async () => {
    try {
      await updateProject(id, editForm);
      setProject(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleVideoUpload = async (file) => {
    try {
      await addVideoToProject(id, file);
      // Refresh project data
      const updatedProject = await getProject(id);
      setProject(updatedProject);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to upload video:', error);
    }
  };

  const handleYoutubeUrl = async (youtubeUrl) => {
    try {
      // First update the project with the YouTube URL if needed
      await updateProject(id, { youtube_url: youtubeUrl });
      
      // Process the YouTube URL
      await apiService.processYouTube(id, youtubeUrl);
      
      // Refresh project data
      const updatedProject = await getProject(id);
      setProject(updatedProject);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to process YouTube URL:', error);
    }
  };

  const handleStartAnalysis = async (analysisConfig) => {
    try {
      await startAnalysis(id, analysisConfig);
      // Refresh project data
      const updatedProject = await getProject(id);
      setProject(updatedProject);
      setShowAnalysisModal(false);
    } catch (error) {
      console.error('Failed to start analysis:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'clips', label: 'Clips', icon: Scissors },
    { id: 'analysis', label: 'Analysis', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
          {/* Debug info */}
          <pre className="text-xs text-gray-400 mt-4">{JSON.stringify({ id, project, isLoading }, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white w-full"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteProject}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Video className="w-4 h-4" />
            <span>{project.videos?.length || 0} videos</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Scissors className="w-4 h-4" />
            <span>{project.clips?.length || 0} clips</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <Upload className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Upload Video</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Add new video file</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowAnalysisModal(true)}
            disabled={!hasVideo || hasAnalysis}
            className={`flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${(!hasVideo || hasAnalysis) ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-500 dark:hover:border-green-400'}`}
            title={!hasVideo ? 'Upload a video first' : hasAnalysis ? 'Analysis already completed' : 'Analyze with AI'}
          >
            <Zap className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Start Analysis</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Analyze with AI</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('clips')}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
          >
            <Scissors className="w-6 h-6 text-purple-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Create Clips</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Edit and trim videos</div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {project.activity?.length > 0 ? (
            project.activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Videos ({project.videos?.length || 0})
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload Video
        </button>
      </div>
      
      {project.videos?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.videos.map((video, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover" />
                ) : (
                  <Video className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {video.name || `Video ${index + 1}`}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Duration: {video.duration || 'Unknown'}</div>
                  <div>Size: {video.size || 'Unknown'}</div>
                  <div>Format: {video.format || 'Unknown'}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium">
                    <Play className="w-4 h-4 inline mr-1" />
                    Play
                  </button>
                  <button className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No videos uploaded
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your first video to start analyzing
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium mx-auto"
          >
            <Upload className="w-4 h-4" />
            Upload Video
          </button>
        </div>
      )}
    </div>
  );

  const renderClipsTab = () => (
    <ClipsList
      projectId={id}
      clips={project.clips || []}
      onEditClip={setSelectedClip}
    />
  );

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analysis Results
        </h2>
        <button
          onClick={() => setShowAnalysisModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
        >
          <Zap className="w-4 h-4" />
          New Analysis
        </button>
      </div>
      
      {project.analysis?.length > 0 ? (
        <div className="space-y-4">
          {project.analysis.map((analysis, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {analysis.title || `Analysis ${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(analysis.createdAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                  {analysis.status}
                </span>
              </div>
              
              {analysis.results && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(analysis.results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No analysis results
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your first AI analysis to see insights
          </p>
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium mx-auto"
          >
            <Zap className="w-4 h-4" />
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Project Settings
      </h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          General Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={project.name}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={project.description || ''}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          Danger Zone
        </h3>
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">
                Delete Project
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                This action cannot be undone. All project data will be permanently deleted.
              </p>
            </div>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'videos': return renderVideosTab();
      case 'clips': return renderClipsTab();
      case 'analysis': return renderAnalysisTab();
      case 'settings': return renderSettingsTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/projects"
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Project Details
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderTabContent()}
      </div>
      
      {/* Clip Editor (if clip selected) */}
      {selectedClip && (
        <ClipEditor
          projectId={id}
          clip={selectedClip}
          onClose={() => setSelectedClip(null)}
        />
      )}
      
      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <VideoUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onVideoUpload={handleVideoUpload}
            onYoutubeUrl={handleYoutubeUrl}
          />
        )}
      </AnimatePresence>
      
      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && (
          <AnalysisModal
            isOpen={showAnalysisModal}
            onClose={() => setShowAnalysisModal(false)}
            onStartAnalysis={handleStartAnalysis}
            defaultPrompt={project.analysisPrompt || ''}
          />
        )}
      </AnimatePresence>
      
      {/* Processing Overlay */}
      {isLoading && <ProcessingOverlay />}
    </div>
  );
};

export default ProjectDetail;