import { useState, useEffect } from 'react'
import { Food } from '../types'

/**
 * FoodEntryForm Component
 * 
 * Allows users to search for foods, select quantity, and add to daily log.
 * Features:
 * - Real-time food search with suggestions
 * - Quantity validation
 * - Success message feedback
 * - Contextual button labels based on form state
 */
interface FoodEntryFormProps {
  foods: Food[]
  onAddLog: (foodId: string, quantity: number) => void
  isLoading?: boolean
}

export function FoodEntryForm({ foods, onAddLog, isLoading = false }: FoodEntryFormProps) {
  const [foodInput, setFoodInput] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [suggestions, setSuggestions] = useState<Food[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<{quantity?: string}>({})

  useEffect(() => {
    if (foodInput.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = foods
      .filter(f => f.name.toLowerCase().includes(foodInput.toLowerCase()))
      .slice(0, 5)

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }, [foodInput, foods])

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food)
    setFoodInput(food.name)
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (!selectedFood) return

    const qty = parseFloat(quantity)
    if (!quantity || qty <= 0) {
      setErrors({quantity: 'Please enter a quantity greater than 0'})
      return
    }

    setIsAdding(true)
    
    // Simulate brief processing
    setTimeout(() => {
      onAddLog(selectedFood.id, qty)
      setSuccessMessage(`Added ${qty} ${selectedFood.name}!`)
      setFoodInput('')
      setQuantity('1')
      setSelectedFood(null)
      setIsAdding(false)
      
      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMessage(''), 2000)
    }, 300)
  }

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn">
          <i className="fas fa-check-circle text-xl"></i>
          <span className="font-bold">{successMessage}</span>
        </div>
      )}
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-8 mb-8 overflow-hidden">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-plus text-orange-500 text-xl"></i>
          Add Food Entry
        </h2>
      </div>

      <div className="flex gap-2 sm:gap-3 items-end flex-col sm:flex-row relative z-10">
        <div className="flex-1 w-full relative">
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
            <i className="fas fa-search text-orange-600 mr-2"></i>
            Search Food
          </label>
          <input
            type="text"
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            placeholder="Type food name..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all hover:border-orange-300 shadow-sm hover:shadow-md bg-white hover:bg-orange-50"
            disabled={isLoading}
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-orange-200 rounded-xl mt-2 max-h-40 sm:max-h-48 overflow-y-auto z-10 shadow-2xl">
              {suggestions.map(food => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelectFood(food)}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-orange-50 border-b border-orange-100 last:border-0 transition-colors group font-medium"
                >
                  <div className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-orange-600">{food.name}</div>
                  <div className="text-xs text-gray-700 mt-1">
                    <i className="fas fa-fire text-orange-500 mr-1"></i>
                    {food.calories} cal • {food.protein}g pro • {food.carbs}g carb • {food.fat}g fat
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full sm:w-28">
          <label htmlFor="quantity-input" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
            <i className="fas fa-balance-scale text-orange-600 mr-2"></i>
            Qty
          </label>
          <input
            id="quantity-input"
            type="number"
            value={quantity}
            onChange={(e) => {setQuantity(e.target.value); setErrors({})}}
            placeholder="1"
            step="0.1"
            min="0.1"
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-xl outline-none transition-all text-center font-bold shadow-sm hover:shadow-md bg-white hover:bg-orange-50 focus:ring-2 focus:ring-offset-1 ${
              errors.quantity
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-200 hover:border-orange-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
            disabled={isLoading}
            aria-invalid={!!errors.quantity}
            aria-describedby={errors.quantity ? 'quantity-error' : undefined}
          />
          {errors.quantity && (
            <p id="quantity-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i>
              {errors.quantity}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!selectedFood || isAdding || !quantity || parseFloat(quantity) <= 0}
          aria-label="Add food to daily log"
          className={`w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-lg font-bold text-sm sm:text-base shadow-lg transition-all transform flex items-center justify-center gap-2 min-h-12 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ 
            !selectedFood || !quantity || parseFloat(quantity) <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-xl active:shadow-md hover:scale-105 active:scale-95 focus:ring-orange-600'
          }`}
        >
          <i className={`fas ${isAdding ? 'fa-spinner fa-spin' : 'fa-plus'}`}></i>
          {isAdding ? 'Adding...' : !selectedFood ? 'Select Food' : !quantity || parseFloat(quantity) <= 0 ? 'Enter Qty' : 'Add'}
        </button>
      </div>

      {selectedFood && (
        <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg shadow-md relative z-10">
          <p className="text-xs sm:text-sm text-gray-700">
            <span className="font-bold text-orange-600 flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              {selectedFood.name}
            </span>
            <span className="text-gray-600 text-xs mt-1 block"> selected</span>
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </form>
    </>
  )
}
