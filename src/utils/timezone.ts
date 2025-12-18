/**
 * Timezone utility functions
 * Handles date/time operations in IST (Indian Standard Time, UTC+5:30)
 */

const IST_OFFSET = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30

/**
 * Get current date in IST format (YYYY-MM-DD)
 */
export function getCurrentDateIST(): string {
  const now = new Date()
  const istDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + IST_OFFSET)
  return istDate.toISOString().split('T')[0]
}

/**
 * Get current timestamp in IST format (ISO string)
 */
export function getCurrentTimestampIST(): string {
  const now = new Date()
  const istDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + IST_OFFSET)
  return istDate.toISOString()
}

/**
 * Convert a date string (YYYY-MM-DD) to IST date
 */
export function convertToIST(dateString: string): Date {
  const date = new Date(dateString)
  // Adjust for IST
  const istDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + IST_OFFSET)
  return istDate
}

/**
 * Format date for display in IST
 */
export function formatDateIST(date: Date): string {
  const istDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + IST_OFFSET)
  return istDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

/**
 * Format time for display in IST
 */
export function formatTimeIST(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}
