/**
 * Class Name Utilities
 * Tailwind CSS utility functions
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with Tailwind merge
 * Useful for conditional className logic
 *
 * @param inputs - Class values to combine
 * @returns Merged class name string
 *
 * @example
 * cn('px-2', 'py-1', { 'text-red-500': isError })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
