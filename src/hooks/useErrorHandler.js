import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { APIError } from '../utils/apiClient'

// Error types
const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'auth',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
}

// Error severity levels
const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState([])
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  const categorizeError = useCallback((error) => {
    if (error instanceof APIError) {
      if (error.statusCode === 0) {
        return {
          type: ERROR_TYPES.NETWORK,
          severity: ERROR_SEVERITY.HIGH,
          userMessage: 'Network connection failed. Please check your internet connection.',
          canRetry: true
        }
      }

      if (error.statusCode >= 400 && error.statusCode < 500) {
        if (error.statusCode === 401 || error.statusCode === 403) {
          return {
            type: ERROR_TYPES.AUTH,
            severity: ERROR_SEVERITY.HIGH,
            userMessage: 'Authentication failed. Please check your credentials.',
            canRetry: false
          }
        }

        if (error.statusCode === 422) {
          return {
            type: ERROR_TYPES.VALIDATION,
            severity: ERROR_SEVERITY.MEDIUM,
            userMessage: error.message || 'Please check your input and try again.',
            canRetry: false
          }
        }

        return {
          type: ERROR_TYPES.CLIENT,
          severity: ERROR_SEVERITY.MEDIUM,
          userMessage: error.message || 'There was a problem with your request.',
          canRetry: false
        }
      }

      if (error.statusCode >= 500) {
        return {
          type: ERROR_TYPES.SERVER,
          severity: ERROR_SEVERITY.HIGH,
          userMessage: 'Server error occurred. Please try again later.',
          canRetry: true
        }
      }
    }

    // Generic error handling
    return {
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      userMessage: error.message || 'An unexpected error occurred.',
      canRetry: false
    }
  }, [])

  const handleError = useCallback((error, context = {}) => {
    const errorInfo = categorizeError(error)
    
    const errorDetails = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      originalError: error,
      context,
      ...errorInfo
    }

    setErrors(prev => [errorDetails, ...prev].slice(0, 50)) // Keep last 50 errors

    // Show appropriate notification based on severity
    switch (errorInfo.severity) {
      case ERROR_SEVERITY.CRITICAL:
        toast.error(errorInfo.userMessage, {
          duration: 10000,
          id: `error-${errorDetails.id}`
        })
        setIsErrorModalOpen(true)
        break
        
      case ERROR_SEVERITY.HIGH:
        toast.error(errorInfo.userMessage, {
          duration: 6000,
          id: `error-${errorDetails.id}`
        })
        break
        
      case ERROR_SEVERITY.MEDIUM:
        toast.error(errorInfo.userMessage, {
          duration: 4000,
          id: `error-${errorDetails.id}`
        })
        break
        
      case ERROR_SEVERITY.LOW:
        toast(errorInfo.userMessage, {
          duration: 3000,
          id: `error-${errorDetails.id}`,
          icon: '⚠️'
        })
        break
        
      default:
        toast.error(errorInfo.userMessage, {
          duration: 4000,
          id: `error-${errorDetails.id}`
        })
    }

    // Log error for debugging
    console.error('Error handled:', {
      message: error.message,
      type: errorInfo.type,
      severity: errorInfo.severity,
      context,
      stack: error.stack
    })

    return errorDetails
  }, [categorizeError])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId))
  }, [])

  const retryOperation = useCallback(async (operation, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          handleError(error, { attempt, maxRetries })
          throw error
        }

        const errorInfo = categorizeError(error)
        if (!errorInfo.canRetry) {
          handleError(error, { attempt, reason: 'not_retryable' })
          throw error
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))

        toast(`Retrying... (${attempt}/${maxRetries})`, {
          duration: 2000,
          icon: '🔄'
        })
      }
    }
  }, [handleError, categorizeError])

  const withErrorHandling = useCallback((operation, context = {}) => {
    return async (...args) => {
      try {
        return await operation(...args)
      } catch (error) {
        handleError(error, context)
        throw error
      }
    }
  }, [handleError])

  // Specific error handlers for common scenarios
  const handleUploadError = useCallback((error, fileName) => {
    return handleError(error, { 
      operation: 'file_upload', 
      fileName,
      userAction: 'Try uploading a smaller file or check your connection'
    })
  }, [handleError])

  const handleAnalysisError = useCallback((error, projectId) => {
    return handleError(error, { 
      operation: 'ai_analysis', 
      projectId,
      userAction: 'Check your AI provider settings and try again'
    })
  }, [handleError])

  const handleNetworkError = useCallback((error) => {
    return handleError(error, { 
      operation: 'network_request',
      userAction: 'Check your internet connection and try again'
    })
  }, [handleError])

  return {
    // State
    errors,
    isErrorModalOpen,
    setIsErrorModalOpen,

    // Core handlers
    handleError,
    categorizeError,
    
    // Utilities
    clearErrors,
    removeError,
    retryOperation,
    withErrorHandling,

    // Specific handlers
    handleUploadError,
    handleAnalysisError,
    handleNetworkError,

    // Error types and severity for components to use
    ERROR_TYPES,
    ERROR_SEVERITY
  }
} 