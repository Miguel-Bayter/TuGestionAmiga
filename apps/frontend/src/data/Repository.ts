/**
 * API Repository
 * Centralized API client for making HTTP requests
 */

import { axPrivate } from '@/shared/infrastructure/provider'
import type { AxiosResponse, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
  data?: T
  error?: {
    message: string
    status?: number
  }
}

/**
 * API Client
 * Provides methods for making HTTP requests with consistent error handling
 */
export const api = {
  /**
   * GET request
   */
  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axPrivate.get(url)
      return { data: response.data }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      return {
        error: {
          message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
          status: axiosError.response?.status,
        },
      }
    }
  },

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axPrivate.post(url, data)
      return { data: response.data }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      return {
        error: {
          message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
          status: axiosError.response?.status,
        },
      }
    }
  },

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axPrivate.patch(url, data)
      return { data: response.data }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      return {
        error: {
          message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
          status: axiosError.response?.status,
        },
      }
    }
  },

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axPrivate.put(url, data)
      return { data: response.data }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      return {
        error: {
          message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
          status: axiosError.response?.status,
        },
      }
    }
  },

  /**
   * DELETE request
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axPrivate.delete(url)
      return { data: response.data }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      return {
        error: {
          message: axiosError.response?.data?.message || axiosError.message || 'Request failed',
          status: axiosError.response?.status,
        },
      }
    }
  },
}
