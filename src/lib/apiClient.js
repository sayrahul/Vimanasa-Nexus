/**
 * API Client with Authentication
 * Centralized API calls with token management
 */

import { parseApiError, handleNetworkError } from './errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Set auth token in localStorage
 * @param {string} token
 */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

/**
 * Get user from localStorage
 * @returns {Object|null}
 */
export function getUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set user in localStorage
 * @param {Object} user
 */
export function setUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Make authenticated API request
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      window.location.href = '/'; // Redirect to login
      throw await parseApiError(response);
    }

    // Handle other error responses
    if (!response.ok) {
      throw await parseApiError(response);
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw handleNetworkError(error);
    }
    throw error;
  }
}

/**
 * API Client methods
 */
export const apiClient = {
  /**
   * GET request
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<any>}
   */
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  /**
   * POST request
   * @param {string} endpoint
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise<any>}
   */
  post: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  /**
   * PUT request
   * @param {string} endpoint
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise<any>}
   */
  put: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint
   * @param {Object} data
   * @param {Object} options
   * @returns {Promise<any>}
   */
  delete: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data),
      ...options,
    });
  },
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>}
   */
  login: async (username, password) => {
    const response = await apiClient.post('/api/auth/login', {
      username,
      password,
    });

    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
    }

    return response;
  },

  /**
   * Logout user
   */
  logout: () => {
    removeToken();
    window.location.href = '/';
  },

  /**
   * Verify token
   * @returns {Promise<Object>}
   */
  verify: async () => {
    try {
      const response = await apiClient.get('/api/auth/verify');
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      removeToken();
      throw error;
    }
  },
};

/**
 * Google Sheets API
 */
export const sheetsAPI = {
  /**
   * Get data from sheet
   * @param {string} sheetName
   * @returns {Promise<Array>}
   */
  get: async (sheetName) => {
    const table = sheetName.toLowerCase();
    const response = await apiClient.get(`/api/database?table=${table}`);
    return response.data || [];
  },

  /**
   * Add data to sheet
   * @param {string} sheetName
   * @param {Array} values
   * @returns {Promise<Object>}
   */
  add: async (sheetName, values) => {
    const table = sheetName.toLowerCase();
    return await apiClient.post('/api/database', {
      table,
      data: values,
    });
  },

  /**
   * Update data in sheet
   * @param {string} sheetName
   * @param {number} rowIndex
   * @param {Array} values
   * @returns {Promise<Object>}
   */
  update: async (sheetName, id, values) => {
    const table = sheetName.toLowerCase();
    return await apiClient.put('/api/database', {
      table,
      id,
      data: values,
    });
  },

  /**
   * Delete data from sheet
   * @param {string} sheetName
   * @param {number} rowIndex
   * @returns {Promise<Object>}
   */
  delete: async (sheetName, id) => {
    const table = sheetName.toLowerCase();
    return await apiClient.delete('/api/database', {
      table,
      id,
    });
  },
};
