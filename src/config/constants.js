// Application configuration constants
export const APP_CONFIG = {
  name: 'OpenClip Pro',
  version: '1.0.0',
  description: 'AI-powered video clipping application',
  
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: {
      default: 30000,
      upload: 300000,
      analysis: 180000,
      export: 300000,
    },
    retries: {
      max: 3,
      delay: 1000,
    }
  },

  // File handling
  files: {
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      allowedTypes: [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/mkv',
        'video/wmv',
        'video/flv',
        'video/webm'
      ],
      allowedExtensions: ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    },
    export: {
      formats: ['mp4', 'avi', 'mov', 'webm'],
      qualities: [
        { value: 'high', label: 'High Quality (1080p)', resolution: '1920x1080' },
        { value: 'medium', label: 'Medium Quality (720p)', resolution: '1280x720' },
        { value: 'low', label: 'Low Quality (480p)', resolution: '854x480' }
      ]
    }
  },

  // UI Configuration
  ui: {
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100,
    },
    notifications: {
      duration: {
        success: 3000,
        error: 5000,
        warning: 4000,
        info: 3000,
      }
    },
    theme: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  },

  // AI Provider Settings
  aiProviders: {
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision Preview' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ],
      apiKeyPrefix: 'sk-',
      supportsVision: true
    },
    gemini: {
      name: 'Google Gemini',
      models: [
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
        { id: 'gemini-pro', name: 'Gemini Pro' }
      ],
      supportsVision: true
    },
    lmstudio: {
      name: 'LM Studio',
      defaultUrl: 'http://localhost:1234',
      models: [], // Dynamic based on local setup
      supportsVision: false
    },
    anthropic: {
      name: 'Anthropic Claude',
      models: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
      ],
      supportsVision: true
    }
  },

  // Analysis Templates
  analysisTemplates: [
    {
      id: 'engagement',
      name: 'Engagement Analysis',
      description: 'Find moments with high viewer engagement',
      icon: 'TrendingUp',
      prompt: 'Analyze viewer engagement patterns and identify the most captivating moments.'
    },
    {
      id: 'humor',
      name: 'Humor Detection',
      description: 'Identify funny and entertaining moments',
      icon: 'Smile',
      prompt: 'Find humorous moments that would make great social media clips.'
    },
    {
      id: 'educational',
      name: 'Educational Content',
      description: 'Extract key learning moments',
      icon: 'BookOpen',
      prompt: 'Identify educational segments that clearly explain concepts.'
    },
    {
      id: 'viral',
      name: 'Viral Potential',
      description: 'Find moments with viral potential',
      icon: 'Zap',
      prompt: 'Identify moments with high shareability and viral potential.'
    },
    {
      id: 'emotional',
      name: 'Emotional Impact',
      description: 'Detect emotionally impactful moments',
      icon: 'Heart',
      prompt: 'Find moments that evoke strong emotional responses.'
    }
  ],

  // Video Analysis Settings
  analysis: {
    defaultClipLength: 30, // seconds
    minClipLength: 5,
    maxClipLength: 300,
    segmentLength: 30, // For analysis chunking
    maxPromptLength: 2000,
    minPromptLength: 10
  },

  // Performance Settings
  performance: {
    chunkSize: 1024 * 1024, // 1MB chunks for uploads
    cacheSize: 50, // Number of items to cache
    debounceDelay: 300, // ms for search/filter operations
    lazyLoadThreshold: 100 // pixels before triggering lazy load
  },

  // Routes
  routes: {
    home: '/',
    dashboard: '/dashboard',
    projects: '/projects',
    project: '/projects/:id',
    clips: '/clips',
    analytics: '/analytics',
    settings: '/settings'
  },

  // Feature Flags
  features: {
    enableAdvancedAnalysis: true,
    enableBatchProcessing: true,
    enableRealTimePreview: true,
    enableAutoSave: true,
    enableOfflineMode: false,
    enableAnalytics: true
  },

  // Validation Rules
  validation: {
    projectName: {
      minLength: 1,
      maxLength: 100,
      pattern: /^[^<>:"/\\|?*]+$/
    },
    description: {
      maxLength: 1000
    },
    youtubeUrl: {
      patterns: [
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
      ]
    }
  }
}

// Environment-specific overrides
if (import.meta.env.DEV) {
  APP_CONFIG.api.timeout.default = 60000 // Longer timeout in dev
  APP_CONFIG.features.enableAnalytics = false // Disable analytics in dev
}

// Export individual sections for convenience
export const {
  api: API_CONFIG,
  files: FILE_CONFIG,
  ui: UI_CONFIG,
  aiProviders: AI_PROVIDERS,
  analysisTemplates: ANALYSIS_TEMPLATES,
  analysis: ANALYSIS_CONFIG,
  performance: PERFORMANCE_CONFIG,
  routes: ROUTES,
  features: FEATURES,
  validation: VALIDATION_RULES
} = APP_CONFIG

export default APP_CONFIG 