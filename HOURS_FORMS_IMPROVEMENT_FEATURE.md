# HOURS FORMS IMPROVEMENT - Feature Specification

## 1. Overview

### Objective
Improve the existing week-based hours entry form with better navigation, flexible auto-distribution, dirty state tracking, and proper deletion handling.

### Summary
This feature improves the HOURS_FORMS_REFACTOR implementation with:
- Quick week navigation via calendar picker
- More prominent prev/next week arrows
- Auto-distribute to user-selected days (not just Mon-Fri)
- Dirty state tracking to enable/disable Save button intelligently
- Reset to initial values functionality
- Delete work entries when hours set to 0
- Fix duplicate notification bug

### Tech Stack
- **Frontend**: React 19.1.1, TypeScript, TailwindCSS 4.1.12
- **State Management**: TanStack React Query 5.90.5
- **UI Components**: Shadcn UI (Calendar, Popover, Checkbox)
- **Validation**: Zod schemas
- **Date Handling**: date-fns

---

## 2. Context and Motivation

### Current Problems

1. **Limited Week Navigation**
   - Only prev/next arrows available
   - No quick way to jump to a specific month/year
   - Arrows not prominent enough

2. **Rigid Auto-Distribution**
   - Only distributes to Mon-Fri (hardcoded)
   - Users can't choose which days to include
   - Max hours limit doesn't adapt to selected days

3. **No Dirty State Tracking**
   - Save button always enabled if form has hours > 0
   - No way to know if data changed from database
   - Can't submit all zeros to delete entries

4. **No Reset Functionality**
   - Users can't easily revert to initial values
   - Must manually clear each field

5. **Duplicate Notifications Bug**
   - Two toasts appear when saving hours:
     - "Hours saved for Mon 5 Jan - Sun 11 Jan 2026"
     - "Successfully updated 5 work entries"

6. **Zero Hours Don't Delete**
   - Setting 0 hours just doesn't save that day
   - Should delete existing work entry from database

### New Design Benefits

1. **Quick Navigation** - Calendar picker for instant week selection
2. **Flexible Distribution** - Choose any days for auto-distribute
3. **Smart Save Button** - Only enabled when changes exist
4. **Easy Reset** - One-click return to initial values
5. **Clean Feedback** - Single, informative notification
6. **Proper Deletion** - Zero hours removes database entry

---

## 3. Functional Specifications

### 3.1 Week Navigation Enhancement

#### Current UI
```
┌─────────────────────────────────────────────┐
│  [<]   Mon 6 Jan - Sun 12 Jan 2025   [>]    │
└─────────────────────────────────────────────┘
```

#### New UI
```
┌─────────────────────────────────────────────────────────┐
│  [◀ PREV]   📅 Mon 6 Jan - Sun 12 Jan 2025   [NEXT ▶]  │
│              ↑ Click to open calendar picker            │
└─────────────────────────────────────────────────────────┘
```

**Behavior**:
- Clicking the date range opens a Calendar popover
- Calendar allows selecting any past or complete week
- Arrows are larger with text labels and primary color
- "Today" indicator in calendar for quick reference
- Weeks not yet complete (Friday hasn't passed) are disabled

### 3.2 Auto-Distribute with Day Selection

#### Current Behavior
- Toggle enables auto-distribute
- Hours distributed evenly to Mon-Fri only
- Sat-Sun always set to 0

#### New Behavior
- Checkbox in each day column header
- Default: Mon-Fri checked (preserves current behavior)
- User can check/uncheck any day
- Distribution formula: `totalHours / selectedDaysCount`
- Max hours limit: `24h × selectedDaysCount`

#### New UI (Grid with Checkboxes)
```
┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────┬───────┐
│EMPLOYER │ ☑ Mon    │ ☑ Tue    │ ☑ Wed    │ ☑ Thu    │ ☑ Fri    │ ☐ Sat    │ ☐ Sun    │ Total │ Reset │
│         │  6 Jan   │  7 Jan   │  8 Jan   │  9 Jan   │ 10 Jan   │ 11 Jan   │ 12 Jan   │       │       │
├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────┼───────┤
│ ABC Pty │ [8:00]   │ [8:00]   │ [8:00]   │ [8:00]   │ [8:00]   │ [____]   │ [____]   │ 40:00 │  [↺]  │
└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────┴───────┘

☑ Auto-distribute total hours     Total: [40] hours     → 8h/day (5 days selected)
```

**Rules**:
- Unchecked days are cleared when auto-distribute is active
- Checked days receive equal hours
- Cannot uncheck a day if it would cause hours/day > 24h
- When manually editing a day, auto-distribute turns off

### 3.3 Save Button State Management

#### Current Logic
```typescript
canSubmit = employerId && !isSubmitting && noErrors && computedTotal > 0 && computedTotal <= 168 && weekComplete
```

#### New Logic
```typescript
canSubmit = employerId && !isSubmitting && noErrors && isDirty && computedTotal <= 168 && weekComplete
```

**Key Change**: Replace `computedTotal > 0` with `isDirty`

**isDirty Definition**:
```typescript
isDirty = currentDailyHours differs from initialHoursFromDB
```

**Examples**:
| Scenario | isDirty | canSubmit |
|----------|---------|-----------|
| Form loaded, no changes | false | false |
| User entered hours | true | true |
| User set all hours to 0 (different from DB) | true | true |
| User reverted to original DB values | false | false |
| DB was empty, form is empty | false | false |

### 3.4 Reset to Initial Values

**Location**: Reset button (↺ icon) after Total column in grid

**Behavior**:
- Clicking Reset reverts all daily hours to initial values
- Initial values = values fetched from database OR 0 if no data
- Also resets auto-distribute and totalHours state
- No confirmation dialog (quick action)

### 3.5 Duplicate Notification Fix

**Current Behavior** (BUG):
1. `week-hours-form.tsx:76` shows: "Hours saved for Mon 5 Jan - Sun 11 Jan 2026"
2. `use-hours.ts:185-186` shows: "Successfully updated 5 work entries"

**Fix**:
- Remove toast from `useAddWorkEntriesWithOverwrite` onSuccess
- Keep toast in `week-hours-form.tsx` (more informative with date range)

### 3.6 Delete Work Entry on Zero Hours

**Current Behavior**:
- Setting 0 hours for a day = day not included in save
- Existing DB entry remains

**New Behavior**:
- Setting 0 hours for a day = delete that DB entry
- Submit sends: entries to upsert + dates to delete

**API Change**:
```typescript
// New API function
async function saveWeekHours(userId, employerId, weekEntries) {
  // weekEntries: Array<{ dateKey: string, hours: number }>

  // Separate into upsert and delete operations
  const toUpsert = weekEntries.filter(e => e.hours > 0);
  const toDelete = weekEntries.filter(e => e.hours === 0 && existsInDB(e.dateKey));

  // Execute delete first
  if (toDelete.length > 0) {
    await supabase.from('work_entries')
      .delete()
      .eq('employer_id', employerId)
      .in('work_date', toDelete.map(e => e.dateKey));
  }

  // Then upsert
  if (toUpsert.length > 0) {
    await addWorkEntriesWithOverwrite(userId, employerId, toUpsert);
  }

  return { deleted: toDelete.length, saved: toUpsert.length };
}
```

### 3.7 Edge Cases

| Scenario | Behavior |
|----------|----------|
| All days set to 0, DB had data | Submit enabled (isDirty=true), deletes all entries |
| All days set to 0, DB was empty | Submit disabled (isDirty=false) |
| Select only 1 day for auto-distribute | Max 24h total, distributed to that day |
| Select 7 days for auto-distribute | Max 168h total (24h × 7) |
| Uncheck day while hours > 24h/remaining days | Show error, prevent uncheck |
| Navigate to different week | Reset form, load that week's data |
| Calendar select incomplete week | Disabled in calendar |

---

## 4. Technical Architecture

### 4.1 Files to Modify

```
src/features/hours/
├── api/
│   ├── hours.ts                    # Add saveWeekHours function
│   └── use-hours.ts                # Add useSaveWeekHours hook, remove toast
├── components/
│   ├── week-navigator.tsx          # Add Calendar popover, prominent arrows
│   ├── week-hours-grid.tsx         # Add day checkboxes, Reset button
│   ├── auto-distribute-toggle.tsx  # Add selected days info display
│   └── week-hours-form.tsx         # Adapt to new props/state
├── hooks/
│   └── use-week-form-state.ts      # Add initialHours, isDirty, selectedDays
└── types/
    └── week-form.ts                # Add new types
```

### 4.2 No Database Changes

The existing `work_entries` table supports all requirements:
- Upsert via unique constraint `(user_id, employer_id, work_date)`
- Delete via standard DELETE query
- RLS policies already in place

### 4.3 Type Changes

```typescript
// types/week-form.ts additions

export type WeekFormState = {
  currentWeek: Date;
  dailyHours: Record<string, string>;
  autoDistribute: boolean;
  totalHours: string;
  isSubmitting: boolean;
  errors: Record<string, string>;
  // NEW
  selectedDays: Record<string, boolean>;  // { '2025-01-06': true, ... }
  initialHours: Record<string, number>;   // Values from DB for comparison
};

export type WeekFormActions = {
  setWeek: (date: Date) => void;
  setDayHours: (dateKey: string, hours: string) => void;
  setAutoDistribute: (enabled: boolean) => void;
  setTotalHours: (hours: string) => void;
  reset: () => void;
  prefillFromExisting: (hoursByDate: Record<string, number>) => void;
  // NEW
  setDaySelected: (dateKey: string, selected: boolean) => void;
  resetToInitial: () => void;  // Reset to DB values or 0
};

export type UseWeekFormStateExtendedReturn = {
  // ... existing
  isDirty: boolean;           // NEW: has changes from initial
  selectedDaysCount: number;  // NEW: count of checked days
  maxTotalHours: number;      // NEW: 24 * selectedDaysCount
};
```

---

## 5. Frontend Implementation

### Phase 1: Types & State Foundation

- [ ] Update `types/week-form.ts` with new types
  - Add `selectedDays: Record<string, boolean>` to WeekFormState
  - Add `initialHours: Record<string, number>` to WeekFormState
  - Add `setDaySelected` action
  - Add `resetToInitial` action
  - Add `isDirty`, `selectedDaysCount`, `maxTotalHours` to return type

- [ ] Update `use-week-form-state.ts` foundation
  - Add `selectedDays` state (default: Mon-Fri = true, Sat-Sun = false)
  - Add `initialHours` state (populated from DB fetch)
  - Compute `isDirty` by comparing `dailyHours` to `initialHours`
  - Compute `selectedDaysCount` from `selectedDays`
  - Compute `maxTotalHours` as `24 * selectedDaysCount`

### Phase 2: Dirty State & canSubmit Logic

- [ ] Implement `isDirty` computation in `use-week-form-state.ts`
  ```typescript
  const isDirty = useMemo(() => {
    const dateKeys = Object.keys(state.dailyHours);
    return dateKeys.some(key => {
      const current = parseFloat(state.dailyHours[key] || '0');
      const initial = state.initialHours[key] || 0;
      return current !== initial;
    });
  }, [state.dailyHours, state.initialHours]);
  ```

- [ ] Update `canSubmit` logic
  - Remove `computedTotal > 0` check
  - Add `isDirty` check
  - Keep `computedTotal <= MAX_HOURS_PER_WEEK` check

- [ ] Update pre-fill effect to populate `initialHours`
  - When data loaded from DB, store in `initialHours`
  - Use for `isDirty` comparison

### Phase 3: Selected Days & Auto-Distribute Enhancement

- [ ] Add `setDaySelected` action
  - Update `selectedDays[dateKey]` state
  - Validate: if unchecking would cause hours/day > 24h, show error
  - When auto-distribute active, redistribute after day selection change

- [ ] Update `distributeHoursAcrossWeekdays` function
  - Rename to `distributeHoursAcrossSelectedDays`
  - Accept `selectedDays` parameter instead of hardcoded Mon-Fri
  - Calculate `hoursPerDay = totalHours / selectedDaysCount`
  - Only set hours for selected days, clear others

- [ ] Update `setAutoDistribute` and `setTotalHours`
  - Use `selectedDays` instead of hardcoded indices
  - Validate against `maxTotalHours` (24 × selectedDaysCount)

### Phase 4: Reset Functionality

- [ ] Add `resetToInitial` action
  - Reset `dailyHours` to `initialHours` values
  - Reset `autoDistribute` to false
  - Reset `totalHours` to ''
  - Reset `selectedDays` to default (Mon-Fri true)
  - Clear all `errors`

- [ ] Expose `resetToInitial` in actions object

### Phase 5: API & Notification Fix

- [ ] Update `hours.ts` - Add `saveWeekHours` function
  ```typescript
  export const saveWeekHours = async (
    userId: string,
    employerId: string,
    weekEntries: Array<{ work_date: string; hours: number }>,
    existingDates: string[]  // dates that exist in DB for this week
  ) => {
    const toUpsert = weekEntries.filter(e => e.hours > 0);
    const toDelete = weekEntries
      .filter(e => e.hours === 0)
      .filter(e => existingDates.includes(e.work_date));

    // Delete entries with 0 hours
    if (toDelete.length > 0) {
      await supabase
        .from('work_entries')
        .delete()
        .eq('employer_id', employerId)
        .in('work_date', toDelete.map(e => e.work_date));
    }

    // Upsert entries with hours > 0
    if (toUpsert.length > 0) {
      const entries = toUpsert.map(e => ({
        user_id: userId,
        employer_id: employerId,
        work_date: e.work_date,
        hours: e.hours,
      }));

      await supabase
        .from('work_entries')
        .upsert(entries, { onConflict: 'user_id,employer_id,work_date' });
    }

    return { deleted: toDelete.length, saved: toUpsert.length };
  };
  ```

- [ ] Update `use-hours.ts` - Add `useSaveWeekHours` hook
  - Similar to `useAddWorkEntriesWithOverwrite` but uses new function
  - **Remove toast from onSuccess** (fix duplicate notification)
  - Only invalidate queries on success

- [ ] Update `use-week-form-state.ts` submit function
  - Use new `useSaveWeekHours` mutation
  - Transform all dailyHours (including 0s) for proper deletion
  - Pass existing dates from `initialHours` for deletion logic

### Phase 6: Week Navigator Enhancement

- [ ] Update `week-navigator.tsx`
  - Add `Popover` + `Calendar` component from Shadcn
  - Make date range clickable to open popover
  - Style arrows: larger, primary color, add "Prev"/"Next" text
  - Add `onSelectWeek: (date: Date) => void` prop

- [ ] Calendar configuration
  - Disable future incomplete weeks (Friday not passed)
  - Highlight current week
  - Show "today" indicator

### Phase 7: Week Hours Grid Enhancement

- [ ] Update `week-hours-grid.tsx` header
  - Add `Checkbox` in each day column header
  - Checkbox state from `selectedDays` prop
  - onChange calls `onDaySelectedChange` prop

- [ ] Add Reset button after Total column
  - Icon button with ↺ (RotateCcw icon)
  - Calls `onReset` prop
  - Tooltip: "Reset to initial values"
  - Only visible when `isDirty` is true

- [ ] Add new props
  ```typescript
  interface WeekHoursGridProps {
    // ... existing
    selectedDays: Record<string, boolean>;
    onDaySelectedChange: (dateKey: string, selected: boolean) => void;
    onReset: () => void;
    isDirty: boolean;
  }
  ```

### Phase 8: Auto-Distribute Toggle Update

- [ ] Update `auto-distribute-toggle.tsx`
  - Show selected days count: "→ {hours}h/day ({count} days selected)"
  - Show max hours warning if total exceeds limit
  - Add `selectedDaysCount` and `maxTotalHours` props

### Phase 9: Week Hours Form Integration

- [ ] Update `week-hours-form.tsx`
  - Pass new props to child components
  - Wire up `onDaySelectedChange` to actions
  - Wire up `onReset` to `actions.resetToInitial`
  - Wire up `onSelectWeek` to `actions.setWeek`

### Phase 10: Testing & Polish

- [ ] Manual testing scenarios
  - Week navigation via calendar
  - Week navigation via arrows
  - Auto-distribute with various day selections
  - Save button state with various dirty scenarios
  - Reset functionality
  - Delete via 0 hours
  - Single notification on save

- [ ] Edge case testing
  - All days 0 with existing DB data → should submit and delete
  - All days 0 with no DB data → should not submit
  - 1 day selected with 30h → should show error
  - Uncheck day that would exceed 24h/day → should prevent

---

## 6. Execution Plan

### Phase 1: Types & State Foundation
- [x] Update `types/week-form.ts` with new types
- [x] Add `selectedDays` state to hook
- [x] Add `initialHours` state to hook

### Phase 2: Dirty State & canSubmit Logic
- [x] Implement `isDirty` computation
- [x] Update `canSubmit` logic
- [x] Update pre-fill effect for `initialHours`

### Phase 3: Selected Days & Auto-Distribute
- [x] Add `setDaySelected` action
- [x] Update distribution function for selected days
- [x] Update validation for selected days count

### Phase 4: Reset Functionality
- [x] Add `resetToInitial` action
- [x] Expose in actions object

### Phase 5: API & Notification Fix
- [x] Add `saveWeekHours` API function
- [x] Add `useSaveWeekHours` hook
- [x] Remove duplicate toast
- [x] Update submit to handle deletions

### Phase 6: Week Navigator Enhancement
- [x] Add Calendar popover
- [x] Style prominent arrows
- [x] Add week selection callback

### Phase 7: Week Hours Grid Enhancement
- [x] Add day selection checkboxes
- [x] Add Reset button
- [x] Update props interface

### Phase 8: Auto-Distribute Toggle Update
- [x] Show selected days info
- [x] Add max hours warning

### Phase 9: Week Hours Form Integration
- [x] Wire up all new props
- [x] Test component composition

### Phase 10: Testing & Polish
- [x] Manual testing all scenarios
- [x] Edge case testing
- [x] Mobile responsiveness check

---

## 7. Important Notes

### Backward Compatibility
- Default behavior (Mon-Fri auto-distribute) unchanged
- Existing data in DB fully compatible
- No migration needed

### Performance
- `isDirty` computed via useMemo (only recalculates on state change)
- Calendar disabled dates computed once per render
- No additional API calls for dirty checking

### UX Considerations
- Reset button only visible when form is dirty
- Clear validation errors on day selection change
- Instant feedback on auto-distribute calculations
- Single toast notification for cleaner feedback

### Security
- RLS policies ensure users only access their own data
- No changes to security model

---

## 8. Commands to Execute

After this spec is approved, execute:

```bash
# All phases
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=1-10
```

Or phase by phase:
```bash
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=1   # Types & State
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=2   # Dirty State
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=3   # Selected Days
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=4   # Reset
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=5   # API Fix
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=6   # Navigator
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=7   # Grid
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=8   # Toggle
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=9   # Integration
/dev spec=HOURS_FORMS_IMPROVEMENT_FEATURE.md phase=10  # Testing
```
