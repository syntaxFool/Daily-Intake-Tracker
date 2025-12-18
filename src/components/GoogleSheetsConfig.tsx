import React, { useState } from 'react'
import googleSheetsService from '../services/googleSheetsService'

interface GoogleSheetsConfigProps {
  onClose: () => void
  onConfigured: (url: string) => void
}

/**
 * Modal for configuring Google Sheets integration
 * Users paste their Apps Script deployment URL here
 */
export const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({
  onClose,
  onConfigured,
}) => {
  const [url, setUrl] = useState(googleSheetsService.getUrl() || '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!url.trim()) {
      setError('Please enter a deployment URL')
      return
    }

    if (!url.includes('script.google.com')) {
      setError('Invalid Google Apps Script URL')
      return
    }

    setIsLoading(true)
    try {
      // Validate the URL by making a test call
      const response = await fetch(`${url}?action=getSettings`, {
        method: 'GET',
      })

      if (!response.ok && response.status !== 0) {
        // status 0 with CORS issue is actually ok for our purposes
        throw new Error('Failed to connect to Google Sheets')
      }

      googleSheetsService.initialize(url)
      onConfigured(url)
      onClose()
    } catch (error) {
      setError(
        'Could not connect to Google Sheets. Please check the URL and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Google Sheets Integration
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Paste your Google Apps Script deployment URL here to enable cloud
          backup of your calorie logs.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deployment URL
          </label>
          <textarea
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError('')
            }}
            placeholder="https://script.google.com/macros/d/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-700">
            <strong>Setup Instructions:</strong> Create a Google Sheet, paste
            the Apps Script code provided in GOOGLE_APPS_SCRIPT.gs, deploy it
            as a web app, and paste the deployment URL here.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
