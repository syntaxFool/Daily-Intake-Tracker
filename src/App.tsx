import { useState, useEffect } from 'react'
import { FoodEntryForm, DailyTracker, FoodManagement, Statistics, SettingsModal, Footer, ErrorBoundary } from './components'
import { Food, FoodLog, MacroGoals } from './types'
import * as firebaseFoodsService from './services/firebaseFoodsService'
import * as firebaseLogsService from './services/firebaseLogsService'
import * as firebaseGoalsService from './services/firebaseGoalsService'
import { getCurrentDateIST } from './utils/timezone'
import { generateUUID } from './utils/id'



const DEFAULT_GOALS: MacroGoals = {
  calories: 2500,
  protein: 150,
  carbs: 250,
  fat: 80,
}

function App() {
      const [foodsLoading, setFoodsLoading] = useState(false)
      const [foodsError, setFoodsError] = useState<string | null>(null)
    // Load foods from Firebase on mount
    useEffect(() => {
      const loadFoods = async () => {
        setFoodsLoading(true)
        setFoodsError(null)
        try {
          const foodsData = await firebaseFoodsService.getFoods()
          if (foodsData && Array.isArray(foodsData)) {
            setFoods(foodsData)
            console.log('✅ Loaded foods from Firebase:', foodsData.length)
          } else {
            setFoods([])
          }
        } catch (error) {
          setFoodsError('Failed to load foods from Firebase.')
          console.error('Failed to load foods from Firebase:', error)
        } finally {
          setFoodsLoading(false)
        }
      }
      loadFoods()
    }, [])
  const [foods, setFoods] = useState<Food[]>([])
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS)
  const [activeTab, setActiveTab] = useState<'tracker' | 'foods' | 'stats'>('tracker')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getCurrentDateIST())

  // Load logs from Firebase when date changes
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logsData = await firebaseLogsService.getLogsByDate(selectedDate)
        setLogs(logsData)
      } catch (error) {
        setLogs([])
        console.error('Failed to load logs from Firebase:', error)
      }
    }
    loadLogs()
  }, [selectedDate])

  // Load goals from Firebase on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const goalsData = await firebaseGoalsService.getGoals()
        if (goalsData) setGoals(goalsData)
      } catch (error) {
        setGoals(DEFAULT_GOALS)
        console.error('Failed to load goals from Firebase:', error)
      }
    }
    loadGoals()
  }, [])

  const handleAddLog = async (foodId: string, quantity: number) => {
    const food = foods.find(f => f.id === foodId)
    if (!food) return
    const newLog: Omit<FoodLog, 'id'> = {
      foodId,
      foodName: food.name,
      quantity,
      calories: Math.round(food.calories * quantity),
      protein: Math.round(food.protein * quantity * 10) / 10,
      carbs: Math.round(food.carbs * quantity * 10) / 10,
      fat: Math.round(food.fat * quantity * 10) / 10,
      timestamp: new Date().toISOString(),
    }
    try {
      const added = await firebaseLogsService.addLog(selectedDate, newLog)
      setLogs(prev => [added, ...prev])
    } catch (error) {
      console.error('Failed to add log to Firebase:', error)
    }
  }

  // Immediate sync after delete, with error feedback
  const handleDeleteLog = async (logId: string) => {
    try {
      await firebaseLogsService.deleteLog(selectedDate, logId)
      setLogs(prev => prev.filter(l => l.id !== logId))
    } catch (error) {
      console.error('Failed to delete log from Firebase:', error)
    }
  }

  const handleAddFood = async (foodData: Omit<Food, 'id'>) => {
    setFoodsLoading(true)
    setFoodsError(null)
    try {
      const added = await firebaseFoodsService.addFood(foodData)
      setFoods(prev => [...prev, added])
    } catch (error) {
      setFoodsError('Failed to add food to Firebase.')
      console.error('Failed to add food to Firebase:', error)
    } finally {
      setFoodsLoading(false)
    }
  }

  const handleEditFood = async (id: string, foodData: Omit<Food, 'id'>) => {
    setFoodsLoading(true)
    setFoodsError(null)
    try {
      await firebaseFoodsService.updateFood(id, foodData)
      setFoods(prev => prev.map(f => (f.id === id ? { ...foodData, id } : f)))
    } catch (error) {
      setFoodsError('Failed to update food in Firebase.')
      console.error('Failed to update food in Firebase:', error)
    } finally {
      setFoodsLoading(false)
    }
  }

  const handleDeleteFood = async (id: string) => {
    setFoodsLoading(true)
    setFoodsError(null)
    try {
      await firebaseFoodsService.deleteFood(id)
      setFoods(prev => prev.filter(f => f.id !== id))
    } catch (error) {
      setFoodsError('Failed to delete food from Firebase.')
      console.error('Failed to delete food from Firebase:', error)
    } finally {
      setFoodsLoading(false)
    }
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
            {foodsLoading && (
              <div className="text-center py-4 text-blue-600 font-bold">Loading foods...</div>
            )}
            {foodsError && (
              <div className="text-center py-4 text-red-600 font-bold">{foodsError}</div>
            )}
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
        onSave={async (newGoals) => {
          setGoals(newGoals)
          try {
            await firebaseGoalsService.setGoals(newGoals)
          } catch (error) {
            console.error('Failed to save goals to Firebase:', error)
          }
        }}
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
