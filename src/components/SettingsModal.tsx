import React from 'react'
import { MacroGoals } from '../types'
import googleSheetsService from '../services/googleSheetsService'

/**
 * SettingsModal Component (Memoized)
 * 
 * Modal for setting daily nutrition goals
 * Syncs goals to Google Sheets when saved
 * Features:
 * - Calorie and macro goal inputs
 * - Form validation with error messages
 * - Reset to defaults option
 * - Accessibility labels and error handling
 */
interface SettingsModalProps {
  isOpen: boolean
  goals: MacroGoals
  onClose: () => void
  onSave: (goals: MacroGoals) => void
}

const SettingsModal = React.memo(function SettingsModal({ isOpen, goals, onClose, onSave }: SettingsModalProps) {
  const [formData, setFormData] = React.useState(goals)
  const [errors, setErrors] = React.useState<Partial<MacroGoals>>({})

  React.useEffect(() => {
    setFormData(goals)
    setErrors({})
  }, [goals, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<MacroGoals> = {}
    
    if (formData.calories <= 0) {
      newErrors.calories = 1
    }
    if (formData.protein < 0) {
      newErrors.protein = 1
    }
    if (formData.carbs < 0) {
      newErrors.carbs = 1
    }
    if (formData.fat < 0) {
      newErrors.fat = 1
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      // Sync goals to Google Sheets
      googleSheetsService.updateSettings('Daily Calories', formData.calories)
      googleSheetsService.updateSettings('Protein (g)', formData.protein)
      googleSheetsService.updateSettings('Carbs (g)', formData.carbs)
      googleSheetsService.updateSettings('Fat (g)', formData.fat)
      
      onSave(formData)
      onClose()
    }
  }

  const handleReset = () => {
    const defaults = { calories: 2500, protein: 150, carbs: 250, fat: 80 }
    setFormData(defaults)
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Goals</h2>
            <p className="text-sm text-gray-600 mt-1">Set your nutrition targets</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-8">
          {/* Calorie Goal */}
          <div>
            <label htmlFor="calories-input" className="block text-sm font-bold text-gray-700 mb-3">
              <i className="fas fa-fire text-orange-500 mr-2"></i>
              Daily Calorie Goal
            </label>
            <div className="flex items-center gap-3">
              <input
                id="calories-input"
                type="number"
                value={formData.calories}
                onChange={e => {
                  setFormData({ ...formData, calories: Math.max(0, Number(e.target.value)) })
                  setErrors({ ...errors, calories: undefined })
                }}
                aria-invalid={!!errors.calories}
                aria-describedby={errors.calories ? 'calories-error' : undefined}
                className={`flex-1 px-4 py-3 text-lg font-bold border rounded-lg focus:outline-none transition-all ${
                  errors.calories
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                } bg-white`}
              />
              <span className="text-gray-700 font-semibold min-w-12">kcal</span>
            </div>
            {errors.calories && (
              <p id="calories-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>
                Must be greater than 0
              </p>
            )}
          </div>

          {/* Macro Goals Grid */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-4">Macro Targets</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Protein */}
              <div>
                <label htmlFor="protein-input" className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  <i className="fas fa-dumbbell text-blue-500 mr-1"></i>
                  Protein
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="protein-input"
                    type="number"
                    value={formData.protein}
                    onChange={e => {
                      setFormData({ ...formData, protein: Math.max(0, Number(e.target.value)) })
                      setErrors({ ...errors, protein: undefined })
                    }}
                    aria-invalid={!!errors.protein}
                    aria-describedby={errors.protein ? 'protein-error' : undefined}
                    className={`flex-1 px-4 py-3 font-bold border rounded-lg focus:outline-none transition-all ${
                      errors.protein
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    } bg-white`}
                  />
                  <span className="text-gray-700 font-semibold min-w-6">g</span>
                </div>
                {errors.protein && (
                  <p id="protein-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    Invalid
                  </p>
                )}
              </div>

              {/* Carbs */}
              <div>
                <label htmlFor="carbs-input" className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  <i className="fas fa-wheat text-amber-500 mr-1"></i>
                  Carbs
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="carbs-input"
                    type="number"
                    value={formData.carbs}
                    onChange={e => {
                      setFormData({ ...formData, carbs: Math.max(0, Number(e.target.value)) })
                      setErrors({ ...errors, carbs: undefined })
                    }}
                    aria-invalid={!!errors.carbs}
                    aria-describedby={errors.carbs ? 'carbs-error' : undefined}
                    className={`flex-1 px-4 py-3 font-bold border rounded-lg focus:outline-none transition-all ${
                      errors.carbs
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
                    } bg-white`}
                  />
                  <span className="text-gray-700 font-semibold min-w-6">g</span>
                </div>
                {errors.carbs && (
                  <p id="carbs-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    Invalid
                  </p>
                )}
              </div>

              {/* Fat */}
              <div>
                <label htmlFor="fat-input" className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  <i className="fas fa-droplet text-pink-500 mr-1"></i>
                  Fat
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="fat-input"
                    type="number"
                    value={formData.fat}
                    onChange={e => {
                      setFormData({ ...formData, fat: Math.max(0, Number(e.target.value)) })
                      setErrors({ ...errors, fat: undefined })
                    }}
                    aria-invalid={!!errors.fat}
                    aria-describedby={errors.fat ? 'fat-error' : undefined}
                    className={`flex-1 px-4 py-3 font-bold border rounded-lg focus:outline-none transition-all ${
                      errors.fat
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100'
                    } bg-white`}
                  />
                  <span className="text-gray-700 font-semibold min-w-6">g</span>
                </div>
                {errors.fat && (
                  <p id="fat-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    Invalid
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              aria-label="Reset to default goals"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <i className="fas fa-redo"></i>
              Reset
            </button>
            <button
              onClick={handleSave}
              aria-label="Save nutrition goals"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <i className="fas fa-check"></i>
              Save Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

SettingsModal.displayName = 'SettingsModal'

export { SettingsModal }
