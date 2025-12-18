# Daily Calorie Tracker - Implementation Plan

## Technology Stack

### Frontend Architecture
- **Framework**: React 19.2.3 (Functional Components with Hooks)
- **Language**: TypeScript 5.6.3 (strict mode)
- **Build Tool**: Vite 6.0.10 (fast dev server & optimized builds)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Charts**: Recharts 2.x (composable React components)
- **Icons**: Font Awesome 6.4.0 (comprehensive icon library)

### Project Structure
```
calorie-tracker-react/
├── src/
│   ├── components/           # React components
│   │   ├── DailyTracker.tsx  # Main tracker display
│   │   ├── FoodEntryForm.tsx # Food search & add
│   │   ├── FoodManagement.tsx # Food database CRUD
│   │   ├── Statistics.tsx     # Charts & analytics
│   │   ├── Header.tsx         # Top navigation
│   │   └── Footer.tsx         # Bottom navigation
│   ├── hooks/                # Custom React hooks
│   │   ├── useFoodDatabase.ts # Food CRUD operations
│   │   ├── useDailyLog.ts     # Daily log management
│   │   └── useLocalStorage.ts # Persistence layer
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts          # All type definitions
│   ├── utils/                # Utility functions
│   │   ├── calculations.ts    # Calorie/macro calculations
│   │   ├── dateHelpers.ts     # Date formatting & operations
│   │   └── validation.ts      # Form validation
│   ├── data/                 # Static data
│   │   └── defaultFoods.ts    # Pre-loaded food database
│   ├── styles/               # Global styles
│   │   └── index.css          # Tailwind imports
│   ├── App.tsx               # Root component
│   └── index.tsx             # Entry point
├── public/                   # Static assets
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies
```

## Component Architecture

### Component Hierarchy
```
App
├── Header
├── Main Content (based on active tab)
│   ├── DailyTracker (default tab)
│   │   ├── CalorieSummary
│   │   ├── MacroSummary
│   │   ├── FoodEntryForm
│   │   └── FoodLogList
│   ├── FoodManagement (foods tab)
│   │   ├── FoodSearch
│   │   ├── FoodList
│   │   └── FoodModal (add/edit)
│   └── Statistics (stats tab)
│       ├── CalorieTrendChart
│       ├── MacroBreakdownChart
│       └── DailySummary
└── Footer (navigation)
```

## State Management Strategy

### Local Component State (useState)
- Active navigation tab
- Form input values
- Modal open/close states
- Search query and results
- Loading states

### Custom Hooks (sharing logic)
- `useFoodDatabase`: Load/save foods to localStorage
- `useDailyLog`: Load/save daily entries to localStorage
- `useLocalStorage`: Generic key-value persistence
- `useCalculations`: Calorie and macro calculations

### Data Flow
1. **Daily Logs**: Stored in localStorage, hydrated on mount
2. **Food Database**: Stored in localStorage, synced with component state
3. **User Settings**: Stored in localStorage with defaults
4. **Temporary State**: Search results, form values (component state only)

### Local Storage Keys
```
dailyLogs        → JSON array of DailyLogEntry[]
foodDatabase     → JSON array of Food[]
userSettings     → JSON object of UserSettings
appVersion       → String for migration tracking
```

## Key Features Implementation

### Feature 1: Food Search & Logging
**Components**: `FoodEntryForm.tsx`
**Hooks**: `useFoodDatabase`, `useDailyLog`
**Libraries**: React, TypeScript

**Flow**:
1. User types in search input
2. Filter food database in real-time
3. Display matching foods with nutrition info
4. User selects food and enters quantity
5. System calculates macros based on quantity
6. User clicks Add button
7. New entry added to daily log
8. Totals update in real-time

**Calculations**:
```typescript
// Normalize food values to base quantity
const calculateNutrition = (food: Food, quantity: number): Nutrition => ({
  calories: (food.calories / 100) * quantity,
  protein: (food.protein / 100) * quantity,
  carbs: (food.carbs / 100) * quantity,
  fat: (food.fat / 100) * quantity,
})
```

### Feature 2: Daily Totals Display
**Components**: `DailyTracker.tsx`
**Hooks**: `useDailyLog`

**Display Elements**:
- Current date at top
- Large calorie total with progress bar against goal
- Percentage of goal consumed
- Remaining calories
- Macro totals (protein, carbs, fat) with visual bars
- List of all logged foods with delete action

**Real-time Updates**:
- UseEffect watches daily log array
- Recalculates totals on any change
- Updates displayed progress bar
- Shows warnings if over goal

### Feature 3: Statistics & Charts
**Components**: `Statistics.tsx`
**Libraries**: Recharts

**Chart 1: Calorie Trend (LineChart)**
- X-axis: Last 7 days
- Y-axis: Calories
- Two lines: Actual intake vs. Daily goal
- Interactive hover with values

**Chart 2: Macro Breakdown (PieChart)**
- Segments: Protein, Carbs, Fat
- Colors: Red, Yellow, Orange
- Display percentages and grams
- Legend with macros

**Chart 3: Daily Summary (BarChart)**
- X-axis: Macro types
- Y-axis: Grams
- Current day totals
- Goal targets as reference lines

### Feature 4: Food Database Management
**Components**: `FoodManagement.tsx`
**Hooks**: `useFoodDatabase`

**Operations**:
- **List**: Display all foods in searchable table
- **Add**: Modal form with validation
- **Edit**: Modal with pre-filled values
- **Delete**: Confirmation dialog
- **Search**: Real-time filtering by name

**Validation Rules**:
- Food name: Required, max 50 characters
- Calories: Required, number, > 0
- Protein/Carbs/Fat: Required, numbers, ≥ 0
- Serving size: Optional text field

### Feature 5: Navigation
**Components**: `Footer.tsx`, `Header.tsx`

**Mobile Navigation (Bottom Tab Bar)**:
- Three tabs: Tracker, Foods, Stats
- Icons clearly identify sections
- Active tab highlighted in orange
- Touch-friendly sizing (44x44px minimum)

**Header**:
- App title
- Date navigation (prev/next day)
- Settings button (future)

## Data Validation

### Food Entry Validation
```typescript
const validateFood = (food: Partial<Food>): string[] => {
  const errors: string[] = []
  if (!food.name?.trim()) errors.push('Name required')
  if (!food.calories || food.calories < 0) errors.push('Invalid calories')
  if (food.protein === undefined || food.protein < 0) errors.push('Invalid protein')
  if (food.carbs === undefined || food.carbs < 0) errors.push('Invalid carbs')
  if (food.fat === undefined || food.fat < 0) errors.push('Invalid fat')
  return errors
}
```

### Daily Log Validation
```typescript
const validateLogEntry = (entry: Partial<DailyLogEntry>): boolean => {
  return !!(entry.foodId && entry.quantity && entry.quantity > 0 && entry.date)
}
```

## Performance Optimization

### Bundle Size
- **Recharts**: ~150KB (included in dependencies)
- **React**: ~150KB (included)
- **Tailwind CSS**: ~100KB (PurgeCSS removes unused)
- **Total Target**: < 500KB gzipped

### Code Splitting
- Each tab's components can be lazy-loaded
- Charts library loaded on Statistics tab only

### Optimization Techniques
1. **Memoization**: `useMemo` for expensive calculations
2. **Callback Optimization**: `useCallback` for event handlers
3. **Component Memoization**: `React.memo` for pure components
4. **Virtual Scrolling**: For long food lists (future)
5. **Image Optimization**: SVG icons over images

### Local Storage Strategy
- Read data once on app mount
- Debounce writes to localStorage (300ms)
- Compress data if needed
- Version control for migrations

## Error Handling

### Try-Catch Wrapper
```typescript
const safeLocalStorageGet = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return defaultValue
  }
}
```

### User-Facing Errors
- Toast notifications for validation errors
- Inline form error messages
- Graceful fallbacks for missing data
- Clear error messages in user language

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Calculation utility functions
- Validation functions
- Hook behavior in isolation

### Component Tests
- Food search and selection flow
- Daily log add/remove operations
- Chart rendering with sample data
- Form submission and validation

### Integration Tests
- Complete food logging workflow
- Data persistence across sessions
- Navigation between tabs
- Real-time update propagation

### Manual Testing Checklist
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test on tablets
- [ ] Test on desktop browsers
- [ ] Test with various screen sizes
- [ ] Test offline functionality
- [ ] Test with empty/full data states
- [ ] Test with extreme values
- [ ] Test touch interactions on mobile

## Deployment Strategy

### Development
- Local Vite dev server (`npm run dev`)
- Hot module reload for instant feedback
- Source maps for debugging

### Build
- `npm run build` generates optimized bundle
- Output to `dist/` directory
- Ready for static hosting

### Hosting Options
- Vercel (recommended, free tier available)
- GitHub Pages
- Netlify
- AWS S3 + CloudFront
- Any static host

### Environment Configuration
- `.env.local` for local development
- `.env.production` for build settings
- No environment variables needed for MVP

## Future Enhancements

### Phase 2: Cloud Sync
- Firebase integration for user accounts
- Sync data across devices
- Backup and restore functionality

### Phase 3: Advanced Analytics
- Custom date range selection
- Export to CSV/PDF
- Weekly/monthly summaries
- Goal setting and tracking

### Phase 4: Mobile App
- React Native version
- Offline-first architecture
- Native storage
- Push notifications

### Phase 5: Integrations
- Wearable device sync (Apple Health, Fitbit)
- Social sharing
- External food database APIs
- Recipe integration

## Success Criteria

- ✅ All functional requirements implemented
- ✅ Zero console errors or warnings
- ✅ Bundle size < 500KB gzipped
- ✅ Page load < 3 seconds on 4G
- ✅ 95+ Lighthouse score
- ✅ Mobile responsive on all breakpoints
- ✅ Data persists across sessions
- ✅ Accurate calculations (verified tests)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Unit test coverage > 80%
