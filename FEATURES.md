# Grant Me 417 - Functional Specifications

## Application Overview

Grant Me 417 is a "specified work" hours tracking application for Working Holiday Visa 417 holders in Australia. The application helps backpackers calculate and track their progress towards eligibility for their 2nd or 3rd visa.

## Navigation Architecture

**Migration**: `/dashboard` → `/app`

**5 main tabs** with mobile-first navigation (bottom tabs):
- **Overview** (`/app/overview`) - Overview and progress
- **Add Hours** (`/app/add-hours`) - Work hours entry
- **Employers** (`/app/employers`) - Employer management
- **Visas** (`/app/visas`) - Multiple visa management
- **Profile** (`/app/profile`) - User settings

## Detailed Specifications by Tab

### 1. Overview (`/app/overview`)

**Main Features**:
- **Visa selector** (dropdown in top left)
  - Format: "2nd WHV (Current)" with check icon
  - Allows switching between all user visas
  - Displayed even with single visa
  
- **Progress charts** (2 main charts):
  1. **Specified days**: Classic progress bar
     - Format: X/88 days (2nd visa) or X/179 days (3rd visa)
     - Percentage displayed
  2. **Visa duration**: Classic progress bar
     - Format: X/365 days since arrival
     - Conversion to days since visa start

- **Eligibility status**:
  - Clear indication if goal is reached
  - Success notification when user reaches their goal

### 2. Add Hours (`/app/add-hours`)

**Entry modes** (2 options in form):

**Mode 1: By day**
- Date selection via calendar
- Multiple dates added before submission
- Hours entry for each date
- User can accumulate multiple entries before validation

**Mode 2: By week**
- Select a week of the year
- Enter total hours for the week
- **Processing**: Creates 7 automatic entries (hours/7 per day)
- Example: 35h/week → 7 entries of 5h each

**Real-time validation**:
- Maximum 24h per day (Zod)
- Data verification before sending
- Instant error messages

**User feedback**:
- Success messages via Sonner (shadcn/ui)
- Confirmation after successful addition

**Interface**:
- Form in bottom sheet (mobile-first)
- Actions via modals

### 3. Employers (`/app/employers`)

**Current features**:
- **Add employers** via form
- **Required fields**:
  - Employer name
  - Industry (predefined enum)
  - Postcode (optional, 4-digit validation)
  
**Eligibility status**:
- **Currently**: All employers are eligible by default
- **Future**: Automatic validation (industry + postcode)
- **Manual override**: Ability to force eligibility

**Interface**:
- Employer list
- Addition via bottom sheet/modal
- No edit/delete functionality for now

### 4. Visas (`/app/visas`) - New tab

**Multiple visa management**:
- **Add new visas** (1st, 2nd, 3rd WHV)
- **Edit existing visas**
- **Delete visas**
- **Fields**:
  - Visa type (first_whv, second_whv, third_whv)
  - Arrival date
  - End date (automatically calculated: +1 year)
  - Required days (auto-defined by type)

**Business validation**:
- No visa overlap
- Logical progression (1st → 2nd → 3rd)
- Date validation

### 5. Profile (`/app/profile`)

**User settings**:
- **First name** (editable)
- **Nationality** (ISO 3166-1 alpha-2)
- **Site language** (English only for now)
- **Theme** (light/dark)

**Not included for now**:
- Visa management (dedicated tab)
- Progress history
- Data export

## Technical Architecture

### Supabase Database

**Main tables**:
- `user_profiles` - User profiles
- `user_visas` - Multi-visa management with automatic calculations
- `employers` - Employers with industry classification
- `work_entries` - Daily work entries

**Advanced features**:
- **Automatic triggers** for progress updates
- **Generated columns** (percentages, remaining days, eligibility)
- **Integrated business validation** (ages, nationalities, overlaps)
- **UK exemption** (no specified work required since July 2024)

### Validation and Security

**Zod for validation**:
- Client-side validation before Supabase sending
- Reusable schemas by feature
- Consistent error messages

**Row Level Security (RLS)**:
- Supabase policies enabled on all tables
- Data isolation by user

## Mobile-First UX/UI

**Interface patterns**:
- **Navigation**: Bottom tabs
- **Forms**: Bottom sheets for input
- **Actions**: Modals for confirmations/edits
- **Feedback**: Sonner (shadcn/ui) for notifications

**shadcn/ui Components**:
- Installation via CLI (`npx shadcn@latest add [component]`)
- Consistent theme with CSS variables
- Built-in accessibility

## Future States (not implemented)

**Planned features but not priority**:
- Display/edit/delete work_entries
- History and calendar of worked days
- Statistics by employer
- Automatic eligibility validation (industry + postcode)
- Weekly/monthly summaries
- Data export
- Additional languages

## Development Notes

- **Architecture**: Feature-based according to Bulletproof React
- **State**: Contexts for auth/visa, local useState, no React Query initially
- **Forms**: React Hook Form + Zod mandatory
- **Mobile-first**: Mobile design priority, responsive desktop as complement