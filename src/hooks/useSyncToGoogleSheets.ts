import { useEffect, useCallback } from 'react'
import googleSheetsService from '../services/googleSheetsService'
import { FoodLog } from '../types'

interface UseSyncToGoogleSheetsProps {
  isEnabled: boolean
  foodLogs: FoodLog[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  currentDate: string
}

/**
 * Hook to sync daily food logs to Google Sheets
 * Syncs automatically whenever foodLogs change
 */
export function useSyncToGoogleSheets({
  isEnabled,
  foodLogs,
  totals,
  currentDate,
}: UseSyncToGoogleSheetsProps) {
  const sync = useCallback(async () => {
    if (!isEnabled || !googleSheetsService.isConfigured()) {
      return
    }

    try {
      const success = await googleSheetsService.saveDailyData(
        currentDate,
        foodLogs,
        totals
      )

      if (success) {
        console.log('Synced with Google Sheets:', currentDate)
      }
    } catch (error) {
      console.error('Failed to sync with Google Sheets:', error)
    }
  }, [isEnabled, foodLogs, totals, currentDate])

  // Sync when food logs change
  useEffect(() => {
    const syncTimer = setTimeout(() => {
      sync()
    }, 1000) // Debounce by 1 second

    return () => clearTimeout(syncTimer)
  }, [foodLogs, sync])

  return { sync }
}
