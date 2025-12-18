import React from 'react'
import { FoodLog } from '../types'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

/**
 * Statistics Component (Memoized)
 * 
 * Displays comprehensive nutrition data and trends.
 * Features:
 * - Average daily statistics
 * - Top 5 most logged foods
 * - 7-day calorie trend chart
 * - Macro breakdown bar chart
 * - Calorie composition pie chart
 * - Total intake summary cards
 * - Empty state design
 */
interface StatisticsProps {
  logs: FoodLog[]
  selectedDate?: string
}

const Statistics = React.memo(function Statistics({ logs, selectedDate }: StatisticsProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-white rounded-2xl border border-gray-200 px-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-chart-bar text-3xl sm:text-4xl text-gray-400"></i>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No statistics yet</h3>
        <p className="text-gray-700 text-sm sm:text-base font-medium">Log some foods to see your nutrition trends</p>
        <p className="text-gray-600 text-xs sm:text-sm mt-2">Add at least 2 days of data to see weekly trends</p>
      </div>
    )
  }

  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0)
  const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0)
  const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0)
  const totalFat = logs.reduce((sum, log) => sum + log.fat, 0)

  const avgCalories = Math.round(totalCalories / logs.length)
  const avgProtein = Math.round(totalProtein / logs.length)
  const avgCarbs = Math.round(totalCarbs / logs.length)
  const avgFat = Math.round(totalFat / logs.length)

  const topFoods = logs
    .reduce(
      (acc, log) => {
        const existing = acc.find(f => f.name === log.foodName)
        if (existing) {
          existing.count++
          existing.calories += log.calories
        } else {
          acc.push({
            name: log.foodName,
            count: 1,
            calories: log.calories,
          })
        }
        return acc
      },
      [] as Array<{ name: string; count: number; calories: number }>
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Prepare chart data - last 7 days
  const getLast7DaysData = () => {
    const data: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayLogs = logs.filter(log => new Date(log.timestamp).toISOString().split('T')[0] === dateStr)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: dayLogs.reduce((sum, log) => sum + log.calories, 0),
        protein: dayLogs.reduce((sum, log) => sum + log.protein, 0),
        carbs: dayLogs.reduce((sum, log) => sum + log.carbs, 0),
        fat: dayLogs.reduce((sum, log) => sum + log.fat, 0),
      })
    }
    return data
  }

  // Prepare macro breakdown data
  const macroBreakdown = [
    { name: 'Protein', value: totalProtein * 4, color: '#3B82F6' },
    { name: 'Carbs', value: totalCarbs * 4, color: '#F59E0B' },
    { name: 'Fat', value: totalFat * 9, color: '#EC4899' },
  ]

  const last7DaysData = getLast7DaysData()
  const COLORS = ['#3B82F6', '#F59E0B', '#EC4899']

  const StatCard = ({
    label,
    value,
    unit,
    icon,
    color,
  }: {
    label: string
    value: number
    unit: string
    icon: string
    color: string
  }) => (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
      <div className="flex items-center gap-2 sm:gap-2 mb-3">
        <div className={`text-lg sm:text-xl`}>
          <i className={`fas ${icon} text-${color}`}></i>
        </div>
        <span className="text-xs sm:text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
        {value}
        <span className="text-xs sm:text-sm text-gray-600 ml-2">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Avg Daily Calories" value={avgCalories} unit="cal" icon="fa-fire" color="orange-600" />
        <StatCard label="Total Logged" value={logs.length} unit="items" icon="fa-list" color="blue-600" />
        <StatCard label="Avg Protein" value={avgProtein} unit="g" icon="fa-dumbbell" color="blue-600" />
        <StatCard label="Avg Carbs" value={avgCarbs} unit="g" icon="fa-bread-slice" color="amber-600" />
      </div>

      {/* Top Foods */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fas fa-crown text-orange-500 text-lg sm:text-xl"></i>
            <h3 className="text-base sm:text-xl font-bold text-gray-900">Top Foods</h3>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs sm:text-sm font-bold border border-orange-200">
            Top {topFoods.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {topFoods.map((food, idx) => (
            <div
              key={food.name}
              className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center hover:bg-orange-50 transition-colors group gap-2 sm:gap-0"
              style={{
                animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
              }}
            >
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0 border border-orange-200">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{food.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <i className="fas fa-utensils text-gray-500"></i>
                    Logged {food.count}x
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gray-900 text-sm sm:text-lg">{food.calories}</div>
                <div className="text-xs text-gray-600 flex items-center justify-end gap-1 mt-1">
                  <i className="fas fa-fire text-orange-500"></i>
                  kcal
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <i className="fas fa-chart-line text-orange-600 text-lg sm:text-2xl"></i>
          <h3 className="text-base sm:text-xl font-bold text-gray-900">7-Day Calorie Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={last7DaysData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}
              labelStyle={{ color: '#111827' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
            <Line type="monotone" dataKey="calories" stroke="#ea580c" strokeWidth={2.5} name="Calories" dot={{ r: 4, fill: '#ea580c' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Macro Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Macro Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <i className="fas fa-chart-bar text-amber-600 text-lg sm:text-2xl"></i>
            <h3 className="text-base sm:text-xl font-bold text-gray-900">Macro Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={last7DaysData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} labelStyle={{ color: '#111827' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
              <Bar dataKey="protein" stackId="a" fill="#3B82F6" name="Protein (g)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carbs" stackId="a" fill="#F59E0B" name="Carbs (g)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fat" stackId="a" fill="#EC4899" name="Fat (g)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calorie Composition Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <i className="fas fa-pie-chart text-pink-600 text-lg sm:text-2xl"></i>
            <h3 className="text-base sm:text-xl font-bold text-gray-900">Calorie Composition</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={macroBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} ${Math.round((entry.value / (totalProtein * 4 + totalCarbs * 4 + totalFat * 9)) * 100)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {macroBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Math.round(value)} cal`} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} labelStyle={{ color: '#111827' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <i className="fas fa-calculator text-orange-600 text-lg sm:text-2xl"></i>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Total Intake</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-5 sm:p-6 bg-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-center mb-3">
              <i className="fas fa-fire text-orange-600 text-2xl sm:text-3xl"></i>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalCalories}</div>
            <div className="text-xs sm:text-sm text-gray-700 mt-2 font-bold">Calories</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-center mb-3">
              <i className="fas fa-dumbbell text-blue-600 text-2xl sm:text-3xl"></i>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.round(totalProtein * 10) / 10}</div>
            <div className="text-xs sm:text-sm text-gray-700 mt-2 font-bold">Protein (g)</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-amber-50 rounded-xl border border-amber-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-center mb-3">
              <i className="fas fa-bread-slice text-amber-600 text-2xl sm:text-3xl"></i>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.round(totalCarbs * 10) / 10}</div>
            <div className="text-xs sm:text-sm text-gray-700 mt-2 font-bold">Carbs (g)</div>
          </div>
          <div className="text-center p-5 sm:p-6 bg-pink-50 rounded-xl border border-pink-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-center mb-3">
              <i className="fas fa-droplet text-pink-600 text-2xl sm:text-3xl"></i>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{Math.round(totalFat * 10) / 10}</div>
            <div className="text-xs sm:text-sm text-gray-700 mt-2 font-bold">Fat (g)</div>
          </div>
        </div>
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
    </div>
  )
})

Statistics.displayName = 'Statistics'

export { Statistics }
