/**
 * useApi Hook
 * Generic hook for making API calls with loading and error states
 */

import { useState, useCallback } from 'react'
import type { StatusType, ApiError } from '@/types'
import type { ApiResponse } from '@/lib/api'

interface UseApiState<T> {
  data: T | null
  status: StatusType
  error: ApiError | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<ApiResponse<T>>) => Promise<T | null>
  reset: () => void
}

/**
 * Hook for managing API call state
 *
 * @template T - The expected response data type
 * @returns API state and execute function
 *
 * @example
 * const { data, isLoading, error, execute } = useApi<Book[]>()
 *
 * const fetchBooks = async () => {
 *   const books = await execute(() => apiClient.get('/books'))
 *   if (books) {
 *     console.log(books)
 *   }
 * }
 */
export function useApi<T extends object>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    status: 'idle',
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    // Set loading state
    setState({
      data: null,
      status: 'loading',
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    })

    try {
      const response = await apiCall()

      // Handle error response
      if (response.error) {
        setState({
          data: null,
          status: 'error',
          error: response.error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        return null
      }

      // Handle success response
      if (response.data !== undefined) {
        setState({
          data: response.data,
          status: 'success',
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        return response.data
      }

      // Unexpected response format
      setState({
        data: null,
        status: 'error',
        error: {
          status: 500,
          message: 'Unexpected API response format',
        },
        isLoading: false,
        isSuccess: false,
        isError: true,
      })
      return null
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      setState({
        data: null,
        status: 'error',
        error: {
          status: 500,
          message: errorMessage,
        },
        isLoading: false,
        isSuccess: false,
        isError: true,
      })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      status: 'idle',
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
