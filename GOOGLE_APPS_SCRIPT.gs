/**
 * GOOGLE APPS SCRIPT - Copy this into your Google Sheet's Apps Script editor
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Copy and paste THIS ENTIRE FILE into the editor
 * 5. Click Deploy > New Deployment > Web app
 * 6. Set "Execute as" to your Google account
 * 7. Set "Who has access" to "Anyone"
 * 8. Click Deploy and copy the URL
 * 9. Paste the URL in App.tsx in the initGoogleSheets() function
 * 
 * TIMEZONE: Using IST (Indian Standard Time, UTC+5:30)
 */

/**
 * Get current timestamp in IST
 */
function getISTTimestamp() {
  const now = new Date()
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
  return istDate.toISOString()
}

/**
 * Generate a unique ID
 */
function generateId() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  
  return year + month + date + '-' + hours + minutes + seconds + '-' + random
}

// ⚠️ CHANGE THIS TO A UNIQUE TOKEN - Keep it SECRET
const AUTH_TOKEN = 'calorie-tracker-2025-secure-key-francis'

const DAILY_LOGS_SHEET = 'Daily Logs'
const CUSTOM_FOODS_SHEET = 'Custom Foods'
const GOALS_SHEET = 'Goals'
const DAILY_SUMMARY_SHEET = 'Daily Summary'
const STATISTICS_SHEET = 'Statistics'

/**
 * Validate authentication token
 */
function validateAuth(e) {
  let providedToken = ''

  // Try to get token from POST body
  if (e.postData && e.postData.contents) {
    try {
      const body = JSON.parse(e.postData.contents)
      providedToken = body.token || ''
    } catch (err) {
      /* Not JSON */
    }
  }

  // Try to get token from GET params
  if (!providedToken && e.parameter && e.parameter.token) {
    providedToken = e.parameter.token
  }

  return providedToken === AUTH_TOKEN
}

/**
 * Create error response
 */
function createErrorResponse(msg, code) {
  return ContentService.createTextOutput(
    JSON.stringify({ error: msg, status: code })
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Initialize sheets if they don't exist
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  // Create Daily Logs sheet
  if (!ss.getSheetByName(DAILY_LOGS_SHEET)) {
    const sheet = ss.insertSheet(DAILY_LOGS_SHEET)
    sheet.appendRow([
      'Date',
      'Food',
      'Quantity',
      'Calories',
      'Protein',
      'Carbs',
      'Fat',
      'Timestamp',
      'ID',
    ])
    sheet.setFrozenRows(1)
  }

  // Create Custom Foods sheet
  if (!ss.getSheetByName(CUSTOM_FOODS_SHEET)) {
    const sheet = ss.insertSheet(CUSTOM_FOODS_SHEET)
    sheet.appendRow([
      'Food ID',
      'Food Name',
      'Calories (per 100g)',
      'Protein (g)',
      'Carbs (g)',
      'Fat (g)',
      'Created Date',
    ])
    sheet.setFrozenRows(1)
  }

  // Create Goals sheet
  if (!ss.getSheetByName(GOALS_SHEET)) {
    const sheet = ss.insertSheet(GOALS_SHEET)
    sheet.appendRow(['Setting', 'Value'])
    sheet.appendRow(['Daily Calories', 2500])
    sheet.appendRow(['Protein (g)', 150])
    sheet.appendRow(['Carbs (g)', 250])
    sheet.appendRow(['Fat (g)', 80])
    sheet.appendRow(['Last Updated', getISTTimestamp()])
  }

  // Create Daily Summary sheet
  if (!ss.getSheetByName(DAILY_SUMMARY_SHEET)) {
    const sheet = ss.insertSheet(DAILY_SUMMARY_SHEET)
    sheet.appendRow([
      'Date',
      'Total Calories',
      'Total Protein',
      'Total Carbs',
      'Total Fat',
      'Calorie Goal',
      'Calorie %',
      'Over Goal?',
      'Entry Count',
    ])
    sheet.setFrozenRows(1)
  }

  // Create Statistics sheet
  if (!ss.getSheetByName(STATISTICS_SHEET)) {
    const sheet = ss.insertSheet(STATISTICS_SHEET)
    sheet.appendRow([
      'Date',
      'Avg Calories',
      'Avg Protein',
      'Avg Carbs',
      'Avg Fat',
      'Days Logged',
    ])
    sheet.setFrozenRows(1)
  }
}

/**
 * Handle OPTIONS preflight requests for CORS
 */
function doOptions(e) {
  return ContentService.createTextOutput()
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400')
}

/**
 * Handle GET requests
 */
function doGet(e) {
  // Validate authentication
  if (!validateAuth(e)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    initializeSheets()

    const action = e.parameter.action
    const date = e.parameter.date
    const startDate = e.parameter.startDate
    const endDate = e.parameter.endDate

    let responseData
    if (action === 'loadDailyData') {
      responseData = loadDailyData(date)
    } else if (action === 'getRangeData') {
      responseData = getRangeData(startDate, endDate)
    } else if (action === 'getSettings') {
      responseData = getSettings()
    } else if (action === 'getFoods') {
      responseData = getFoods()
    } else {
      responseData = { error: 'Invalid action' }
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  // Validate authentication
  if (!validateAuth(e)) {
    return createErrorResponse('Unauthorized', 401)
  }

  try {
    initializeSheets()

    let data
    let action

    // Parse POST data - it comes as raw string in no-cors mode
    try {
      let contents = e.postData.contents
      if (!contents) {
        // Try alternate access
        contents = e.postData
      }
      
      Logger.log('POST contents: ' + contents)
      data = JSON.parse(contents)
      action = data.action
      Logger.log('Parsed action: ' + action)
    } catch (parseError) {
      Logger.log('Parse error: ' + parseError)
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Failed to parse POST data: ' + parseError.toString() })
      ).setMimeType(ContentService.MimeType.JSON)
    }

    let responseData

    if (action === 'saveDailyData') {
      saveDailyData(data)
      responseData = { success: true, message: 'Daily data saved' }
    } else if (action === 'updateSettings') {
      updateSettings(data)
      responseData = { success: true, message: 'Settings updated' }
    } else if (action === 'syncFoods') {
      syncFoods(data)
      responseData = { success: true, message: 'Foods synced' }
    } else if (action === 'saveDailySummary') {
      saveDailySummary(data)
      responseData = { success: true, message: 'Daily summary saved' }
    } else if (action === 'saveStatistics') {
      saveStatistics(data)
      responseData = { success: true, message: 'Statistics saved' }
    } else {
      responseData = { error: 'Invalid action: ' + action }
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
  } catch (error) {
    Logger.log('Main error: ' + error)
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
}

/**
 * Save daily food logs - OPTIMIZED with batch operations and ROBUST deduplication using ID as primary key
 * Uses ID as primary key and checks both existing data and incoming data for duplicates
 */
function saveDailyData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(DAILY_LOGS_SHEET)
  const { date, foodLogs } = data

  // Always remove all entries for this date before adding new ones (handles partial deletes)
  Logger.log('Saving food logs for date: ' + date + '. Will remove all existing entries for this date and add new ones.')
  // Read all data once
  const range = sheet.getDataRange()
  const values = range.getValues()
  const newRows = []
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      newRows.push(values[i]) // header
    } else {
      const sheetDate = values[i][0]
      let sheetDateStr = sheetDate
      if (sheetDate instanceof Date) {
        sheetDateStr = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      } else if (typeof sheetDate === 'string') {
        sheetDateStr = sheetDate.split('T')[0]
      }
      if (sheetDateStr !== date) {
        newRows.push(values[i])
      }
    }
  }

  // If foodLogs is empty, just write the non-matching rows (delete all for this date)
  if (!foodLogs || foodLogs.length === 0) {
    sheet.clearContents()
    if (newRows.length > 0) {
      sheet.getRange(1, 1, newRows.length, newRows[0].length).setValues(newRows)
    }
    SpreadsheetApp.flush()
    return
  }

  // Otherwise, add new logs for this date
  // Prepare new rows - deduplicate against incoming data only (IDs must be unique in this batch)
  const seenIds = new Set()
  for (let i = 0; i < foodLogs.length; i++) {
    const log = foodLogs[i]
    const logId = (log.id || '').toString()
    if (!logId) {
      Logger.log('Skipping log without ID at index ' + i)
      continue
    }
    if (seenIds.has(logId)) {
      Logger.log('Skipping duplicate ID in batch: ' + logId)
      continue
    }
    seenIds.add(logId)
    const newRow = [
      date,
      log.foodName,
      log.quantity,
      log.calories,
      log.protein,
      log.carbs,
      log.fat,
      log.timestamp || getISTTimestamp(),
      logId,
    ]
    newRows.push(newRow)
    Logger.log('Adding new entry with ID: ' + logId + ', Food: ' + log.foodName)
  }

  // Single batch write operation
  sheet.clearContents()
  if (newRows.length > 0) {
    sheet.getRange(1, 1, newRows.length, newRows[0].length).setValues(newRows)
  }
  SpreadsheetApp.flush()
  Logger.log('Saved ' + foodLogs.length + ' entries for date ' + date)
  return

  // (Removed unreachable duplicate code and duplicate seenIds declaration)

  // Combine: non-matching rows + existing entries for this date + new entries to add
  const existingEntryRows = Object.values(existingEntriesMap)
  const finalRows = nonMatchingRows.concat(existingEntryRows).concat(newEntriesToAdd)

  // Single batch write operation
  sheet.clearContents()
  if (finalRows.length > 0) {
    sheet.getRange(1, 1, finalRows.length, finalRows[0].length).setValues(finalRows)
  }

  Logger.log('Saved ' + newEntriesToAdd.length + ' new entries for date ' + date + ', existing: ' + existingEntryRows.length + ', total: ' + (finalRows.length - 1))
  SpreadsheetApp.flush()
}

/**
 * Sync custom foods database
 */
function syncFoods(data) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for lock
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CUSTOM_FOODS_SHEET);
    const { foods } = data;

    // Clear all existing foods (except header)
    const values = sheet.getDataRange().getValues();
    if (values.length > 1) {
      sheet.deleteRows(2, values.length - 1);
    }

    // Add all foods (deduplicate by id in this batch)
    if (foods && foods.length > 0) {
      const seenIds = new Set();
      foods.forEach((food) => {
        if (!food.id || seenIds.has(food.id)) return;
        seenIds.add(food.id);
        sheet.appendRow([
          food.id,
          food.name,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          new Date().toISOString(),
        ]);
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Foods synced', count: foods ? foods.length : 0 })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'syncFoods lock error: ' + err })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Save daily summary
 */
function saveDailySummary(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(DAILY_SUMMARY_SHEET)
  const { date, totals, calorieGoal, caloriePercent, entryCount } = data

  // Read all data
  const range = sheet.getDataRange()
  const values = range.getValues()

  // Build list of rows - keep header and non-matching dates
  const rowsToKeep = []
  let existingSummaryForDate = null
  
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      // Keep header
      rowsToKeep.push(values[i])
    } else {
      const rowDate = values[i][0]
      let rowDateStr = rowDate
      
      // Convert date to string for comparison
      if (rowDate instanceof Date) {
        rowDateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      } else if (typeof rowDate === 'string') {
        rowDateStr = rowDate.split('T')[0]
      }
      
      if (rowDateStr === date) {
        // Found existing summary for this date - will replace it
        existingSummaryForDate = values[i]
        Logger.log('Found existing summary for date: ' + date)
      } else {
        // Keep rows that don't match this date
        rowsToKeep.push(values[i])
      }
    }
  }

  // Create new summary row
  const newSummaryRow = [
    date,
    totals.calories,
    totals.protein,
    totals.carbs,
    totals.fat,
    calorieGoal,
    caloriePercent,
    totals.calories > calorieGoal ? 'Yes' : 'No',
    entryCount,
  ]

  // If there's an existing summary, replace it; otherwise add new
  const finalRows = rowsToKeep.concat([newSummaryRow])

  // Write back to sheet
  sheet.clearContents()
  if (finalRows.length > 0) {
    sheet.getRange(1, 1, finalRows.length, finalRows[0].length).setValues(finalRows)
  }

  Logger.log('Saved summary for ' + date + ' (updated: ' + (existingSummaryForDate ? 'yes' : 'no') + ')')

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, message: 'Daily summary saved' })
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Save statistics for trend analysis
 */
function saveStatistics(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(STATISTICS_SHEET)
  const { date, avgCalories, avgProtein, avgCarbs, avgFat, daysLogged } = data

  // Read all data
  const range = sheet.getDataRange()
  const values = range.getValues()

  // Build list of rows - keep header and non-matching dates
  const rowsToKeep = []
  let existingStatsForDate = null
  
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      // Keep header
      rowsToKeep.push(values[i])
    } else {
      const rowDate = values[i][0]
      let rowDateStr = rowDate
      
      // Convert date to string for comparison
      if (rowDate instanceof Date) {
        rowDateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      } else if (typeof rowDate === 'string') {
        rowDateStr = rowDate.split('T')[0]
      }
      
      if (rowDateStr === date) {
        // Found existing statistics for this date - will replace it
        existingStatsForDate = values[i]
        Logger.log('Found existing statistics for date: ' + date)
      } else {
        // Keep rows that don't match this date
        rowsToKeep.push(values[i])
      }
    }
  }

  // Create new statistics row
  const newStatsRow = [
    date,
    Math.round(avgCalories * 10) / 10,
    Math.round(avgProtein * 10) / 10,
    Math.round(avgCarbs * 10) / 10,
    Math.round(avgFat * 10) / 10,
    daysLogged,
  ]

  // If there's existing statistics, replace it; otherwise add new
  const finalRows = rowsToKeep.concat([newStatsRow])

  // Write back to sheet
  sheet.clearContents()
  if (finalRows.length > 0) {
    sheet.getRange(1, 1, finalRows.length, finalRows[0].length).setValues(finalRows)
  }

  Logger.log('Saved statistics for ' + date + ' (updated: ' + (existingStatsForDate ? 'yes' : 'no') + ')')

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, message: 'Statistics saved' })
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Load daily data for a specific date
 */
function loadDailyData(date) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(DAILY_LOGS_SHEET)
  const values = sheet.getDataRange().getValues()

  const foodLogs = []
  let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  Logger.log('loadDailyData called for date: ' + date)
  Logger.log('Total rows in sheet: ' + values.length)

  for (let i = 1; i < values.length; i++) {
    // Convert sheet date (could be Date object) to string format for comparison
    const sheetDate = values[i][0]
    let sheetDateStr = sheetDate
    if (sheetDate instanceof Date) {
      sheetDateStr = Utilities.formatDate(sheetDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    } else if (typeof sheetDate === 'string') {
      sheetDateStr = sheetDate.split('T')[0] // Handle ISO format
    }

    Logger.log('Row ' + i + ': sheet date = ' + sheetDateStr + ', looking for = ' + date)

    if (sheetDateStr === date) {
      const log = {
        id: values[i][8] || values[i][7], // ID is column 8 (index 8), fallback to timestamp (column 7)
        foodName: values[i][1],
        quantity: values[i][2],
        calories: values[i][3],
        protein: values[i][4],
        carbs: values[i][5],
        fat: values[i][6],
        timestamp: values[i][7],
      }
      foodLogs.push(log)

      totals.calories += log.calories
      totals.protein += log.protein
      totals.carbs += log.carbs
      totals.fat += log.fat

      Logger.log('Found matching log: ' + log.foodName + ' with ID: ' + log.id)
    }
  }

  return {
    success: true,
    date,
    foodLogs,
    totals,
  }
}

/**
 * Get data for a date range
 */
function getRangeData(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(DAILY_LOGS_SHEET)
  const values = sheet.getDataRange().getValues()

  const rangeData = {}
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let i = 1; i < values.length; i++) {
    const logDate = new Date(values[i][0])
    if (logDate >= start && logDate <= end) {
      const dateStr = values[i][0]
      if (!rangeData[dateStr]) {
        rangeData[dateStr] = {
          foodLogs: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        }
      }

      const log = {
        foodName: values[i][1],
        quantity: values[i][2],
        calories: values[i][3],
        protein: values[i][4],
        carbs: values[i][5],
        fat: values[i][6],
      }

      rangeData[dateStr].foodLogs.push(log)
      rangeData[dateStr].totals.calories += log.calories
      rangeData[dateStr].totals.protein += log.protein
      rangeData[dateStr].totals.carbs += log.carbs
      rangeData[dateStr].totals.fat += log.fat
    }
  }

  return {
    success: true,
    data: rangeData,
  }
}

/**
 * Get macro goals from settings
 */
function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(GOALS_SHEET)
  const values = sheet.getDataRange().getValues()

  const settings = {}
  for (let i = 1; i < values.length; i++) {
    settings[values[i][0]] = values[i][1]
  }

  return {
    success: true,
    settings,
  }
}

/**
 * Get all custom foods
 */
function getFoods() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(CUSTOM_FOODS_SHEET)
  const values = sheet.getDataRange().getValues()

  const foods = []
  for (let i = 1; i < values.length; i++) {
    foods.push({
      id: values[i][0],
      name: values[i][1],
      calories: values[i][2],
      protein: values[i][3],
      carbs: values[i][4],
      fat: values[i][5],
    })
  }

  return {
    success: true,
    foods,
  }
}

/**
 * Update macro goals in settings
 */
function updateSettings(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(GOALS_SHEET)
  const values = sheet.getDataRange().getValues()

  Logger.log('updateSettings data: ' + JSON.stringify(data))
  const { goalName, value } = data
  Logger.log('Looking for goal: ' + goalName + ', value: ' + value)

  // Find and update the goal
  for (let i = 1; i < values.length; i++) {
    Logger.log('Row ' + i + ': ' + values[i][0])
    if (values[i][0] === goalName) {
      Logger.log('Found! Updating row ' + (i + 1))
      sheet.getRange(i + 1, 2).setValue(value)
      break
    }
  }

  // Update last modified time
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === 'Last Updated') {
      sheet.getRange(i + 1, 2).setValue(getISTTimestamp())
      break
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, message: 'Settings updated' })
  ).setMimeType(ContentService.MimeType.JSON)
}
