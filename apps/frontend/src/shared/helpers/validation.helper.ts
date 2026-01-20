/**
 * Validation Utilities
 * Functions for validating data formats
 */

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns True if email format is valid, false otherwise
 *
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
