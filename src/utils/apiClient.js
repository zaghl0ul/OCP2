import axios from 'axios'

class APIError extends Error {
  constructor(message, statusCode, response = null) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.response = response
  }
}

class APIClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to requests
        config.metadata = { startTime: new Date() }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime
        console.debug(`API Request completed in ${duration}ms:`, {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          duration
        })

        // Extract data from standardized response format
        if (response.data && response.data.status === 'success') {
          return response.data.data
        }
        
        return response.data
      },
      async (error) => {
        return this.handleError(error)
      }
    )
  }

  async handleError(error) {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response
      
      let message = 'An error occurred'
      if (data && data.message) {
        message = data.message
      } else if (data && typeof data === 'string') {
        message = data
      } else if (error.message) {
        message = error.message
      }

      throw new APIError(message, status, data)
    } else if (error.request) {
      // Network error
      throw new APIError('Network error - please check your connection', 0)
    } else {
      // Other error
      throw new APIError(error.message || 'Unknown error occurred', 0)
    }
  }

  // Retry mechanism for failed requests
  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error
        }
        
        // Only retry on network errors or 5xx server errors
        if (error.statusCode === 0 || (error.statusCode >= 500 && error.statusCode < 600)) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
          continue
        }
        
        throw error
      }
    }
  }

  // Health check
  async healthCheck() {
    return this.retryRequest(() => this.client.get('/health'))
  }

  // Projects
  async getProjects() {
    return this.retryRequest(() => this.client.get('/api/projects'))
  }

  async getProject(projectId) {
    return this.retryRequest(() => this.client.get(`/api/projects/${projectId}`))
  }

  async createProject(projectData) {
    return this.client.post('/api/projects', projectData)
  }

  async updateProject(projectId, updates) {
    return this.client.put(`/api/projects/${projectId}`, updates)
  }

  async deleteProject(projectId) {
    return this.client.delete(`/api/projects/${projectId}`)
  }

  // Video upload
  async uploadVideo(projectId, videoFile, onProgress = null) {
    const formData = new FormData()
    formData.append('file', videoFile)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large files
    }

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }

    return this.client.post(`/api/projects/${projectId}/upload`, formData, config)
  }

  // YouTube processing
  async processYouTube(projectId, youtubeUrl) {
    return this.client.post(`/api/projects/${projectId}/youtube`, {
      youtube_url: youtubeUrl
    })
  }

  // Analysis
  async analyzeVideo(projectId, prompt, provider = null, model = null) {
    const payload = {
      project_id: projectId,
      prompt,
    }

    if (provider) payload.provider = provider
    if (model) payload.model = model

    return this.client.post(`/api/projects/${projectId}/analyze`, payload, {
      timeout: 180000, // 3 minutes for analysis
    })
  }

  // Clips
  async updateClip(projectId, clipId, clipData) {
    return this.client.put(`/api/projects/${projectId}/clips/${clipId}`, clipData)
  }

  async deleteClip(projectId, clipId) {
    return this.client.delete(`/api/projects/${projectId}/clips/${clipId}`)
  }

  async exportClips(projectId, exportSettings) {
    return this.client.post(`/api/projects/${projectId}/export`, exportSettings, {
      timeout: 300000, // 5 minutes for export
    })
  }

  // Settings
  async getSettings() {
    return this.retryRequest(() => this.client.get('/api/settings'))
  }

  async updateSettings(category, key, value) {
    return this.client.post('/api/settings', {
      category,
      key,
      value,
    })
  }

  // API providers
  async getProviders() {
    return this.retryRequest(() => this.client.get('/api/providers'))
  }

  async getProviderModels(provider) {
    return this.retryRequest(() => this.client.get(`/api/models/${provider}`))
  }

  async testAPIConnection(provider, apiKey) {
    return this.client.post('/api/settings/test-api', {
      provider,
      api_key: apiKey,
    })
  }

  async setApiKey(provider, apiKey) {
    return this.client.post('/api/settings/api-key', {
      provider,
      api_key: apiKey,
    })
  }

  // File operations
  async downloadFile(url, filename) {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })
    
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Utility methods
  setBaseURL(url) {
    this.client.defaults.baseURL = url
  }

  setTimeout(timeout) {
    this.client.defaults.timeout = timeout
  }

  setHeaders(headers) {
    Object.assign(this.client.defaults.headers, headers)
  }
}

// Create singleton instance
const apiClient = new APIClient(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
)

// Export both the class and instance
export { APIClient, APIError }
export default apiClient 