import { useState, useEffect } from 'react'
import { FoodEntryForm, DailyTracker, FoodManagement, Statistics, SettingsModal, Footer, ErrorBoundary } from './components'
import { Food, FoodLog, MacroGoals } from './types'
import googleSheetsService from './services/googleSheetsService'
import { getCurrentDateIST } from './utils/timezone'
import { generateUUID } from './utils/id'

const DEMO_FOODS: Food[] = [
  { id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '2', name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: '3', name: 'Egg', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: '4', name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: '5', name: 'Broccoli', calories: 34, protein: 3.7, carbs: 7, fat: 0.4 },
  { id: '6', name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: '7', name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: '8', name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1 },
]

const DEFAULT_GOALS: MacroGoals = {
  calories: 2500,
  protein: 150,
  carbs: 250,
  fat: 80,
}

function App() {
  const [foods, setFoods] = useState<Food[]>(DEMO_FOODS)
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS)
  const [activeTab, setActiveTab] = useState<'tracker' | 'foods' | 'stats'>('tracker')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getCurrentDateIST())

  // Initialize Google Sheets service on app load
  useEffect(() => {
    const url = 'https://script.google.com/macros/s/AKfycbyAdCA_O1UHdCU3l-yukuXZNDXEZE98pNzl0vQXoBQp85p8sYlpNSmnJziQx6xMn9k4/exec'
    googleSheetsService.initialize(url)
    console.log('Google Sheets integration initialized')
  }, [])

  // Load data from Google Sheets when date changes
  useEffect(() => {
    const loadFromSheets = async () => {
      if (!googleSheetsService.isConfigured()) return

      try {
        const data = await googleSheetsService.loadDailyData(selectedDate)
        if (data && data.foodLogs && data.foodLogs.length > 0) {
          console.log('📥 Loaded from Google Sheets:', data.foodLogs)
          // Convert sheet data to app format
          const convertedLogs = data.foodLogs.map((log: any) => ({
            id: log.id || log.timestamp || Date.now().toString(),
            foodId: 'imported',
            foodName: log.foodName,
            quantity: log.quantity,
            calories: log.calories,
            protein: log.protein,
            carbs: log.carbs,
            fat: log.fat,
            timestamp: new Date(log.timestamp),
          }))
          setLogs(convertedLogs)
          console.log('✅ Synced logs from Sheets:', convertedLogs.length, 'entries')
        } else {
          // No data for this date, clear logs
          console.log('📭 No data in Google Sheets for', selectedDate)
          setLogs([])
        }
      } catch (error) {
        console.error('Failed to load from Google Sheets:', error)
      }
    }

    loadFromSheets()
  }, [selectedDate])

  const handleAddLog = (foodId: string, quantity: number) => {
    const food = foods.find(f => f.id === foodId)
    if (!food) return

    const newLog: FoodLog = {
      id: generateUUID(),
      foodId,
      foodName: food.name,
      quantity,
      calories: Math.round(food.calories * quantity),
      protein: Math.round(food.protein * quantity * 10) / 10,
      carbs: Math.round(food.carbs * quantity * 10) / 10,
      fat: Math.round(food.fat * quantity * 10) / 10,
      timestamp: new Date(),
    }

    setLogs([newLog, ...logs])
  }

  // Immediate sync after delete, with error feedback
  const handleDeleteLog = async (logId: string) => {
    const updatedLogs = logs.filter(l => l.id !== logId)
    setLogs(updatedLogs)
    // Immediately sync to Google Sheets after delete
    try {
      const totals = updatedLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
      const caloriePercent = goals.calories > 0 ? Math.min((totals.calories / goals.calories) * 100, 100) : 0
      const success = await googleSheetsService.saveDailyData(selectedDate, updatedLogs, totals)
      await googleSheetsService.saveDailySummary(
        selectedDate,
        totals,
        goals.calories,
        caloriePercent,
        updatedLogs.length
      )
      // Statistics (optional, keep in sync)
      const avgCalories = updatedLogs.length > 0 ? updatedLogs.reduce((sum, log) => sum + log.calories, 0) / updatedLogs.length : 0
      const avgProtein = updatedLogs.length > 0 ? updatedLogs.reduce((sum, log) => sum + log.protein, 0) / updatedLogs.length : 0
      const avgCarbs = updatedLogs.length > 0 ? updatedLogs.reduce((sum, log) => sum + log.carbs, 0) / updatedLogs.length : 0
      const avgFat = updatedLogs.length > 0 ? updatedLogs.reduce((sum, log) => sum + log.fat, 0) / updatedLogs.length : 0
      const daysLogged = updatedLogs.length > 0 ? 1 : 0
      await googleSheetsService.saveStatistics(
        selectedDate,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        daysLogged
      )
      if (!success) {
        alert('Failed to sync deleted log to Google Sheets. Please check your connection.')
      }
    } catch (error) {
      alert('Error syncing with Google Sheets after deleting log. Please try again.')
      console.error('Sync error after delete:', error)
    }
  }

  const handleAddFood = (foodData: Omit<Food, 'id'>) => {
    const newFood: Food = {
      ...foodData,
      id: generateUUID(),
    }
    setFoods([...foods, newFood])
  }

  const handleEditFood = (id: string, foodData: Omit<Food, 'id'>) => {
    setFoods(foods.map(f => (f.id === id ? { ...foodData, id } : f)))
  }

  const handleDeleteFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id))
  }

  // ...existing code...

  // Get logs for selected date
  const todaysLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0]
    return logDate === selectedDate
  })

  // Navigate to previous/next day
  const goToPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-2xl">
        <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

          {/* Title Section */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 relative z-10">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-opacity-30 transition-all duration-300">
                <img src="/favicon.svg" alt="Panda" className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-lg sm:text-4xl font-black tracking-tight leading-tight">Calorie Tracker</h1>
                <p className="text-xs sm:text-sm font-medium text-orange-100 mt-0.5">Track, Analyze, Achieve</p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 sm:p-3 bg-white text-orange-600 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base hover:bg-gray-50 hover:shadow-lg transform hover:scale-110 active:scale-95 shadow-md"
              title="Daily Goals"
            >
              <i className="fas fa-sliders-h"></i>
              <span className="hidden sm:inline">Goals</span>
            </button>
          </div>
          
          {/* Date Navigation Section */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white bg-opacity-20 backdrop-blur-md rounded-xl border border-white border-opacity-30 flex-1 shadow-lg hover:shadow-xl transition-all duration-300">
              <button
                onClick={goToPreviousDay}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-bold text-gray-800"
                title="Previous day"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <div className="flex flex-col items-center flex-1 text-center">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button
                onClick={goToNextDay}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 disabled:opacity-50 font-bold text-gray-800"
                title="Next day"
                disabled={!isToday}
              >
                <i className={`fas fa-chevron-right text-sm`}></i>
              </button>
            </div>
            {!isToday && (
              <button
                onClick={goToToday}
                className="px-2 sm:px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg transition-colors text-xs sm:text-sm flex items-center gap-1"
              >
                <i className="fas fa-calendar-day"></i>
                <span className="hidden sm:inline">Today</span>
              </button>
            )}
          </div>
        </div>


      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-24">
        <div className="max-w-6xl mx-auto">
        {/* Tab Content */}
        {activeTab === 'tracker' && (
          <div className="space-y-3 sm:space-y-6 animate-fadeIn">
            <FoodEntryForm foods={foods} onAddLog={handleAddLog} />
            <DailyTracker logs={todaysLogs} goals={goals} onDeleteLog={handleDeleteLog} currentDate={selectedDate} />
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="animate-fadeIn">
            <FoodManagement
              foods={foods}
              onAddFood={handleAddFood}
              onEditFood={handleEditFood}
              onDeleteFood={handleDeleteFood}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="animate-fadeIn">
            <Statistics logs={logs} selectedDate={selectedDate} />
          </div>
        )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <SettingsModal
        isOpen={settingsOpen}
        goals={goals}
        onClose={() => setSettingsOpen(false)}
        onSave={(newGoals) => setGoals(newGoals)}
      />

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
