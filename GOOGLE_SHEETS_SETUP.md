# Google Sheets Integration Setup Guide

This guide walks you through connecting your Daily Calorie Tracker to Google Sheets for cloud backup and tracking.

## Step 1: Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "+ New" to create a new spreadsheet
3. Name it something like "Calorie Tracker Data"

## Step 2: Create the Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents from `GOOGLE_APPS_SCRIPT.gs` in this project
4. Paste it into the Apps Script editor
5. Click **Save** (or Ctrl+S)

## Step 3: Deploy as Web App

1. In Apps Script, click **Deploy** > **New Deployment**
2. In the dialog:
   - **Deployment type**: Select "Web app"
   - **Execute as**: Select your Google account
   - **Who has access**: Select "Anyone"
3. Click **Deploy**
4. You'll see a popup with the deployment URL
5. **Copy the URL** (it will look like: `https://script.google.com/macros/d/...`)

## Step 4: Configure in the App

1. Open your Calorie Tracker in a browser at http://localhost:5178
2. The URL is already configured in the app!
3. Start using the app - everything syncs automatically

## What Gets Synced?

### Real-time Syncing
✅ **Daily food logs** - food, quantity, calories, macros, timestamps  
✅ **Daily summaries** - totals for trend analysis  
✅ **Custom foods database** - all your custom foods  
✅ **Macro goals** - your daily targets (when you update them)

### Data Structure

Your Google Sheet will have 5 sheets:

### 1. Daily Logs
| Date | Food | Quantity | Calories | Protein | Carbs | Fat | Timestamp |
|------|------|----------|----------|---------|-------|-----|-----------|
| 2025-12-18 | Chicken Breast | 150 | 245 | 52 | 0 | 3.3 | ISO timestamp |

### 2. Custom Foods
| Food ID | Food Name | Calories | Protein (g) | Carbs (g) | Fat (g) | Created Date |
|---------|-----------|----------|-------------|-----------|---------|--------------|
| 12345 | Chicken Breast | 165 | 31 | 0 | 3.6 | ISO timestamp |

### 3. Goals
| Setting | Value |
|---------|-------|
| Daily Calories | 2500 |
| Protein (g) | 150 |
| Carbs (g) | 250 |
| Fat (g) | 80 |
| Last Updated | ISO timestamp |

### 4. Daily Summary
| Date | Total Calories | Total Protein | Total Carbs | Total Fat | Calorie Goal | Calorie % | Over Goal? | Entry Count |
|------|---|---|---|---|---|---|---|---|
| 2025-12-18 | 2345 | 185 | 210 | 78 | 2500 | 93.8 | No | 5 |

### 5. Statistics
| Date | Avg Calories | Avg Protein | Avg Carbs | Avg Fat | Days Logged |
|------|---|---|---|---|---|
| 2025-12 | 2300 | 175 | 220 | 75 | 18 |

## How It Works

- **Food logs**: Sync instantly when you add/edit/delete an entry
- **Daily summary**: Updates automatically with each food log change
- **Custom foods**: Syncs when you add/edit/delete foods
- **Goals**: Syncs when you update your daily targets in Settings

All syncing happens automatically in the background. Just use the app normally!

## Troubleshooting

### "Invalid Google Apps Script URL"
- Make sure you copied the entire URL including `https://script.google.com/macros/d/`
- Check there are no extra spaces

### Data not appearing in Google Sheet
- Open your browser console (F12)
- Look for sync messages: `✅ Real-time sync with Google Sheets`
- Check the Apps Script logs for errors (Extensions > Apps Script > Execution)

### My deployment URL is invalid
- Go back to your Google Sheet
- Extensions > Apps Script
- Make sure your Apps Script code matches `GOOGLE_APPS_SCRIPT.gs`
- Delete your deployment and create a new one
- Make sure "Who has access" is set to "Anyone"

## Advanced: Update Apps Script

If you update `GOOGLE_APPS_SCRIPT.gs`:

1. Go to your Google Sheet
2. Extensions > Apps Script
3. Delete all existing code
4. Copy the latest code from `GOOGLE_APPS_SCRIPT.gs`
5. Paste and Save
6. Go to Deploy > Manage Deployments
7. Delete the old deployment
8. Create new deployment with same settings
9. Copy the new URL

## Security Notes

⚠️ **For Personal Use**

This setup is designed for personal use. The deployment URL gives anyone who has it access to your data.

For production:
- Add authentication to the Apps Script
- Use private deployment (restricted to your account)
- Add password protection to the Google Sheet

For personal use with a private URL, this setup is secure.

## Tips

- View your data directly in Google Sheets
- Export to CSV: File > Download > CSV
- Create pivot tables for analysis
- Share specific sheets with others
- Keep your deployment URL private

## Questions?

If you run into issues:
1. Check browser console (F12 > Console)
2. Check Apps Script logs (Extensions > Apps Script > Execution)
3. Verify deployment is set to "Anyone" access
4. Make sure the URL is correct (no typos)
