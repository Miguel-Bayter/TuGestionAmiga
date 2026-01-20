/**
 * Async Utilities
 * Functions for async operations
 */

/**
 * Debounce function
 * Delays function execution until after a specified wait time
 *
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('searching:', query)
 * }, 500)
 *
 * debouncedSearch('test')
 * debouncedSearch('test2') // Only this one executes after 500ms
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Sleep/delay function
 * Pauses execution for a specified amount of time
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 *
 * @example
 * await sleep(1000)
 * console.log('1 second later')
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a unique ID
 *
 * @returns Unique identifier combining timestamp and random string
 *
 * @example
 * const id = generateId() // "1705602400000-a1b2c3d"
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
