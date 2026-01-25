/**
 * useUIState Hook
 * Custom hook for accessing UI state with subscription
 * Replaces Zustand useUIStore
 */

import { useState, useEffect } from 'react'
import { useService } from './use-container.hook'

interface UIState {
  isSidebarOpen: boolean
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'
}

/**
 * Hook for accessing UI state with automatic subscription
 *
 * @returns UI state object
 *
 * @example
 * const uiState = useUIState()
 * console.log(uiState.isSidebarOpen)
 */
export function useUIState(): UIState {
  const uiService = useService('uiStateService')
  const [state, setState] = useState<UIState>(() => uiService.getState())

  useEffect(() => {
    const unsubscribe = uiService.subscribe((newState: UIState) => {
      setState(newState)
    })
    return unsubscribe
  }, [uiService])

  return state
}
