import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import apiService from '../services/api'

const useProjectStore = create(
  persist(
    (set, get) => ({
      // Current state
      projects: [],
      currentProject: null,
      isProcessing: false,
      processingProgress: 0,
      processingStatus: '',
      isBackendConnected: false,
      
      // Initialize store and check backend connection
      initialize: async () => {
        set({ isProcessing: true });
        try {
          // Test backend connection
          await apiService.healthCheck();
          set({ isBackendConnected: true });
          
          // Load projects from backend
          const response = await apiService.getProjects();
          // Extract the projects array from the response object
          const projects = response.projects || [];
          set({ projects, isProcessing: false });
        } catch (error) {
          console.error('Backend connection failed:', error.message);
          set({ 
            isBackendConnected: false, 
            projects: [], 
            isProcessing: false 
          });
          throw new Error('Backend connection required. Please ensure the backend server is running.');
        }
      },
      
      // Actions
      createProject: async (projectData) => {
        set({ isProcessing: true });
        
        try {
          const { isBackendConnected } = get();
          
          if (!isBackendConnected) {
            throw new Error('Backend connection required to create projects.');
          }
          
          // If projectData is a string (name), convert to object format for backward compatibility
          if (typeof projectData === 'string') {
            const name = projectData;
            const description = arguments[1] || '';
            projectData = { 
              name, 
              description, 
              type: 'upload'  // Default to 'upload' type
            };
          }
          
          // Ensure projectData has type field
          if (!projectData.type) {
            projectData.type = 'upload';
          }
          
          console.log('projectStore: Creating project with data:', projectData);
          
          const response = await apiService.createProject(projectData);
          const project = response.project || response; // Extract project from response
          set((state) => ({
            projects: [project, ...state.projects],
            currentProject: project,
            isProcessing: false
          }));
          return project;
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? { ...project, ...updates, updatedAt: Date.now() }
              : project
          ),
          currentProject: state.currentProject?.id === projectId
            ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
            : state.currentProject,
        }))
      },
      
      deleteProject: async (projectId) => {
        set({ isProcessing: true });
        
        try {
          const { isBackendConnected } = get();
          
          if (!isBackendConnected) {
            throw new Error('Backend connection required to delete projects.');
          }
          
          await apiService.deleteProject(projectId);
          
          set((state) => ({
            projects: state.projects.filter(project => project.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            isProcessing: false
          }));
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      setCurrentProject: (projectId) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        if (project) {
          set({ currentProject: project })
        }
      },
      
      addVideoToProject: async (projectId, videoData) => {
        set({ isProcessing: true });
        
        try {
          const { isBackendConnected } = get();
          
          if (!isBackendConnected) {
            throw new Error('Backend connection required to upload videos.');
          }
          
          const response = await apiService.uploadVideo(projectId, videoData);
          const updatedProject = response.project || response; // Extract project from response
          get().updateProject(projectId, updatedProject);
          set({ isProcessing: false });
          return updatedProject.video;
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      setAnalysisPrompt: (projectId, prompt) => {
        get().updateProject(projectId, {
          analysisPrompt: prompt,
        })
      },
      
      startAnalysis: async (projectId, provider = null, model = null) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        
        if (!project || !project.video || !project.analysisPrompt) {
          throw new Error('Project, video, and analysis prompt are required')
        }
        
        set({
          isProcessing: true,
          processingProgress: 0,
          processingStatus: 'Initializing analysis...',
        })
        
        get().updateProject(projectId, { status: 'analyzing' })
        
        try {
          const { isBackendConnected } = get();
          
          if (!isBackendConnected) {
            throw new Error('Backend connection required to analyze videos.');
          }
          
          const response = await apiService.analyzeVideo(projectId, project.analysisPrompt, provider, model);
          const updatedProject = response.project || response; // Extract project from response
          get().updateProject(projectId, updatedProject);
          set({
            isProcessing: false,
            processingProgress: 100,
            processingStatus: 'Analysis completed',
          });
          return updatedProject.clips;
        } catch (error) {
          get().updateProject(projectId, {
            status: 'error',
            error: error.message,
          })
          throw error
        } finally {
          set({
            isProcessing: false,
            processingProgress: 0,
            processingStatus: '',
          })
        }
      },
      

      
      updateClip: (projectId, clipId, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  clips: project.clips.map(clip =>
                    clip.id === clipId ? { ...clip, ...updates } : clip
                  ),
                  updatedAt: Date.now(),
                }
              : project
          ),
          currentProject: state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                clips: state.currentProject.clips.map(clip =>
                  clip.id === clipId ? { ...clip, ...updates } : clip
                ),
                updatedAt: Date.now(),
              }
            : state.currentProject,
        }))
      },
      
      deleteClip: (projectId, clipId) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  clips: project.clips.filter(clip => clip.id !== clipId),
                  updatedAt: Date.now(),
                }
              : project
          ),
          currentProject: state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                clips: state.currentProject.clips.filter(clip => clip.id !== clipId),
                updatedAt: Date.now(),
              }
            : state.currentProject,
        }))
      },
      
      reorderClips: (projectId, clipIds) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        if (!project) return
        
        const reorderedClips = clipIds.map(id => 
          project.clips.find(clip => clip.id === id)
        ).filter(Boolean)
        
        get().updateProject(projectId, { clips: reorderedClips })
      },
      
      exportClip: async (projectId, clipId, format = 'mp4') => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        const clip = project?.clips.find(c => c.id === clipId)
        
        if (!project || !clip) {
          throw new Error('Project or clip not found')
        }
        
        // Simulate export process
        set({
          isProcessing: true,
          processingStatus: `Exporting ${clip.name}...`,
        })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // In a real app, this would trigger actual video export
          const exportData = {
            clipId,
            projectId,
            format,
            exportedAt: Date.now(),
            filename: `${clip.name}.${format}`,
          }
          
          return exportData
          
        } finally {
          set({
            isProcessing: false,
            processingStatus: '',
          })
        }
      },
      
      // Utility functions
      getProjectById: (projectId) => {
        const state = get()
        return state.projects.find(p => p.id === projectId)
      },
      
      getRecentProjects: (limit = 5) => {
        const state = get()
        const projects = state.projects || []
        return projects
          .sort((a, b) => {
            // Use updated_at from backend or updatedAt for local updates
            const aDate = new Date(a.updated_at || a.updatedAt || a.created_at || 0)
            const bDate = new Date(b.updated_at || b.updatedAt || b.created_at || 0)
            return bDate - aDate
          })
          .slice(0, limit)
      },

      searchProjects: (query) => {
        const state = get()
        const projects = state.projects || []
        const lowercaseQuery = query.toLowerCase()
        return projects.filter(project =>
          (project.name || '').toLowerCase().includes(lowercaseQuery) ||
          (project.description || '').toLowerCase().includes(lowercaseQuery)
        )
      },
      
      getProjectStats: () => {
        const state = get()
        const projects = Array.isArray(state.projects) ? state.projects : []
        return {
          totalProjects: projects.length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          totalClips: projects.reduce((sum, p) => sum + (Array.isArray(p.clips) ? p.clips.length : 0), 0),
          averageScore: projects.length > 0 ? projects.reduce((sum, p) => {
            const projectAvg = Array.isArray(p.clips) && p.clips.length > 0 
              ? p.clips.reduce((s, c) => s + (c?.score || 0), 0) / p.clips.length 
              : 0
            return sum + projectAvg
          }, 0) / projects.length : 0,
        }
      },
      
      // Get a specific project, fetching from API if needed
      getProject: async (projectId) => {
        const { projects, isBackendConnected } = get();
        
        // First check if project exists in local state
        const localProject = projects.find(p => p.id === projectId);
        
        // If not found or backend is connected, try to fetch from API
        if (!localProject || isBackendConnected) {
          try {
            // Get latest project data from the backend
            const { project } = await apiService.getProject(projectId);
            
            // Update store with latest project data
            set((state) => ({
              projects: state.projects.map(p => 
                p.id === projectId ? project : p
              ).concat(!state.projects.find(p => p.id === projectId) ? [project] : []),
              currentProject: state.currentProject?.id === projectId ? project : state.currentProject
            }));
            
            return project;
          } catch (error) {
            console.error(`Failed to fetch project ${projectId}:`, error);
            
            // If we couldn't fetch from API but have local data, return that
            if (localProject) {
              return localProject;
            }
            
            throw error;
          }
        }
        
        // Return local project if available
        return localProject;
      },
    }),
    {
      name: 'openclip-projects',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
)

export default useProjectStore