import React from 'react'

/**
 * Footer Component (Memoized)
 * 
 * Navigation bar with three main tabs: Tracker, Foods, Stats
 * Features:
 * - Tab switching with active state indication
 * - Glass-morphism styling
 * - Smooth animations
 * - Responsive design
 */
interface FooterProps {
  activeTab: 'tracker' | 'foods' | 'stats'
  onTabChange: (tab: 'tracker' | 'foods' | 'stats') => void
}

const Footer = React.memo(function Footer({ activeTab, onTabChange }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 backdrop-blur-xl bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around h-16 sm:h-20 relative">
          {/* Active indicator background */}
          <div
            className="absolute bottom-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 rounded-t-full"
            style={{
              width: '33.333%',
              left: activeTab === 'tracker' ? '0%' : activeTab === 'foods' ? '33.333%' : '66.666%',
            }}
          />

          {/* Tracker Tab */}
          <button
            onClick={() => onTabChange('tracker')}
            className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 transition-all duration-300 group relative ${
              activeTab === 'tracker'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Daily Tracker"
          >
            <div className={`text-2xl sm:text-3xl mb-1 transition-transform duration-300 ${activeTab === 'tracker' ? 'scale-110' : 'group-hover:scale-105'}`}>
              <i className="fas fa-book"></i>
            </div>
            <span className="text-xs font-bold hidden sm:block tracking-wide">{activeTab === 'tracker' ? 'Tracker' : ''}</span>
          </button>

          {/* Foods Tab */}
          <button
            onClick={() => onTabChange('foods')}
            className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 transition-all duration-300 group relative ${
              activeTab === 'foods'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Food Database"
          >
            <div className={`text-2xl sm:text-3xl mb-1 transition-transform duration-300 ${activeTab === 'foods' ? 'scale-110' : 'group-hover:scale-105'}`}>
              <i className="fas fa-utensils"></i>
            </div>
            <span className="text-xs font-bold hidden sm:block tracking-wide">{activeTab === 'foods' ? 'Foods' : ''}</span>
          </button>

          {/* Stats Tab */}
          <button
            onClick={() => onTabChange('stats')}
            className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 transition-all duration-300 group relative ${
              activeTab === 'stats'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Statistics"
          >
            <div className={`text-2xl sm:text-3xl mb-1 transition-transform duration-300 ${activeTab === 'stats' ? 'scale-110' : 'group-hover:scale-105'}`}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <span className="text-xs font-bold hidden sm:block tracking-wide">{activeTab === 'stats' ? 'Stats' : ''}</span>
          </button>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

export { Footer }
