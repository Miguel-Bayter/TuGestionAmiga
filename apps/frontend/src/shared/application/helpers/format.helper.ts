/**
 * Format Utilities
 * Functions for formatting currency, dates, and other data
 */

/**
 * Format currency (Colombian Pesos)
 *
 * @param amount - The amount to format
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(50000) // 'COP 50.000'
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to locale string
 *
 * @param date - The date to format (string or Date object)
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-18') // 'January 18, 2024'
 * formatDate(new Date()) // 'January 18, 2024'
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format date to short string (DD/MM/YYYY)
 *
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string in DD/MM/YYYY format
 *
 * @example
 * formatDateShort('2024-01-18') // '18/01/2024'
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
