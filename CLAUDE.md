# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Learning Context

This is a **learning project** - the developer's first solo React project being built for educational purposes and portfolio development.

**Developer Background:**

- 3+ years experience in JavaScript, HTML, and CSS
- Only a few months of React experience
- Strong programming fundamentals, new to React-specific patterns

**Approach Guidelines:**

- **Always explain your decisions**: Provide clear explanations for why certain approaches, patterns, or technologies are chosen
- **Complex patterns are allowed when necessary**: Use advanced patterns when they provide significant benefit, but explain them in detail with educational focus
- **Detailed explanations for React concepts**: Since the developer has strong JS fundamentals but is new to React, focus explanations on React-specific patterns, hooks, component lifecycle, and ecosystem conventions
- **Progressive complexity**: Start with simpler solutions and explain when/why to evolve to more complex patterns
- **Educational focus**: Prioritize learning value - explain the "why" behind React best practices, not just the "how"
- **Portfolio preparation**: Consider that this project will be showcased, so maintain clean, well-documented, and professional code standards
- **MANDATORY PEDAGOGY**: After every code modification or proposal, provide detailed explanations like a teacher to a student developer learning React. Explain the code, justify choices, and detail why this solution was chosen over alternatives
  - **PEDAGOGY FILES**: For each code modification, create a corresponding .md file in the `/pedagogy` folder with detailed explanations, justifications, and alternatives considered. One pedagogical file per code change. These pedagogical files MUST be written in French
- **MANDATORY**: All code, comments, and messages must be in English only
  and variable names, function names, and all identifiers must be in English
- **COMMUNICATION LANGUAGE**: The developer will communicate primarily in French. Claude should respond in French for terminal/CLI interactions and explanations. However, all code, code comments, and documentation files must remain in English

## Common Development Commands

- `pnpm dev` - Start development server with Vite
- `pnpm build` - Build production bundle
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview production build locally

## Current Project Status

**Initial Setup**: Fresh Vite + React + TypeScript project
**Next Priority**: Authentication implementation using Supabase
**Form Strategy**: React Hook Form + Zod for all forms
**State Management**: Start simple with useState/useContext, no React Query/SWR initially

## Project Architecture

Get Granted 417 is a React SPA for tracking work hours for Working Holiday Visa 417 Holders (Australia). The application helps backpackers calculate and track their "specified work" hours to qualify for second or third Working Holiday Visas. The application uses:

### Frontend Stack

- **React 19.1.0** with JSX (not TypeScript) - Latest React with modern hooks
- **Vite 7.0.0** for build tooling and development server - ESM and fast HMR
- **React Router 7.6.3** for client-side routing - Nested routes with protected routing
- **Tailwind CSS 4.1.11** with custom CSS variables - Utility-first styling
- **shadcn/ui** components (configured in `components.json`) - Modern design system
- **Lucide React 0.525.0** for icons - 1000+ customizable icons
- **Recharts 3.0.2** for data visualization - Professional charts and graphs

### Backend & Database

- **Supabase** for authentication, database, and real-time subscriptions
- **PostgreSQL** database with 47 migrations and comprehensive schema
- **Row Level Security (RLS)** policies for secure multi-user data access
- **PostgreSQL Functions** for complex business logic and calculations
- **Auto-triggers** for maintaining data consistency and progress updates

### Key Architectural Patterns

**Multi-Context State Management:**

- `AuthContext` + `AuthContextProvider` for authentication state
- `VisaContext` + `VisaProvider` for visa selection and switching
- Protected routes with `ProtectedRoute` components

**Advanced Database Schema:**

- **4 main tables**: user_profiles, user_visas, employers, work_entries
- **Foreign key relationships** maintaining referential integrity
- **Generated columns** for calculated fields
- **Check constraints** for business rule enforcement

### Quick Reference

- Import aliasing: `@/` points to `src/` directory via Vite config
- Form handling: Use FormData with custom validation utilities
- Error handling: Consistent try/catch patterns with user-friendly messages

### Data Validation Strategy

**Zod for Runtime Validation:**
- Use **Zod** as the primary validation library for all form inputs and API data
- Create reusable schemas that mirror the database structure
- Validate data BEFORE sending to Supabase to ensure data integrity
- Use Zod for type inference when TypeScript is not available

**Implementation Guidelines:**
```javascript
// Define schemas in features/[feature]/schemas/
import { z } from 'zod';

// Example schema matching database constraints
const workEntrySchema = z.object({
  employer_id: z.string().uuid('Invalid employer ID'),
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  hours_worked: z.number().min(0.5).max(24),
  hourly_rate: z.number().positive().optional(),
  industry_type: z.enum(['plant_animal', 'fishing', 'mining', 'construction', ...])
});

// Use with forms before Supabase operations
const validatedData = workEntrySchema.parse(formData);
```

**Benefits of Zod in this project:**
- Client-side validation before expensive database calls
- Type-safe data transformation
- Consistent error messages across the application
- Reduced reliance on database constraints for validation feedback
- Better user experience with immediate validation feedback

## Development Notes

- Typescript
- Uses `pnpm` as package manager
- ESLint configured for React hooks and modern JavaScript

## Supabase Integration

The app uses Supabase for:

- **Authentication**: User registration, login, and session management
- **Database**: PostgreSQL database for storing user data, employers, and work entries
- **Environment**: Configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## UI Framework

Uses shadcn/ui:

- Components use CSS variables for theming
- Radix UI primitives for accessibility
- Tailwind CSS for styling

### IMPORTANT: shadcn/ui Component Installation

**ALWAYS use the shadcn CLI to install UI components. NEVER create them manually.**

```bash
npx shadcn@latest add [component-name]
```

This ensures consistency, proper dependencies, and correct configuration according to the project's components.json.

## Working Holiday Visa 417 - Business Context

### Application Purpose

Get Granted 417 helps Working Holiday Visa (WHV) 417 holders track their "specified work" to qualify for visa extensions. The name represents "Get Granted" - referring to getting your visa granted - with "417" explicitly referencing the Working Holiday Visa subclass 417.

### Specified Work Requirements

**Second WHV (2nd year):**

- **Duration Required**: 3 months (88 calendar days minimum)
- **Work Type**: Must be "specified work" in eligible industries and regional areas
- **Calculation**: Full-time equivalent work - can be continuous or accumulated over longer periods

**Third WHV (3rd year):**

- **Duration Required**: 6 months (179 calendar days minimum)
- **Work Type**: Must be "specified work" in eligible industries and regional areas
- **Calculation**: Full-time equivalent work over minimum 6 calendar months
- **Important**: Cannot be completed in less than 6 calendar months total period

### Eligible Industries (ANZSIC Classification)

1. **Plant and Animal Cultivation** - Agriculture, farming, fruit picking, livestock care
2. **Fishing and Pearling** - Commercial fishing, aquaculture, pearl diving
3. **Tree Farming and Felling** - Forestry, logging, tree cultivation
4. **Mining** - All mining sector activities per ANZSIC division
5. **Construction** - All construction sector activities per ANZSIC division
6. **Hospitality & Tourism** - Chef, guest services, dive instructor, tour guide (Northern Australia & Remote areas only, from June 2021)
7. **Bushfire Recovery Work** - Land/property restoration, wildlife care, support services in designated disaster areas
8. **Critical COVID-19 Work** - Medical, aged care, disability care, childcare, food processing (health sectors)

### Target Users - International Backpackers

Get Granted 417 serves **international backpackers** (not Australian citizens) who hold Working Holiday Visas and come to work in Australia.

### Eligible Countries for WHV 417 (2025)

**European Countries:**

- Belgium, Cyprus, Denmark, Estonia, Finland, France, Germany
- Ireland, Italy, Malta, Netherlands, Norway, Sweden
- United Kingdom of Great Britain and Northern Ireland

**Asian Countries:**

- Hong Kong SAR (including British National Overseas passport holders)
- Japan, South Korea (Republic of Korea), Taiwan

**North American Countries:**

- Canada

**Age Requirements by Nationality:**

- **Ages 18-30**: Belgium, Cyprus, Estonia, Finland, Germany, Hong Kong, Italy, Japan, South Korea, Malta, Netherlands, Norway, Sweden, Taiwan
- **Ages 18-35**: Canada, Denmark, France, Ireland, United Kingdom

### Specified Work Requirements by Visa Type

**ALL Nationalities (except UK):**

- **2nd Visa**: Must complete 88 calendar days (3 months) of specified work during 1st WHV
- **3rd Visa**: Must complete 179 calendar days (6 months) of specified work during 2nd WHV

**UK Citizens Special Exemption (from July 1, 2024):**

- **2nd & 3rd Visa**: NO specified work requirement needed
- Can apply for up to 3 consecutive WHVs without regional work
- Exemption applies to applications lodged on/after July 1, 2024

### Countries NOT Eligible for WHV 417

These nationalities must apply for Work and Holiday Visa (subclass 462) instead:

- Argentina, Austria, Chile, China, Czech Republic, Hungary
- Indonesia, Israel, Luxembourg, Malaysia, Peru, Poland
- Portugal, San Marino, Singapore, Slovakia, Slovenia, Spain
- Thailand, Turkey, USA, Uruguay, Vietnam

### Key Statistics for Target Market

- **19 eligible countries/territories** for WHV 417
- **Estimated 150,000+ annual applicants** across all nationalities
- **Primary demographics**: Europeans (60%), Canadians (20%), Asians (20%)
- **Highest volume countries**: UK, Germany, France, Ireland, Canada, Japan

## Internationalization (i18n) - Future Implementation

**Priority Languages:** German, French, Italian (Tier 1) → Dutch, Swedish, Danish, Norwegian (Tier 2)
**Implementation:** React i18next, subdirectory URLs (/de/, /fr/), browser detection with English fallback

## Bulletproof React Architecture Guidelines

This project follows the principles from [Bulletproof React](https://github.com/alan2207/bulletproof-react) for scalable and maintainable React applications.

### Core Principles

1. **Feature-Based Architecture**: Organize code by features, not file types
2. **Unidirectional Code Flow**: shared → features → app (no cross-feature imports)
3. **Colocation**: Keep related code close together
4. **Type Safety**: Full TypeScript implementation for better developer experience
5. **Testing First**: Write tests alongside features
6. **Performance by Default**: Implement optimization patterns from the start

### Project Structure Pattern

```
src/
├── app/               # Application layer (providers, router, app entry)
├── assets/            # Static files (images, fonts)
├── components/        # Shared/reusable components
├── config/            # Global configuration, env variables
├── features/          # Feature-based modules
│   └── [feature]/
│       ├── api/       # Feature API requests & hooks
│       ├── components/# Feature-specific components
│       ├── hooks/     # Feature-specific hooks
│       ├── stores/    # Feature state (context/zustand)
│       ├── types/     # Feature TypeScript types
│       └── utils/     # Feature utilities
├── hooks/             # Shared hooks
├── lib/               # Pre-configured libraries (supabase client)
├── stores/            # Global state stores
├── test/              # Test utilities and mocks
├── types/             # Shared TypeScript types
└── utils/             # Shared utility functions
```

### Import Rules & Restrictions

- **No cross-feature imports**: Features should be independent
- **Use absolute imports**: `@/features/`, `@/components/`, etc.
- **Enforce with ESLint**: Configure rules to prevent architectural violations
- **Direct imports only**: Avoid barrel exports (index.js) for better tree-shaking

### Component Guidelines

1. **Small & Focused**: One component, one responsibility
2. **Composition over Inheritance**: Use component composition patterns
3. **Props Interface**: Keep props minimal and well-typed
4. **Consistent Naming**: Use PascalCase for components, kebab-case for files
5. **Colocation**: Keep styles, tests, and stories next to components

### State Management Strategy

1. **Local State First**: useState for component state
2. **Context for Features**: Feature-specific context when needed
3. **Global State Sparingly**: Only for truly global state (auth, theme)
4. **Server State**: Use React Query/SWR patterns with Supabase

### Code Quality Standards

- **File Naming**: kebab-case for all files and folders
- **ESLint**: Enforce consistent code style and catch errors
- **Prettier**: Auto-format on save
- **Git Hooks**: Pre-commit validation with Husky
- **Type Checking**: Run type checks before commits

### Testing Philosophy

1. **Integration over Unit**: Focus on user behavior testing
2. **Test Features**: Test complete user flows
3. **Mock External Dependencies**: Mock API calls and external services
4. **Accessibility Testing**: Include a11y checks in tests

### Performance Patterns

1. **Code Splitting**: Lazy load features and routes
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **Virtual Lists**: For large data sets
4. **Image Optimization**: Lazy loading and responsive images
5. **Bundle Analysis**: Regular bundle size monitoring

### Security Best Practices

1. **Environment Variables**: Never expose secrets in code
2. **Input Validation**: Validate all user inputs
3. **XSS Prevention**: Sanitize user-generated content
4. **HTTPS Only**: Enforce secure connections
5. **Row Level Security**: Use Supabase RLS policies

## Complete Bulletproof React Implementation Guide

### API Layer Architecture

**Single API Client Instance:**
- Use one pre-configured client (axios, fetch wrapper) for entire app
- Configure in `src/lib/api-client.js` with base URL, headers, interceptors

**API Request Structure:**
```javascript
// features/work-entries/api/get-work-entries.js
export const getWorkEntriesQueryOptions = (params) => ({
  queryKey: ['work-entries', params],
  queryFn: () => apiClient.get('/work-entries', { params }),
});

// In component
const { data, error } = useQuery(getWorkEntriesQueryOptions(filters));
```

**Error Handling in API:**
- Implement interceptors for global error handling
- Auto-refresh tokens on 401
- Show toast notifications for errors
- Log errors to monitoring service

### State Management Hierarchy

**1. Component State (useState/useReducer)**
```javascript
// For UI state only
const [isOpen, setIsOpen] = useState(false);
const [formState, dispatch] = useReducer(formReducer, initialState);
```

**2. Application State (Context/Zustand)**
```javascript
// Global UI state (modals, notifications, theme)
const NotificationContext = createContext();
const useNotification = () => useContext(NotificationContext);
```

**3. Server Cache State (React Query/SWR)**
```javascript
// All server data
const { data, mutate } = useSWR('/api/work-entries', fetcher);
```

**4. Form State (React Hook Form)**
```javascript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

**5. URL State (React Router)**
```javascript
const [searchParams, setSearchParams] = useSearchParams();
const filter = searchParams.get('filter');
```

### Testing Strategy Details

**Test Priority Order:**
1. **Integration Tests (70%)**: Test complete user flows
2. **E2E Tests (20%)**: Critical paths only
3. **Unit Tests (10%)**: Complex utilities only

**Integration Test Example:**
```javascript
// features/work-entries/__tests__/work-entry-flow.test.jsx
describe('Work Entry Management', () => {
  it('complete flow: create, edit, delete', async () => {
    const { user } = renderWithProviders(<App />);
    
    // Navigate to form
    await user.click(screen.getByRole('button', { name: /add entry/i }));
    
    // Fill form
    await user.type(screen.getByLabelText(/employer/i), 'Farm ABC');
    await user.type(screen.getByLabelText(/hours/i), '8');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify creation
    expect(await screen.findByText('Farm ABC')).toBeInTheDocument();
  });
});
```

**Mocking Strategy:**
- Use MSW for API mocking
- Mock at network level, not module level
- Share mocks between tests and development

### Error Handling Patterns

**1. API Error Interceptor:**
```javascript
// lib/api-client.js
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient.request(error.config);
    }
    
    showNotification({ type: 'error', message });
    return Promise.reject(error);
  }
);
```

**2. Error Boundaries:**
```javascript
// app/providers/app.jsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <AuthProvider>
    <Router>
      <Routes>
        {/* Each route wrapped in its own boundary */}
        <Route path="/dashboard" element={
          <ErrorBoundary fallback={<DashboardError />}>
            <Dashboard />
          </ErrorBoundary>
        } />
      </Routes>
    </Router>
  </AuthProvider>
</ErrorBoundary>
```

**3. Form Validation:**
```javascript
// features/work-entries/schemas/work-entry.schema.js
const workEntrySchema = z.object({
  employer: z.string().min(1, 'Employer is required'),
  hours: z.number().min(0.5).max(24),
  date: z.date().max(new Date(), 'Cannot be in future'),
});
```

### Performance Optimization Patterns

**1. Route-Based Code Splitting:**
```javascript
// app/routes/index.jsx
const Dashboard = lazy(() => import('@/features/dashboard'));
const WorkEntries = lazy(() => import('@/features/work-entries'));

export const routes = [
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Spinner />}>
        <Dashboard />
      </Suspense>
    ),
  },
];
```

**2. Component Optimization:**
```javascript
// Prevent unnecessary renders with children pattern
function Layout({ children }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <ExpensiveHeader count={count} />
      {children} {/* Children don't re-render when count changes */}
    </div>
  );
}
```

**3. State Optimization:**
```javascript
// Expensive initial state
const [data, setData] = useState(() => {
  return processLargeDataset(initialData);
});

// Split contexts to prevent unnecessary renders
const ThemeContext = createContext();
const UserContext = createContext(); // Separate from theme
```

**4. List Virtualization:**
```javascript
// For lists > 100 items
import { VirtualList } from '@tanstack/react-virtual';

function LargeList({ items }) {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
}
```

**5. Image Optimization:**
```javascript
// components/ui/optimized-image.jsx
function OptimizedImage({ src, alt, ...props }) {
  return (
    <img
      loading="lazy"
      decoding="async"
      src={src}
      srcSet={`${src}?w=400 400w, ${src}?w=800 800w`}
      alt={alt}
      {...props}
    />
  );
}
```

### Monitoring & Analytics

**Web Vitals Tracking:**
```javascript
// app/index.jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Security Implementation

**Input Sanitization:**
```javascript
import DOMPurify from 'isomorphic-dompurify';

function SafeHTML({ html }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(html) 
      }} 
    />
  );
}
```

**Environment Variables:**
```javascript
// NEVER commit .env files
// .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

// Access safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (!supabaseUrl) throw new Error('Missing Supabase URL');
```
