import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiService from '../services/api'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // API Configuration
      apiKeys: {
        openai: '',
        gemini: '',
        lmstudio: '',
        anthropic: '',
        cohere: '',
      },
      
      // Backend connection
      backendUrl: 'http://localhost:8000',
      isBackendConnected: false,
      
      // Model Settings
      modelSettings: {
        defaultProvider: 'openai',
        selectedModels: {
          openai: 'gpt-4',
          gemini: 'gemini-pro',
          lmstudio: 'local-model',
        },
        availableModels: {
          openai: [],
          gemini: [],
          lmstudio: [],
        },
        temperature: 0.7,
        maxTokens: 2000,
      },
      
      // Security Settings
      security: {
        encryptApiKeys: false,
        passphrase: '',
        autoLockTimeout: 30, // minutes
      },
      
      // Application Settings
      app: {
        theme: 'dark',
        language: 'en',
        autoSave: true,
        autoSaveInterval: 30, // seconds
        maxProjectHistory: 50,
        defaultVideoQuality: 'high',
        enableAnalytics: true,
        enableNotifications: true,
      },
      
      // Export Settings
      export: {
        defaultFormat: 'mp4',
        defaultQuality: '1080p',
        defaultFrameRate: 30,
        includeWatermark: false,
        watermarkText: 'OpenClip Pro',
        outputDirectory: '',
      },
      
      // Performance Settings
      performance: {
        enableHardwareAcceleration: true,
        maxConcurrentProcessing: 2,
        cacheSize: 1024, // MB
        previewQuality: 'medium',
        enablePreloading: true,
      },
      
      // Actions
      loadSettings: () => {
        // Settings are automatically loaded by persist middleware
      },
      
      updateApiKey: async (provider, key) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key,
          },
        }))
        
        // Update backend if connected
        try {
          if (get().isBackendConnected) {
            await apiService.updateSettings('api_keys', provider, key);
          }
        } catch (error) {
          console.error('Failed to update API key on backend:', error);
        }
      },
      
      updateModelSetting: async (key, value) => {
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            [key]: value,
          },
        }))
        
        // Update backend if connected
        try {
          if (get().isBackendConnected) {
            await apiService.updateSettings('model_settings', key, value);
          }
        } catch (error) {
          console.error('Failed to update model settings on backend:', error);
        }
      },
      
      updateSelectedModel: (provider, model) => {
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            selectedModels: {
              ...state.modelSettings.selectedModels,
              [provider]: model,
            },
          },
        }))
      },
      
      setAvailableModels: (provider, models) => {
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            availableModels: {
              ...state.modelSettings.availableModels,
              [provider]: models,
            },
          },
        }))
      },
      
      updateAppSetting: async (key, value) => {
        set((state) => ({
          app: {
            ...state.app,
            [key]: value,
          },
        }))
        
        // Update backend if connected
        try {
          if (get().isBackendConnected) {
            await apiService.updateSettings('app_settings', key, value);
          }
        } catch (error) {
          console.error('Failed to update app settings on backend:', error);
        }
      },
      
      updateExportSetting: (key, value) => {
        set((state) => ({
          export: {
            ...state.export,
            [key]: value,
          },
        }))
      },
      
      updatePerformanceSetting: (key, value) => {
        set((state) => ({
          performance: {
            ...state.performance,
            [key]: value,
          },
        }))
      },
      
      updateSecuritySetting: (key, value) => {
        set((state) => ({
          security: {
            ...state.security,
            [key]: value,
          },
        }))
      },
      
      // Validation
      validateApiKey: (provider, key) => {
        if (!key || key.trim() === '') return false
        
        switch (provider) {
          case 'openai':
            return key.startsWith('sk-') && key.length > 20
          case 'gemini':
            return key.length > 10
          case 'lmstudio':
            return true // Local doesn't need validation
          default:
            return false
        }
      },
      
      // Fetch available models
      fetchAvailableModels: async (provider) => {
        const state = get()
        const apiKey = state.apiKeys[provider]
        
        if (!apiKey && provider !== 'lmstudio') {
          throw new Error(`API key required for ${provider}`)
        }
        
        try {
          const response = await fetch(`/api/providers/${provider}/models?api_key=${encodeURIComponent(apiKey || '')}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`)
          }
          
          const data = await response.json()
          const models = data.models || []
          
          get().setAvailableModels(provider, models)
          return models
          
        } catch (error) {
          console.error(`Failed to fetch models for ${provider}:`, error)
          throw error
        }
      },
      
      // Test API connection
      testApiConnection: async (provider) => {
        try {
          if (!get().isBackendConnected) {
            throw new Error('Backend not connected');
          }
          
          const key = get().apiKeys[provider];
          if (!key) {
            throw new Error(`No API key provided for ${provider}`);
          }
          
          // Use the API service to test the connection
          const result = await apiService.testAPIConnection(provider, key);
          
          if (result.success) {
            // If successful, try to fetch available models
            try {
              const models = await apiService.getProviderModels(provider);
              get().setAvailableModels(provider, models);
            } catch (modelError) {
              console.warn(`Successfully connected to ${provider} but failed to fetch models:`, modelError);
            }
          }
          
          return result;
        } catch (error) {
          console.error(`API connection test failed for ${provider}:`, error);
          throw error;
        }
      },
      
      // Backend integration methods
      setBackendUrl: (url) => {
        set({ backendUrl: url });
        apiService.baseURL = url;
      },
      
      setBackendConnected: (connected) => {
        set({ isBackendConnected: connected });
      },
      
      // Initialize the store by connecting to backend and loading settings
      initialize: async () => {
        try {
          // Check if backend is available
          await apiService.healthCheck();
          set({ isBackendConnected: true });
          
          // Load settings from backend
          try {
            const settings = await apiService.getSettings();
            
            // Update model settings if available
            if (settings.model_settings) {
              set(state => ({
                modelSettings: {
                  ...state.modelSettings,
                  ...settings.model_settings
                }
              }));
            }
            
            // Update app settings if available
            if (settings.app_settings) {
              set(state => ({
                app: {
                  ...state.app,
                  ...settings.app_settings
                }
              }));
            }
            
            console.log('Settings loaded from backend');
          } catch (settingsError) {
            console.warn('Failed to load settings from backend:', settingsError);
          }
          
          // Load available providers
          try {
            await get().loadProviders();
          } catch (providersError) {
            console.warn('Failed to load providers:', providersError);
          }
          
          return true;
        } catch (error) {
          console.error('Backend connection failed:', error);
          set({ isBackendConnected: false });
          return false;
        }
      },
      
      // Load providers from backend
      loadProviders: async () => {
        if (!get().isBackendConnected) {
          return [];
        }
        
        try {
          const providers = await apiService.getProviders();
          set({ availableProviders: providers || [] });
          return providers;
        } catch (error) {
          console.error('Failed to load providers:', error);
          set({ availableProviders: [] });
          throw error;
        }
      },
      
      // Reset settings
      resetSettings: () => {
        set({
          apiKeys: {
            openai: '',
            gemini: '',
            lmstudio: '',
            anthropic: '',
            cohere: '',
          },
          modelSettings: {
            defaultProvider: 'openai',
            selectedModels: {
              openai: 'gpt-4',
              gemini: 'gemini-pro',
              lmstudio: 'local-model',
            },
            availableModels: {
              openai: [],
              gemini: [],
              lmstudio: [],
              anthropic: [],
              cohere: [],
            },
            temperature: 0.7,
            maxTokens: 2000,
          },
          app: {
            theme: 'dark',
            language: 'en',
            autoSave: true,
            autoSaveInterval: 30,
            maxProjectHistory: 50,
            defaultVideoQuality: 'high',
            enableAnalytics: true,
            enableNotifications: true,
          },
          isBackendConnected: false,
        })
      },
      
      // Export/Import settings
      exportSettings: () => {
        const state = get()
        const exportData = {
          modelSettings: state.modelSettings,
          app: state.app,
          export: state.export,
          performance: state.performance,
          // Don't export API keys for security
        }
        return JSON.stringify(exportData, null, 2)
      },
      
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson)
          set((state) => ({
            ...state,
            ...settings,
          }))
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        }
      },
      
      // Add missing setApiKey method
      setApiKey: async (provider, key) => {
        // First update the local state
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key,
          },
        }));
        
        // Then update backend if connected
        if (get().isBackendConnected) {
          try {
            await apiService.setApiKey(provider, key);
            return { success: true };
          } catch (error) {
            console.error(`Failed to set API key for ${provider}:`, error);
            return { success: false, error: error.message };
          }
        }
        
        return { success: true };
      },
    }),
    {
      name: 'openclip-settings',
      // Don't persist API keys in localStorage for security
      partialize: (state) => ({
        modelSettings: state.modelSettings,
        app: state.app,
        export: state.export,
        performance: state.performance,
        security: {
          ...state.security,
          passphrase: '', // Don't persist passphrase
        },
      }),
    }
  )
)

export { useSettingsStore }