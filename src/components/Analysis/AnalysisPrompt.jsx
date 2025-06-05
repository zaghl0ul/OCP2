import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SendIcon,
  SparklesIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  MessageSquareIcon,
  BarChart3Icon
} from 'lucide-react'

const AnalysisPrompt = ({ onAnalyze, isAnalyzing = false, className = '', initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt)
    }
  }, [initialPrompt])

  const analysisTemplates = [
    {
      id: 'engagement',
      title: 'Engagement Analysis',
      description: 'Analyze viewer engagement and retention patterns',
      icon: TrendingUpIcon,
      prompt: 'Analyze the engagement patterns in this video. Focus on moments where viewers are most engaged, drop-off points, and suggest improvements for better retention.'
    },
    {
      id: 'content',
      title: 'Content Quality',
      description: 'Evaluate content structure and delivery',
      icon: TargetIcon,
      prompt: 'Evaluate the content quality of this video. Analyze the structure, pacing, clarity of message, and provide suggestions for improvement.'
    },
    {
      id: 'audience',
      title: 'Audience Insights',
      description: 'Understand your target audience better',
      icon: UsersIcon,
      prompt: 'Provide insights about the target audience for this video. Analyze who would be most interested in this content and suggest ways to better reach them.'
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      description: 'Comprehensive performance analysis',
      icon: BarChart3Icon,
      prompt: 'Analyze the overall performance of this video. Include metrics interpretation, comparison with similar content, and actionable recommendations.'
    },
    {
      id: 'storytelling',
      title: 'Storytelling Analysis',
      description: 'Evaluate narrative structure and flow',
      icon: MessageSquareIcon,
      prompt: 'Analyze the storytelling elements in this video. Evaluate the narrative structure, emotional arc, and suggest improvements for better storytelling.'
    },
    {
      id: 'timing',
      title: 'Timing & Pacing',
      description: 'Optimize video timing and pacing',
      icon: ClockIcon,
      prompt: 'Analyze the timing and pacing of this video. Identify segments that are too fast or slow, and suggest optimal pacing for better viewer experience.'
    }
  ]

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setPrompt(template.prompt)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && onAnalyze) {
      onAnalyze(prompt.trim())
    }
  }

  const handleCustomPrompt = () => {
    setSelectedTemplate(null)
    setPrompt('')
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Video Analysis</h3>
      </div>

      {/* Analysis Templates */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Analysis Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysisTemplates.map((template) => {
            const IconComponent = template.icon
            return (
              <motion.button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-2">
                  <IconComponent className={`w-4 h-4 mt-0.5 ${
                    selectedTemplate?.id === template.id ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs opacity-75 mt-1">{template.description}</div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Custom Prompt Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="analysis-prompt" className="text-sm font-medium text-gray-700">
              Analysis Prompt
            </label>
            {selectedTemplate && (
              <button
                type="button"
                onClick={handleCustomPrompt}
                className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
              >
                Write custom prompt
              </button>
            )}
          </div>
          
          <textarea
            id="analysis-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you'd like to analyze about this video..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isAnalyzing}
          />
        </div>

        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <selectedTemplate.icon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Using template: {selectedTemplate.title}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {selectedTemplate.description}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {prompt.length}/1000 characters
          </div>
          
          <motion.button
            type="submit"
            disabled={!prompt.trim() || isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                Analyze Video
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Analysis Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">💡 Analysis Tips</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Be specific about what aspects you want to analyze</li>
          <li>• Mention your target audience or goals for better insights</li>
          <li>• Ask for actionable recommendations, not just observations</li>
          <li>• Consider asking about specific timestamps or segments</li>
        </ul>
      </div>
    </div>
  )
}

export default AnalysisPrompt