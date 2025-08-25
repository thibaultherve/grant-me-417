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

Grant Me 417 is a React SPA for tracking work hours for Working Holiday Visa 417 Holders (Australia). The application helps backpackers calculate and track their "specified work" hours to qualify for second or third Working Holiday Visas. The application uses:

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

## Mobile-First Design Strategy

**MANDATORY: This application MUST be designed mobile-first with light responsive adaptations for desktop.**

### Core Design Philosophy

- **Target Devices**: Optimized for smartphones (iPhone/Android standard sizes: 375px, 360px)
- **Mobile-First Responsive**: Mobile design is primary, with minimal responsive enhancements for desktop
- **Mobile Native Feel**: App-like experience with mobile-specific UI patterns as foundation

### Design Requirements

**Screen Orientations:**
- **Primary**: Portrait mode (mobile devices)
- **Secondary**: Landscape mode (desktop users get the same proportional layout)

**Typography & Touch Targets:**
- **Minimum font size**: 16px (prevents zoom on mobile browsers)
- **Minimum button size**: 44px (Apple/Google touch guidelines)
- **Touch-friendly spacing**: Generous padding between interactive elements

**Navigation Pattern:**
- **Mobile native navigation**: Bottom tab bar or drawer navigation
- **NO desktop-style navigation**: No top navigation bars or sidebar menus
- **Thumb-friendly**: Navigation within easy thumb reach

**Layout Principles:**
- **Full-width elements**: No max-width constraints, use available screen space
- **Vertical scrolling**: Stack content vertically, avoid horizontal scrolling
- **Single-column layouts**: No complex multi-column layouts
- **Progressive disclosure**: Use modals, sheets, and step-by-step flows

**Forms & Inputs:**
- **Full-width inputs**: Take advantage of available screen space
- **Large input fields**: Easy to tap and type on mobile keyboards
- **Mobile-optimized input types**: Use proper HTML input types (tel, email, date, etc.)
- **Clear visual feedback**: Focus states, validation messages clearly visible

**Performance Optimizations:**
- **Lightweight animations**: Smooth but minimal to preserve battery
- **Touch gestures**: Standard tap/scroll interactions only (no swipe gestures)
- **Fast loading**: Optimize for mobile network conditions

### Desktop Experience

**Mobile-First Responsive Strategy:**
- **Foundation**: Mobile design and functionality remain unchanged
- **Enhancements Only**: Add responsive improvements without breaking mobile experience
- **Centered Layouts**: Center content with max-width constraints for better readability
- **Multi-Column Grids**: Use CSS Grid/Flexbox to show multiple cards side-by-side when space allows
- **Preserve Mobile UX**: Keep mobile navigation, touch targets, and interaction patterns
- **No Desktop-Specific Features**: Never add features that don't work on mobile

**Responsive Breakpoints Strategy:**
- **Base (default)**: 0px+ Mobile-first design (375px-768px optimal)
- **Tablet**: 768px+ Light adaptations (iPad, larger phones landscape)
- **Desktop**: 1024px+ Enhanced layouts (laptops, desktops)
- **Large Desktop**: 1440px+ Optimized for large screens

**Desktop Adaptations Guidelines:**
- **Max-width containers**: Prevent content from stretching too wide (max-w-6xl, max-w-4xl)
- **Grid improvements**: Transform single-column mobile layouts to 2-3 column grids
- **Spacing adjustments**: Increase padding and margins for better visual breathing
- **Typography scaling**: Slightly larger headings and improved line-height
- **Keep mobile navigation**: Bottom tab bar remains, no desktop-style top navigation
- **Maintain touch targets**: 44px minimum touch targets even on desktop

### shadcn/ui Component Selection

**Mobile-Optimized Components Priority:**
- **Sheets/Drawers** over Dialogs for better mobile UX
- **Bottom sheets** for forms and detailed views
- **Mobile-friendly date pickers** and selectors
- **Touch-optimized dropdowns** and menus
- **Large, clear buttons** with proper touch targets

**Components to Avoid or Modify:**
- Complex data tables (use cards/lists instead)
- Hover-dependent interactions
- Small click targets or nested menus
- Desktop-style tooltips or popovers

### IMPORTANT: shadcn/ui Component Installation

**ALWAYS use the shadcn CLI to install UI components. NEVER create them manually.**

```bash
npx shadcn@latest add [component-name]
```

This ensures consistency, proper dependencies, and correct configuration according to the project's components.json.

**MANDATORY: shadcn/ui Components Usage**
- **Use shadcn/ui components for ALL UI elements** whenever possible
- **Prioritize shadcn/ui over custom components** for buttons, forms, cards, dialogs, etc.
- **Only create custom components** when shadcn/ui doesn't provide the needed functionality
- **Always check shadcn/ui library first** before writing custom UI code
- **Maintain design consistency** by using the shadcn/ui design system throughout the application

## Working Holiday Visa 417 - Business Context

### Application Purpose

Grant Me 417 helps Working Holiday Visa (WHV) 417 holders track their "specified work" to qualify for visa extensions. The name represents "Grant Me" - referring to getting your visa granted - with "417" explicitly referencing the Working Holiday Visa subclass 417.

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

Grant Me 417 serves **international backpackers** (not Australian citizens) who hold Working Holiday Visas and come to work in Australia.

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

**MANDATORY: The use of Bulletproof React patterns is REQUIRED for EVERY user request involving code.**

**IMPORTANT: Before ANY code modification, you MUST consult the local Bulletproof React repository:**
```
C:\Users\thiba\Documents\bulletproof-react
```

This project strictly follows the principles from [Bulletproof React](https://github.com/alan2207/bulletproof-react) for building scalable and maintainable React applications.

**REQUIRED steps before EACH code modification:**
1. **MUST** check documentation in `C:\Users\thiba\Documents\bulletproof-react\docs\`
2. **MUST** review examples in `C:\Users\thiba\Documents\bulletproof-react\src\`
3. **MUST** examine feature structure in `C:\Users\thiba\Documents\bulletproof-react\src\features\`
4. **MUST** study code patterns in existing components and hooks
5. **MUST** follow the architecture and conventions from the reference repository

**Core principles (MANDATORY to follow):**
- Feature-based architecture (not file-type based)
- Unidirectional code flow: shared → features → app
- Colocation: keep related code together
- Type Safety with TypeScript
- Tests alongside features
- Performance patterns by default
