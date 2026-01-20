/**
 * JWT Token Utilities
 * Functions for handling JWT tokens
 */

/**
 * Parse JWT token payload (without verification)
 * For display purposes only - verification happens on backend
 *
 * @param token - JWT token string
 * @returns Decoded payload object or null if invalid
 *
 * @example
 * const payload = parseJWT(token)
 * console.log(payload?.userId)
 */
export function parseJWT<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as T
  } catch {
    return null
  }
}
