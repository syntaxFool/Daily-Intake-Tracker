export interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodLog {
  id: string
  foodId: string
  foodName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  timestamp: Date
}

export interface DailyMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MacroGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}
