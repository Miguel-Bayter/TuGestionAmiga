/**
 * String Utilities
 * Functions for string manipulation
 */

/**
 * Truncate text to a maximum length
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get initials from a name
 *
 * @param name - Full name
 * @returns Initials (max 2 characters)
 *
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('Jane Smith Anderson') // 'JS'
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
