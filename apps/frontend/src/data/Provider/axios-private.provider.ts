/**
 * Axios Private Instance
 * HTTP client for protected endpoints with automatic authentication and token refresh
 */

import axios, { type AxiosError } from 'axios'
import { API_BASE_URL, HTTP_STATUS } from '@/shared/config'
import { TokenManager } from './tokenManager'

/**
 * Private Axios instance
 * Used for authenticated endpoints
 * Automatically adds Bearer token and handles 401 responses with token refresh
 */
export const axPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * Adds Authorization header with Bearer token before each request
 */
axPrivate.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles 401 Unauthorized responses by attempting to refresh the token
 * If refresh succeeds, retries the original request
 * If refresh fails, redirects to login
 */
axPrivate.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config

    // If response status is 401 and we have a request config
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && originalRequest) {
      try {
        // Attempt to refresh the access token
        const newToken = await TokenManager.refreshAccessToken()

        if (newToken) {
          // Update the Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`

          // Retry the original request
          return axPrivate(originalRequest)
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        console.error('Token refresh failed during request:', refreshError)
        // Redirect to login on refresh failure
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axPrivate
