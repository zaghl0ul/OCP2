import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Key,
  Server,
  Shield,
  Monitor,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

const Settings = () => {
  const {
    apiKeys,
    modelSettings,
    security,
    appSettings,
    backendUrl,
    isBackendConnected,
    availableProviders,
    setApiKey,
    updateModelSettings,
    updateSecurity,
    updateAppSettings,
    setBackendUrl,
    loadProviders,
    testApiConnection,
    initialize
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('api');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testingConnection, setTestingConnection] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [localBackendUrl, setLocalBackendUrl] = useState(backendUrl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKey(provider, value);
  };

  const handleTestConnection = async (provider) => {
    setTestingConnection(provider);
    try {
      const result = await testApiConnection(provider);
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: true, message: 'Connection successful!' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: error.message }
      }));
    } finally {
      setTestingConnection(null);
    }
  };

  const handleBackendUrlUpdate = async () => {
    setSaving(true);
    try {
      setBackendUrl(localBackendUrl);
      await initialize(); // Reinitialize with new URL
    } catch (error) {
      console.error('Failed to update backend URL:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'app', label: 'Application', icon: Monitor }
  ];

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          API Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Configure your AI provider API keys for video analysis and processing.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries({
          openai: 'OpenAI',
          anthropic: 'Anthropic',
          google: 'Google',
          cohere: 'Cohere'
        }).map(([provider, label]) => {
          const isVisible = showApiKeys[provider];
          const isConnected = testResults[provider]?.success;
          const isTesting = testingConnection === provider;
          
          return (
            <div key={provider} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label} API Key
                </label>
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {testResults[provider] && !testResults[provider].success && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={apiKeys[provider] || ''}
                    onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                    placeholder={`Enter your ${label} API key`}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility(provider)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <button
                  onClick={() => handleTestConnection(provider)}
                  disabled={!apiKeys[provider] || isTesting}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isTesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  Test
                </button>
              </div>
              
              {testResults[provider] && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  testResults[provider].success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  {testResults[provider].message}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {availableProviders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Available Providers
          </h4>
          <div className="space-y-2">
            {availableProviders.map(provider => (
              <div key={provider.name} className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">{provider.name}</span>
                {provider.models && (
                  <span className="text-blue-600 dark:text-blue-300 ml-2">
                    ({provider.models.length} models available)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBackendTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Backend Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Configure the connection to your backend server.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backend URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={localBackendUrl}
                onChange={(e) => setLocalBackendUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleBackendUrlUpdate}
                disabled={saving || localBackendUrl === backendUrl}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection Status
              </span>
            </div>
            <span className={`text-sm font-medium ${
              isBackendConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isBackendConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Security Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Configure security and privacy settings for your application.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Encrypt API Keys</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Store API keys with encryption</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.encryptApiKeys}
                onChange={(e) => updateSecurity({ encryptApiKeys: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Auto-clear Sensitive Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clear sensitive data on app close</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={security.autoClearData}
                onChange={(e) => updateSecurity({ autoClearData: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Application Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Customize your application experience and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={appSettings.theme}
                onChange={(e) => updateAppSettings({ theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={appSettings.language}
                onChange={(e) => updateAppSettings({ language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Auto-save Projects</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save project changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appSettings.autoSave}
                onChange={(e) => updateAppSettings({ autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Show Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display system notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appSettings.notifications}
                onChange={(e) => updateAppSettings({ notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'api':
        return renderApiKeysTab();
      case 'backend':
        return renderBackendTab();
      case 'security':
        return renderSecurityTab();
      case 'app':
        return renderAppTab();
      default:
        return renderApiKeysTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your application settings, API keys, and preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;