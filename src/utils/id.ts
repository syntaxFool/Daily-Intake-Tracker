/**
 * ID Generation Utility
 * Generates unique identifiers for food logs and other entities
 */

/**
 * Generate a unique ID using timestamp + random number
 * Format: YYYYMMDD-HHmmss-XXXXX (where X is random)
 */
export function generateId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()

  return `${year}${month}${date}-${hours}${minutes}${seconds}-${random}`
}

/**
 * Generate a simple UUID v4-like ID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a short random ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 11)
}
