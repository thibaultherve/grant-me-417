# HOURS FORMS REFACTOR - Feature Specification

## 1. Overview

### Objective
Refactor the hours entry system from two separate forms (by-day and by-week) into a single unified week-based form with improved UX, following the provided mockup design.

### Summary
Replace the existing complex dual-form system with a clean, intuitive week-based hours entry interface featuring:
- Week navigation (prev/next arrows showing date range)
- 7-day grid layout (Monday to Sunday)
- Pre-filled data from existing entries
- Auto-distribute feature (total hours spread across days)
- Single employer per form session
- Explicit save button

### Tech Stack
- **Frontend**: React 19.1.1, TypeScript, TailwindCSS 4.1.12
- **State Management**: TanStack React Query 5.90.5
- **UI Components**: Shadcn UI
- **Validation**: Zod schemas
- **Date Handling**: date-fns

---

## 2. Context and Motivation

### Current Problems

1. **UX Confusion**
   - Users must choose "by day" or "by week" mode upfront
   - Two different interfaces for the same task
   - Mode switching is unintuitive

2. **Code Duplication**
   - `ByDayForm` (200+ lines) and `ByWeekForm` (300+ lines) share significant logic
   - Duplicate validation, state management, and submission handling
   - Industry labels hardcoded in 4+ files

3. **Complex State Management**
   - `ByWeekForm` has 15+ state variables
   - Uses refs (`isPrefillingRef`, `lastPrefilledValueRef`) for edge case handling
   - Difficult to maintain and extend

4. **Inconsistent Data Entry**
   - By-day: Calendar picker + individual entry cards
   - By-week: Week picker + day checkboxes + total distribution
   - Different mental models for the same operation

### New Design Benefits

1. **Single Interface** - One form handles all use cases
2. **Always Week Context** - Users see full week at a glance
3. **Intuitive Navigation** - Simple prev/next arrows
4. **Pre-filled Data** - Existing hours shown automatically
5. **Flexible Entry** - Manual per-day OR auto-distribute total
6. **Cleaner Code** - Consolidated state, reusable components

---

## 3. Functional Specifications

### 3.1 User Flow

```
1. User navigates to Hours page
2. User selects an employer (prerequisite)
3. Week form appears showing current week (Mon-Sun)
4. User can:
   a. Navigate to different weeks (prev/next arrows)
   b. Enter hours for each day manually
   c. OR check "Auto-distribute" and enter total hours
5. User clicks "Save Hours"
6. System saves entries (overwrites existing if any)
7. Success toast, form remains on same week (allows quick editing)
```

### 3.2 UI Components

#### Week Navigator
```
┌────────────────────────────────────────────┐
│  [<]   Mon 15 Apr - Sun 21 Apr 2024   [>]  │
└────────────────────────────────────────────┘
```
- Left arrow: Go to previous week
- Right arrow: Go to next week (disabled if next week is future/incomplete)
- Date range: Shows Monday to Sunday of selected week

#### Week Hours Grid
```
┌─────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬───────┐
│ EMPLOYER│  Mon   │  Tue   │  Wed   │  Thu   │  Fri   │  Sat   │  Sun   │ Total │
│         │ 15 Apr │ 16 Apr │ 17 Apr │ 18 Apr │ 19 Apr │ 20 Apr │ 21 Apr │       │
├─────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼───────┤
│ ABC Pty │ [8:00] │ [8:00] │ [8:00] │ [8:00] │ [8:00] │ [0:00] │ [0:00] │ 40:00 │
└─────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴───────┘
```
- First column: Employer name (read-only, selected before form)
- Day columns: Input fields for hours (HH:MM or decimal format)
- Last column: Auto-calculated total

#### Auto-Distribute Section
```
┌──────────────────────────────────────────────────────────────┐
│  ☐ Auto-distribute total hours     Total: [_______] hours   │
└──────────────────────────────────────────────────────────────┘
```
- When unchecked: User enters hours per day manually
- When checked: User enters total, system distributes to weekdays (Mon-Fri)
- Distribution formula: `total / 5` spread to Mon-Fri, Sat-Sun = 0

#### Action Buttons
```
┌────────────────────────────────────────┐
│                    [Cancel] [Save Hours]│
└────────────────────────────────────────┘
```
- Cancel: Close form / return to employer selection
- Save Hours: Submit all entries for the week

### 3.3 Business Rules

#### Week Selection
- **Current week available if Friday has passed** (existing rule from `isWeekComplete()`)
- **Future incomplete weeks are disabled** in navigation
- **Past weeks always available** for editing

#### Hours Validation
- **Per day**: 0 to 24 hours maximum
- **Per week**: 0 to 168 hours maximum (7 × 24)
- **Format**: Accepts both `8:30` (time) and `8.5` (decimal)
- **Conversion**: Time format auto-converts to decimal for storage

#### Data Handling
- **Pre-fill**: When navigating to a week with existing data, inputs are populated
- **Overwrite**: Saving always overwrites existing entries for that week/employer
- **No confirmation dialog**: Single employer context, user expects to edit

#### Auto-Distribute Logic
- **Days included**: Monday to Friday by default (5 days)
- **Distribution**: `total_hours / 5`, rounded to 2 decimal places
- **Saturday/Sunday**: Set to 0 when auto-distribute is active
- **Manual override**: Unchecking auto-distribute preserves distributed values

### 3.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No employer selected | Show employer selector first |
| Week has partial data | Pre-fill existing, allow edits |
| Navigate to future week | Disabled if Friday hasn't passed |
| Enter > 24h for a day | Show validation error, prevent submit |
| Enter > 168h total | Show validation error, prevent submit |
| Auto-distribute with 0 total | All days set to 0 |
| Network error on save | Show error toast, keep form data |

### 3.5 Success/Error Feedback

| Event | Feedback |
|-------|----------|
| Save success | Toast: "Hours saved for [week range]" |
| Save error | Toast: "Failed to save hours. Please try again." |
| Validation error | Inline error message under invalid field |
| Invalid time format | Inline hint: "Use 8:30 or 8.5 format" |

---

## 4. Technical Architecture

### 4.1 Files to Create

```
src/features/hours/
├── components/
│   ├── week-hours-form.tsx          # Main form container
│   ├── week-navigator.tsx           # Week prev/next navigation
│   ├── week-hours-grid.tsx          # Table with 7 day columns
│   ├── day-hours-cell.tsx           # Individual day input cell
│   └── auto-distribute-toggle.tsx   # Checkbox + total input
├── hooks/
│   └── use-week-form-state.ts       # Consolidated form state hook
└── types/
    └── week-form.ts                 # New types for week form
```

### 4.2 Files to Modify

```
src/features/hours/
├── components/
│   └── add-hours-form.tsx           # Remove mode toggle, simplify to use WeekHoursForm
└── utils/
    └── week-calculations.ts         # May need minor additions
```

### 4.3 Files to Delete

```
src/features/hours/
├── components/
│   ├── by-day-form.tsx              # Replaced by WeekHoursForm
│   └── by-week-form.tsx             # Replaced by WeekHoursForm
```

### 4.4 Existing Code to Reuse

| File | Functions/Components |
|------|---------------------|
| `date-helpers.ts` | `getWeekDates()`, `getWeekRange()`, `getMondayOfWeek()`, `formatDateKey()` |
| `week-calculations.ts` | `calculateHoursPerDay()`, `getWeekHoursData()`, `MAX_HOURS_PER_DAY`, `MAX_HOURS_PER_WEEK` |
| `hours-validation.ts` | `validateHours()`, `timeToDecimal()`, `decimalToTime()`, `formatDecimalHours()` |
| `week-validation.ts` | `isWeekComplete()`, `validateTotalHours()` |
| `use-hours.ts` | `useEmployerHours()`, `useAddWorkEntriesWithOverwrite()` |
| `hours-input.tsx` | `HoursInput` component (may refactor into cells) |

### 4.5 New Types

```typescript
// src/features/hours/types/week-form.ts

export interface WeekFormState {
  currentWeek: Date;                    // Monday of selected week
  dailyHours: Record<string, string>;   // { '2024-04-15': '8:00', ... }
  autoDistribute: boolean;              // Checkbox state
  totalHours: string;                   // Total input value
  isSubmitting: boolean;                // Form submission state
  errors: Record<string, string>;       // { '2024-04-15': 'Max 24h', total: 'Max 168h' }
}

export interface WeekFormActions {
  setWeek: (date: Date) => void;
  setDayHours: (dateKey: string, hours: string) => void;
  setAutoDistribute: (enabled: boolean) => void;
  setTotalHours: (hours: string) => void;
  reset: () => void;
  prefillFromExisting: (hoursByDate: Record<string, number>) => void;
}

export interface DayColumn {
  dateKey: string;                      // '2024-04-15'
  date: Date;
  dayName: string;                      // 'Mon'
  dayNumber: string;                    // '15'
  monthName: string;                    // 'Apr'
}
```

---

## 5. Database

### No Schema Changes Required

The existing `work_entries` table supports all requirements:

```sql
-- Existing table structure (no changes)
CREATE TABLE work_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  employer_id UUID REFERENCES employers(id) NOT NULL,
  work_date DATE NOT NULL,
  hours NUMERIC CHECK (hours >= 0 AND hours <= 24) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, employer_id, work_date)
);
```

### RLS Policies (Already in Place)
- Users can only CRUD their own work entries
- No changes needed

---

## 6. Backend Implementation

### No Backend Changes Required

This is a frontend-only refactor. The existing API layer (`hours.ts`, `use-hours.ts`) provides all necessary functionality:

- `getEmployerHours(employerId)` - Fetch existing hours for pre-fill
- `addWorkEntriesWithOverwrite()` - Save entries (handles upsert logic)

---

## 7. Frontend Implementation

### Phase 1: Types & Utilities

**Create new types file:**
- [ ] Create `src/features/hours/types/week-form.ts`
- [ ] Define `WeekFormState` interface
- [ ] Define `WeekFormActions` interface
- [ ] Define `DayColumn` interface
- [ ] Export all types from `types/index.ts`

**Utility enhancements (if needed):**
- [ ] Verify `getWeekDates()` returns correct 7-day array
- [ ] Verify `calculateHoursPerDay()` handles edge cases

### Phase 2: Custom Hook

**Create state management hook:**
- [ ] Create `src/features/hours/hooks/use-week-form-state.ts`
- [ ] Implement `useWeekFormState(employerId, initialWeek)` hook
- [ ] Handle week navigation (prev/next)
- [ ] Handle daily hours updates with validation
- [ ] Handle auto-distribute toggle and calculation
- [ ] Handle pre-fill from existing data via `useEmployerHours`
- [ ] Expose submission function that calls `useAddWorkEntriesWithOverwrite`

### Phase 3: Core Components

**Week Navigator:**
- [ ] Create `src/features/hours/components/week-navigator.tsx`
- [ ] Props: `currentWeek`, `onPrevWeek`, `onNextWeek`, `canGoNext`
- [ ] Display week range with `getWeekRange()`
- [ ] Left/right arrow buttons with Lucide icons
- [ ] Disable next if week is incomplete (`isWeekComplete`)

**Day Hours Cell:**
- [ ] Create `src/features/hours/components/day-hours-cell.tsx`
- [ ] Props: `dateKey`, `value`, `onChange`, `error`, `disabled`
- [ ] Reuse validation from `validateHours()`
- [ ] Show error state with red border
- [ ] Support HH:MM and decimal input

**Auto-Distribute Toggle:**
- [ ] Create `src/features/hours/components/auto-distribute-toggle.tsx`
- [ ] Props: `enabled`, `onToggle`, `totalHours`, `onTotalChange`, `error`
- [ ] Checkbox with label "Auto-distribute total hours"
- [ ] Total hours input (only enabled when checkbox is checked)

### Phase 4: Grid Component

**Week Hours Grid:**
- [x] Create `src/features/hours/components/week-hours-grid.tsx`
- [x] Props: `employerName`, `columns: DayColumn[]`, `dailyHours`, `onDayChange`, `errors`, `disabled`
- [x] Render table header with day names and dates
- [x] Render row with employer name and 7 `DayHoursCell` components
- [x] Calculate and display total in last column
- [x] Responsive design for mobile (horizontal scroll)

### Phase 5: Main Form Component

**Week Hours Form:**
- [x] Create `src/features/hours/components/week-hours-form.tsx`
- [x] Props: `employerId`, `employerName`, `onSuccess`, `onCancel`
- [x] Integrate `useWeekFormState` hook
- [x] Compose: `WeekNavigator` + `WeekHoursGrid` + `AutoDistributeToggle`
- [x] Add Cancel and Save buttons
- [x] Handle form submission with loading state
- [x] Show success/error toasts

### Phase 6: Integration & Cleanup

**Update AddHoursForm:**
- [x] Modify `src/features/hours/components/add-hours-form.tsx`
- [x] Remove mode toggle (by-day vs by-week)
- [x] Keep employer selection step (step 1)
- [x] Replace step 2 with `WeekHoursForm` component
- [x] Simplify overall flow

**Delete old components:**
- [x] Delete `src/features/hours/components/by-day-form.tsx`
- [x] Delete `src/features/hours/components/by-week-form.tsx`

**Update exports:**
- [x] No `index.ts` exists - no changes needed

### Phase 7: Testing & Polish

**Manual testing:**
- [ ] Test week navigation (prev/next)
- [ ] Test manual hours entry per day
- [ ] Test auto-distribute feature
- [ ] Test pre-fill with existing data
- [ ] Test validation (max 24h/day, max 168h/week)
- [ ] Test save functionality
- [ ] Test error handling (network errors)
- [ ] Test mobile responsiveness

**Edge case testing:**
- [ ] Empty week (no existing data)
- [ ] Partial week (some days have data)
- [ ] Full week (all days have data)
- [ ] Overwrite existing data
- [ ] Navigate between weeks with/without data

---

## 8. Execution Plan

### Phase 1: Types & Utilities (Foundation)
- [x] Create `week-form.ts` types file
- [x] Export types from `types/index.ts`
- [x] Verify existing utility functions work correctly

### Phase 2: Custom Hook (State Management)
- [x] Create `use-week-form-state.ts` hook
- [x] Implement week navigation logic
- [x] Implement daily hours management
- [x] Implement auto-distribute logic
- [x] Implement pre-fill logic
- [x] Implement submission logic

### Phase 3: Core Components (Building Blocks)
- [x] Create `week-navigator.tsx`
- [x] Create `day-hours-cell.tsx`
- [x] Create `auto-distribute-toggle.tsx`

### Phase 4: Grid Component (Layout)
- [x] Create `week-hours-grid.tsx`
- [x] Implement responsive table layout
- [x] Integrate `DayHoursCell` components
- [x] Add total calculation

### Phase 5: Main Form (Assembly)
- [x] Create `week-hours-form.tsx`
- [x] Compose all components
- [x] Add form actions (Cancel, Save)
- [x] Handle submission flow

### Phase 6: Integration & Cleanup
- [x] Update `add-hours-form.tsx`
- [x] Delete `by-day-form.tsx`
- [x] Delete `by-week-form.tsx`
- [x] No `index.ts` exists - no changes needed

### Phase 7: Testing & Polish
- [ ] Manual testing all scenarios
- [ ] Edge case testing
- [ ] Mobile responsiveness check
- [x] Final code review (TypeScript fixes applied, build passing)

---

## 9. Important Notes

### Compatibility
- Existing data in `work_entries` table is fully compatible
- No migration needed for existing users
- Form will correctly load and display existing hours

### Performance
- `useEmployerHours` fetches all employer hours once on mount
- Week navigation uses local state (no additional API calls)
- Only save triggers API call

### Security
- RLS policies ensure users can only access their own data
- No additional security considerations for this refactor

### Accessibility
- Inputs should have proper labels
- Arrow buttons should have aria-labels
- Error messages should be linked to inputs

### Mobile Considerations
- Table may need horizontal scroll on small screens
- Consider touch-friendly input sizes
- Week navigator arrows should be easily tappable

### Future Enhancements (Out of Scope)
- Multiple employer rows in same form
- Copy previous week functionality
- Keyboard navigation between cells
- Inline editing without explicit save

---

## 10. File Reference Summary

### Create (7 files)
| File | Purpose |
|------|---------|
| `types/week-form.ts` | New type definitions |
| `hooks/use-week-form-state.ts` | Consolidated state hook |
| `components/week-hours-form.tsx` | Main form container |
| `components/week-navigator.tsx` | Week navigation |
| `components/week-hours-grid.tsx` | Table layout |
| `components/day-hours-cell.tsx` | Individual cell input |
| `components/auto-distribute-toggle.tsx` | Checkbox + total |

### Modify (1 file)
| File | Changes |
|------|---------|
| `components/add-hours-form.tsx` | Remove mode toggle, use WeekHoursForm |

### Delete (2 files)
| File | Reason |
|------|--------|
| `components/by-day-form.tsx` | Replaced by WeekHoursForm |
| `components/by-week-form.tsx` | Replaced by WeekHoursForm |

---

## 11. Commands to Execute

After this spec is approved, execute:

```bash
# Frontend implementation (all phases)
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=1-7
```

Or phase by phase:
```bash
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=1   # Types & Utilities
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=2   # Custom Hook
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=3   # Core Components
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=4   # Grid Component
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=5   # Main Form
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=6   # Integration & Cleanup
/dev spec=HOURS_FORMS_REFACTOR_FEATURE.md phase=7   # Testing & Polish
```
