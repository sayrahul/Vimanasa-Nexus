/**
 * Comprehensive Error Handling System
 * Centralized error handling with user-friendly messages
 */

import { toast } from 'react-hot-toast';

/**
 * Error types
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(type, message, details = null, recoverable = true) {
    super(message);
    this.type = type;
    this.details = details;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse API error response
 * @param {Response} response
 * @returns {Promise<AppError>}
 */
export async function parseApiError(response) {
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: 'An unexpected error occurred' };
  }

  const statusCode = response.status;
  let type = ErrorTypes.UNKNOWN;
  let recoverable = true;

  // Determine error type based on status code
  switch (statusCode) {
    case 400:
      type = ErrorTypes.VALIDATION;
      break;
    case 401:
      type = ErrorTypes.AUTHENTICATION;
      recoverable = false;
      break;
    case 403:
      type = ErrorTypes.AUTHORIZATION;
      recoverable = false;
      break;
    case 404:
      type = ErrorTypes.NOT_FOUND;
      break;
    case 500:
    case 502:
    case 503:
      type = ErrorTypes.SERVER;
      break;
    default:
      type = ErrorTypes.UNKNOWN;
  }

  return new AppError(
    type,
    errorData.message || 'An error occurred',
    errorData.details || errorData,
    recoverable
  );
}

/**
 * Handle network errors
 * @param {Error} error
 * @returns {AppError}
 */
export function handleNetworkError(error) {
  if (error.code === 'ENOTFOUND' || error.message.includes('fetch')) {
    return new AppError(
      ErrorTypes.NETWORK,
      'Network connection failed. Please check your internet connection.',
      error,
      true
    );
  }

  if (error.code === 'ETIMEDOUT') {
    return new AppError(
      ErrorTypes.NETWORK,
      'Request timed out. Please try again.',
      error,
      true
    );
  }

  return new AppError(
    ErrorTypes.UNKNOWN,
    error.message || 'An unexpected error occurred',
    error,
    true
  );
}

/**
 * Display error to user with toast
 * @param {AppError|Error} error
 * @param {Object} options
 */
export function showError(error, options = {}) {
  const {
    title = 'Error',
    duration = 5000,
    showDetails = false,
  } = options;

  let message = error.message || 'An unexpected error occurred';
  
  // Add recovery suggestions based on error type
  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorTypes.NETWORK:
        message += '\n\n💡 Try refreshing the page or checking your connection.';
        break;
      case ErrorTypes.AUTHENTICATION:
        message += '\n\n💡 Please log in again.';
        break;
      case ErrorTypes.AUTHORIZATION:
        message += '\n\n💡 You don\'t have permission for this action.';
        break;
      case ErrorTypes.VALIDATION:
        message += '\n\n💡 Please check your input and try again.';
        break;
      case ErrorTypes.SERVER:
        message += '\n\n💡 Our servers are experiencing issues. Please try again later.';
        break;
    }
  }

  // Show details if requested
  if (showDetails && error.details) {
    console.error('Error details:', error.details);
  }

  // Display toast
  toast.error(message, {
    duration,
    style: {
      maxWidth: '500px',
      whiteSpace: 'pre-line',
    },
  });

  // Log to console in development
  const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  if (isDev) {
    console.error(`[${title}]`, error);
  }
}

/**
 * Display success message
 * @param {string} message
 * @param {Object} options
 */
export function showSuccess(message, options = {}) {
  const { duration = 3000, icon = '✅' } = options;

  toast.success(message, {
    duration,
    icon,
    style: {
      maxWidth: '500px',
    },
  });
}

/**
 * Display info message
 * @param {string} message
 * @param {Object} options
 */
export function showInfo(message, options = {}) {
  const { duration = 3000, icon = 'ℹ️' } = options;

  toast(message, {
    duration,
    icon,
    style: {
      maxWidth: '500px',
    },
  });
}

/**
 * Display loading message
 * @param {string} message
 * @returns {string} Toast ID for updating
 */
export function showLoading(message = 'Loading...') {
  return toast.loading(message, {
    style: {
      maxWidth: '500px',
    },
  });
}

/**
 * Update loading toast
 * @param {string} toastId
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'info'
 */
export function updateToast(toastId, message, type = 'success') {
  const toastFn = type === 'success' ? toast.success : type === 'error' ? toast.error : toast;
  toastFn(message, { id: toastId });
}

/**
 * Async operation wrapper with error handling
 * @param {Function} operation
 * @param {Object} options
 * @returns {Promise<any>}
 */
export async function withErrorHandling(operation, options = {}) {
  const {
    loadingMessage = 'Processing...',
    successMessage = 'Operation completed successfully',
    errorTitle = 'Operation Failed',
    showSuccess: shouldShowSuccess = true,
    onError = null,
  } = options;

  const toastId = showLoading(loadingMessage);

  try {
    const result = await operation();
    
    if (shouldShowSuccess) {
      updateToast(toastId, successMessage, 'success');
    } else {
      toast.dismiss(toastId);
    }

    return result;
  } catch (error) {
    toast.dismiss(toastId);
    
    const appError = error instanceof AppError 
      ? error 
      : handleNetworkError(error);

    showError(appError, { title: errorTitle });

    if (onError) {
      onError(appError);
    }

    throw appError;
  }
}

/**
 * Retry operation with exponential backoff
 * @param {Function} operation
 * @param {Object} options
 * @returns {Promise<any>}
 */
export async function retryOperation(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry non-recoverable errors
      if (error instanceof AppError && !error.recoverable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait before retrying
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Log error to monitoring service (placeholder)
 * @param {Error} error
 * @param {Object} context
 */
export function logError(error, context = {}) {
  // In production, send to error monitoring service (Sentry, LogRocket, etc.)
  console.error('Error logged:', {
    error: {
      message: error.message,
      stack: error.stack,
      type: error.type,
    },
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
  });
}
