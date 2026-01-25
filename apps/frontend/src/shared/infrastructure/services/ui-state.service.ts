/**
 * UI State Service
 * Manages global UI state (modals, sidebar, theme, etc.)
 * Replaces Zustand useUIStore with service-based state management
 */

interface UIStateData {
  isSidebarOpen: boolean
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark' | 'system'
}

export class UIStateService {
  private state: UIStateData = {
    isSidebarOpen: false,
    isSearchOpen: false,
    isMobileMenuOpen: false,
    activeModal: null,
    theme: 'system',
  }

  private subscribers: Set<(state: UIStateData) => void> = new Set()

  // Sidebar actions
  toggleSidebar(): void {
    this.state.isSidebarOpen = !this.state.isSidebarOpen
    this.notifySubscribers()
  }

  closeSidebar(): void {
    this.state.isSidebarOpen = false
    this.notifySubscribers()
  }

  openSidebar(): void {
    this.state.isSidebarOpen = true
    this.notifySubscribers()
  }

  // Search actions
  toggleSearch(): void {
    this.state.isSearchOpen = !this.state.isSearchOpen
    this.notifySubscribers()
  }

  closeSearch(): void {
    this.state.isSearchOpen = false
    this.notifySubscribers()
  }

  openSearch(): void {
    this.state.isSearchOpen = true
    this.notifySubscribers()
  }

  // Mobile menu actions
  toggleMobileMenu(): void {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen
    this.notifySubscribers()
  }

  closeMobileMenu(): void {
    this.state.isMobileMenuOpen = false
    this.notifySubscribers()
  }

  openMobileMenu(): void {
    this.state.isMobileMenuOpen = true
    this.notifySubscribers()
  }

  // Modal actions
  openModal(modalId: string): void {
    this.state.activeModal = modalId
    this.notifySubscribers()
  }

  closeModal(): void {
    this.state.activeModal = null
    this.notifySubscribers()
  }

  // Theme actions
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.state.theme = theme

    // Apply theme to document
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }

    this.notifySubscribers()
  }

  // State management
  getState(): UIStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: UIStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
