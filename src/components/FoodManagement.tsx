import { useState, useEffect } from 'react'
import { Food } from '../types'
import googleSheetsService from '../services/googleSheetsService'

/**
 * FoodManagement Component
 * 
 * Manages custom food database with CRUD operations.
 * Syncs foods to Google Sheets when database changes.
 * Features:
 * - Add, edit, and delete food items
 * - Search food database
 * - Form validation
 * - Delete confirmation modal
 * - Empty state design
 */
interface FoodManagementProps {
  foods: Food[]
  onAddFood: (food: Omit<Food, 'id'>) => void
  onEditFood: (id: string, food: Omit<Food, 'id'>) => void
  onDeleteFood: (id: string) => void
}

export function FoodManagement({
  foods,
  onAddFood,
  onEditFood,
  onDeleteFood,
}: FoodManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenForm = (food?: Food) => {
    if (food) {
      setIsEditMode(true)
      setEditingId(food.id)
      setFormData({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      })
    } else {
      setIsEditMode(false)
      setEditingId(null)
      setFormData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      })
    }
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Food name is required')
      return
    }

    if (isEditMode && editingId) {
      onEditFood(editingId, formData)
    } else {
      onAddFood(formData)
    }

    setIsOpen(false)
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
    setIsEditMode(false)
    setEditingId(null)
  }

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (foodId: string) => {
    setDeleteConfirm(foodId)
  }

  // Sync foods to Google Sheets when foods change
  useEffect(() => {
    if (googleSheetsService.isConfigured() && foods.length > 0) {
      googleSheetsService.syncFoods(foods)
    }
  }, [foods])

  const confirmDelete = (foodId: string) => {
    onDeleteFood(foodId)
    setDeleteConfirm(null)
  }

  return (
    <>
      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-8 w-full sm:max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <i className="fas fa-utensils text-orange-600 text-lg sm:text-2xl"></i>
              <h2 className="text-base sm:text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Food' : 'Add New Food'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-apple-alt text-orange-500 mr-2"></i>
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Chicken Breast"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-fire text-orange-500 mr-2"></i>
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        calories: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.1"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-dumbbell text-blue-500 mr-2"></i>
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protein: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.1"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-bread-slice text-amber-500 mr-2"></i>
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carbs: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.1"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    <i className="fas fa-droplet text-pink-500 mr-2"></i>
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.fat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fat: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.1"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  aria-label={isEditMode ? 'Update food' : 'Add new food'}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-1"
                >
                  <i className={`fas ${isEditMode ? 'fa-pen' : 'fa-plus'}`}></i>
                  {isEditMode ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-sm shadow-2xl border border-gray-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-lg"></i>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-2">
              Delete Food?
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              This food will be removed from your database.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                aria-label="Cancel delete operation"
                className="flex-1 px-3 sm:px-4 py-2.5 text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                aria-label="Confirm delete food"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transform hover:scale-105 active:scale-95 transition-transform shadow-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food List Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fas fa-list text-orange-600 text-lg sm:text-xl"></i>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Food Database</h2>
          </div>
          <button
            onClick={() => handleOpenForm()}
            aria-label="Add new food to database"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 sm:py-2 px-4 sm:px-5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-1 min-h-10 sm:min-h-auto"
          >
            <i className="fas fa-plus text-sm"></i>
            <span>Add Food</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search foods"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>
        </div>

        {/* Foods List */}
        {filtered.length === 0 ? (
          <div className="px-4 sm:px-6 py-20 sm:py-24 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-box-open text-3xl sm:text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No foods found' : 'No foods yet'}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base font-medium">
              {searchTerm ? 'Try a different search' : 'Create custom foods for quick logging'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[calc(90vh-400px)] overflow-y-auto">
            {filtered.map((food, idx) => (
              <div
                key={food.id}
                className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-orange-50 transition-colors flex items-center justify-between gap-3"
                style={{
                  animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{food.name}</div>
                  <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-3">
                    <span><i className="fas fa-fire text-orange-500 mr-1"></i>{food.calories} kcal</span>
                    <span><i className="fas fa-dumbbell text-blue-600 mr-1"></i>{food.protein}g</span>
                    <span><i className="fas fa-bread-slice text-amber-600 mr-1"></i>{food.carbs}g</span>
                    <span><i className="fas fa-droplet text-pink-600 mr-1"></i>{food.fat}g</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenForm(food)}
                    aria-label={`Edit ${food.name}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <i className="fas fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
                    aria-label={`Delete ${food.name}`}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
