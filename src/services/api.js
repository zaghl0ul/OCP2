// Legacy API service - now uses the new centralized API client
import apiClient from '../utils/apiClient'

// Re-export the new API client as the default export for backward compatibility
export default apiClient

// Legacy named exports for backward compatibility
export const {
  healthCheck,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadVideo,
  processYouTube,
  analyzeVideo,
  updateClip,
  deleteClip,
  exportClips,
  getSettings,
  updateSettings,
  getProviders,
  getProviderModels,
  testAPIConnection,
  setApiKey
} = apiClient