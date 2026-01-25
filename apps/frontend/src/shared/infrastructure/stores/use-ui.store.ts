/**
 * UI Store
 * Manages global UI state (modals, sidebar, theme, etc.)
 */

import { create } from 'zustand'

interface UIState {
  // State
  isSidebarOpen: boolean
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'

  // Actions
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  toggleSearch: () => void
  closeSearch: () => void
  openSearch: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  openMobileMenu: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSidebarOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  activeModal: null,
  theme: 'system',

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  // Search actions
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),

  // Mobile menu actions
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),

  // Modal actions
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme })

    // Apply theme to document
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  },
}))
