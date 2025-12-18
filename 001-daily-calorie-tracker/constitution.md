# Daily Calorie Tracker - Project Constitution

## Project Vision
Build a modern, responsive web application that empowers users to track their daily caloric intake and macronutrient consumption. The application should provide actionable insights through visualizations and statistics while maintaining a delightful user experience across all devices.

## Core Principles

### 1. User-Centric Design
- Prioritize mobile-first responsive design for all screen sizes
- Create intuitive navigation with minimal learning curve
- Provide immediate visual feedback for all user actions
- Focus on accessibility and ease of use

### 2. Code Quality & Maintainability
- Write clean, well-documented TypeScript code
- Follow React best practices and functional component patterns
- Maintain component separation of concerns
- Use meaningful variable names and clear code structure
- Implement proper error handling and validation

### 3. Performance & Optimization
- Minimize bundle size and load times
- Use efficient state management patterns
- Optimize re-renders with React hooks (useMemo, useCallback)
- Lazy load non-critical components
- Cache user data locally in browser

### 4. Visual Excellence
- Apply modern design patterns (gradients, glass-morphism, animations)
- Maintain consistent color scheme and typography
- Use shadows and depth for visual hierarchy
- Implement smooth transitions and micro-interactions
- Ensure proper contrast ratios for accessibility

### 5. Testing & Reliability
- Write unit tests for utility functions
- Test component rendering and user interactions
- Validate data accuracy for calorie calculations
- Test across multiple browsers and devices
- Implement error boundaries for graceful failure handling

## Technology Stack

### Frontend Framework
- **React** 19.2.3 with TypeScript 5.6.3
- **Vite** 6.0.10 as build tool and dev server
- **Tailwind CSS** v4 with @tailwindcss/postcss for styling

### UI & Visualization
- **Recharts** 2.x for nutritional data visualizations
- **Font Awesome** 6.4.0 for icons

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## Code Quality Standards

### Naming Conventions
- Use PascalCase for component and class names
- Use camelCase for functions, variables, and methods
- Use UPPER_CASE for constants
- Use descriptive, self-documenting names

### Component Structure
- One component per file (with exceptions for small utility components)
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for prop types

### CSS/Styling Guidelines
- Use Tailwind CSS utility classes primarily
- Create custom CSS only when necessary
- Follow mobile-first breakpoint approach (sm:, md:, lg:)
- Organize responsive classes logically
- Use CSS variables for dynamic theming

### State Management
- Use React hooks (useState, useContext) for local state
- Lift state up only when necessary
- Consider custom hooks for complex state logic
- Avoid prop drilling with context when appropriate

## Performance Requirements

### Load Time Targets
- Initial page load: < 3 seconds
- Interactive UI: < 5 seconds
- Subsequent navigations: < 1 second

### Bundle Size Goals
- Main bundle: < 500KB (gzipped)
- Chunk optimization for code splitting
- Image optimization and lazy loading

## User Experience Standards

### Responsiveness
- Mobile: 320px and up
- Tablet: 768px and up
- Desktop: 1024px and up
- Support for landscape and portrait orientations

### Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1 for text

### Data Handling
- Preserve user input across sessions
- Local storage for food database
- Clear user feedback for all operations
- Secure handling of personal health data

## Feature Quality Metrics

### Tracking Features
- Accurate calorie and macro calculations
- Real-time updates to daily totals
- Clear visualization of progress vs. goals
- Easy food addition and removal

### Analytics & Insights
- 7-day trend visualization
- Macro nutrient breakdown charts
- Daily summaries and statistics
- Goal tracking and progress indicators

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `feature/*`: New features in development
- `fix/*`: Bug fixes and patches

### Code Review Checklist
- [ ] Code follows naming conventions
- [ ] No console.log statements in production code
- [ ] TypeScript has no `any` types without justification
- [ ] Components are properly typed
- [ ] Changes tested locally
- [ ] Documentation updated if needed

### Testing Requirements
- Unit tests for utility functions
- Component tests for complex logic
- Manual testing across multiple browsers
- Responsive design testing on actual devices

## Documentation Standards

### Code Comments
- Use JSDoc comments for functions and complex logic
- Explain the "why" not just the "what"
- Keep comments up-to-date with code changes
- Comment non-obvious algorithmic decisions

### File Structure Documentation
- README for each major feature directory
- Architecture diagrams for complex flows
- API documentation for custom hooks

## Success Criteria

### Functional Requirements
- ✅ Track daily caloric intake with accuracy
- ✅ Manage food database with search functionality
- ✅ Display nutritional statistics and trends
- ✅ Provide responsive UI across all devices
- ✅ Persist user data locally

### Non-Functional Requirements
- ✅ Fast loading and responsive interactions
- ✅ Clean, maintainable codebase
- ✅ Accessible to all users
- ✅ Scalable for future features

## Continuous Improvement
- Regular code reviews and refactoring
- Monitor user feedback and analytics
- Update dependencies responsibly
- Improve test coverage incrementally
- Optimize performance based on metrics
