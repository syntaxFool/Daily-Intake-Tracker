/**
 * Google Sheets Integration Service
 * Handles all communication with Google Sheets API via Apps Script
 * 
 * Syncs:
 * - Daily food logs (real-time)
 * - Custom foods database (when foods change)
 * - Macro goals/settings (when goals change)
 * - Daily summaries (for trend analysis)
 * - Statistics (for tracking progress)
 */

// ⚠️ SECURITY: Change this to match your Apps Script AUTH_TOKEN
const SHEET_AUTH_TOKEN = 'calorie-tracker-2025-secure-key-francis'

// import { getCurrentTimestampIST } from '../utils/timezone'

export interface SyncData {
  date: string
  foodLogs: any[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

class GoogleSheetsService {
  private deploymentUrl: string = ''

  /**
   * Initialize with Google Apps Script deployment URL
   * @param url - The URL from Apps Script deployment
   */
  initialize(url: string) {
    this.deploymentUrl = url
  }

  /**
   * Save daily tracking data to Google Sheets
   * @param date - Date string (YYYY-MM-DD)
   * @param data - Food logs and nutritional data
   */
  async saveDailyData(date: string, foodLogs: any[], totals: any) {
    if (!this.deploymentUrl) {
      console.warn('Google Sheets URL not configured')
      return false
    }

    try {
      const payload = {
        token: SHEET_AUTH_TOKEN,
        action: 'saveDailyData',
        date,
        foodLogs,
        totals,
      }

      console.log('Syncing daily data:', payload)

      // Use mode: 'no-cors' to avoid CORS preflight
      await fetch(this.deploymentUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
      })

      console.log('✅ Daily data synced')
      return true
    } catch (error) {
      console.error('❌ Error saving to Google Sheets:', error)
      return false
    }
  }

  /**
   * Sync custom foods database
   * @param foods - Array of food objects
   */
  // Debounce syncFoods to prevent rapid/parallel calls
  private syncFoodsTimeout: NodeJS.Timeout | null = null;
  private lastFoodsPayload: any[] | null = null;
  async syncFoods(foods: any[]) {
    if (!this.deploymentUrl) {
      console.warn('Google Sheets URL not configured');
      return false;
    }

    // Save the latest foods payload
    this.lastFoodsPayload = foods;

    // If a sync is already scheduled, clear it
    if (this.syncFoodsTimeout) {
      clearTimeout(this.syncFoodsTimeout);
    }

    // Debounce: only send the latest foods after 1 second
    return new Promise((resolve) => {
      this.syncFoodsTimeout = setTimeout(async () => {
        try {
          const payload = {
            token: SHEET_AUTH_TOKEN,
            action: 'syncFoods',
            foods: this.lastFoodsPayload,
          };
          console.log('Syncing foods (debounced):', payload);
          await fetch(this.deploymentUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload),
          });
          console.log('✅ Foods synced to Google Sheets:', this.lastFoodsPayload ? this.lastFoodsPayload.length : 0);
          resolve(true);
        } catch (error) {
          console.error('❌ Error syncing foods to Google Sheets:', error);
          resolve(false);
        }
      }, 1000); // 1 second debounce
    });
  }

  /**
   * Save daily summary for trend analysis
   * @param date - Date string (YYYY-MM-DD)
   * @param totals - Daily nutrition totals
   * @param calorieGoal - Daily calorie goal
   * @param caloriePercent - Percentage of goal met
   * @param entryCount - Number of food entries
   */
  async saveDailySummary(
    date: string,
    totals: any,
    calorieGoal: number,
    caloriePercent: number,
    entryCount: number
  ) {
    if (!this.deploymentUrl) return false

    try {
      await fetch(this.deploymentUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          token: SHEET_AUTH_TOKEN,
          action: 'saveDailySummary',
          date,
          totals,
          calorieGoal,
          caloriePercent,
          entryCount,
        }),
      })

      // const text = await response.text()
      console.log('✅ Daily summary synced')
      return true
    } catch (error) {
      console.error('❌ Error saving daily summary:', error)
      return false
    }
  }

  /**
   * Save statistics for trend tracking
   * @param date - Date string or date range
   * @param avgCalories - Average daily calories
   * @param avgProtein - Average daily protein
   * @param avgCarbs - Average daily carbs
   * @param avgFat - Average daily fat
   * @param daysLogged - Number of days with data
   */
  async saveStatistics(
    date: string,
    avgCalories: number,
    avgProtein: number,
    avgCarbs: number,
    avgFat: number,
    daysLogged: number
  ) {
    if (!this.deploymentUrl) return false

    try {
      await fetch(this.deploymentUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          token: SHEET_AUTH_TOKEN,
          action: 'saveStatistics',
          date,
          avgCalories,
          avgProtein,
          avgCarbs,
          avgFat,
          daysLogged,
        }),
      })

      console.log('✅ Statistics synced')
      return true
    } catch (error) {
      console.error('❌ Error saving statistics:', error)
      return false
    }
  }

  /**
   * Update macro goals in Google Sheets
   * @param setting - Setting name (Daily Calories, Protein (g), etc.)
   * @param value - New value
   */
  async updateSettings(setting: string, value: number) {
    if (!this.deploymentUrl) return false

    try {
      const payload = {
        token: SHEET_AUTH_TOKEN,
        action: 'updateSettings',
        goalName: setting,
        value,
      }

      console.log('Updating settings:', payload)

      await fetch(this.deploymentUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload),
      })

      console.log('✅ Settings updated in Google Sheets:', setting, '=', value)
      return true
    } catch (error) {
      console.error('❌ Error updating settings:', error)
      return false
    }
  }

  /**
   * Load daily tracking data from Google Sheets
   * @param date - Date string (YYYY-MM-DD)
   */
  async loadDailyData(date: string): Promise<SyncData | null> {
    if (!this.deploymentUrl) {
      console.warn('Google Sheets URL not configured')
      return null
    }

    try {
      const response = await fetch(
        `${this.deploymentUrl}?token=${SHEET_AUTH_TOKEN}&action=loadDailyData&date=${date}`,
        {
          method: 'GET',
        }
      )

      const data = await response.json()
      if (data.error) {
        console.error('Error loading from Google Sheets:', data.error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error loading from Google Sheets:', error)
      return null
    }
  }

  /**
   * Get all custom foods from Google Sheets
   */
  async getFoods(): Promise<any[] | null> {
    if (!this.deploymentUrl) return null

    try {
      const response = await fetch(
        `${this.deploymentUrl}?token=${SHEET_AUTH_TOKEN}&action=getFoods`,
        {
          method: 'GET',
        }
      )

      const data = await response.json()
      if (data.error) {
        console.error('Error getting foods:', data.error)
        return null
      }
      return data.foods || []
    } catch (error) {
      console.error('Error getting foods from Google Sheets:', error)
      return null
    }
  }

  /**
   * Get all data for a date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getRangeData(startDate: string, endDate: string) {
    if (!this.deploymentUrl) return null

    try {
      const response = await fetch(
        `${this.deploymentUrl}?token=${SHEET_AUTH_TOKEN}&action=getRangeData&startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
        }
      )

      const data = await response.json()
      if (data.error) {
        console.error('Error getting range data:', data.error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error getting range data from Google Sheets:', error)
      return null
    }
  }

  /**
   * Check if Google Sheets is configured
   */
  isConfigured(): boolean {
    return !!this.deploymentUrl
  }

  /**
   * Get current deployment URL
   */
  getUrl(): string {
    return this.deploymentUrl
  }
}

export default new GoogleSheetsService()
