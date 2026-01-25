/**
 * Date Utilities
 * Functions for date calculations and comparisons
 */

/**
 * Calculate days between two dates
 *
 * @param start - Start date (string or Date object)
 * @param end - End date (string or Date object)
 * @returns Number of days between the dates (rounded up)
 *
 * @example
 * daysBetween('2024-01-01', '2024-01-10') // 9
 */
export function daysBetween(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end

  const diff = endDate.getTime() - startDate.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if a loan is overdue
 *
 * @param dueDate - The due date (string or Date object)
 * @returns True if the date is in the past, false otherwise
 *
 * @example
 * isOverdue('2024-01-01') // true (if today is after 2024-01-01)
 */
export function isOverdue(dueDate: string | Date): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  return due < new Date()
}
