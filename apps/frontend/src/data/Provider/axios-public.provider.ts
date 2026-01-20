/**
 * Axios Public Instance
 * HTTP client for public endpoints (no authentication required)
 */

import axios from 'axios'
import { API_BASE_URL } from '@/shared/config'

/**
 * Public Axios instance
 * Used for login, register, and other public endpoints
 * No automatic authentication or token refresh
 */
export const axPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axPublic
