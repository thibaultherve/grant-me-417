# Edge Case Code Verification Report

**Feature:** Hours Forms Improvement (Phases 6-9)
**File:** `src/features/hours/hooks/use-week-form-state.ts`
**Date:** 2026-01-09

This document verifies that all edge cases specified in Phase 10 of the spec are properly handled in the code implementation.

---

## Edge Case 1: All Days 0 with Existing DB Data → Should Submit and Delete

**Requirement:** Form should allow submitting when all fields are set to 0/empty, IF the database had existing hours. This should delete all entries.

### Code Implementation Verification ✓

#### isDirty Computation (Lines 221-231)
```typescript
const isDirty = useMemo(() => {
  const dateKeys = Object.keys(state.dailyHours);
  return dateKeys.some((key) => {
    const currentStr = state.dailyHours[key] || '';
    const currentValue =
      currentStr.trim() === '' ? 0 : parseFloat(currentStr) || 0;
    const initialValue = state.initialHours[key] || 0;
    // Compare with small tolerance for floating point
    return Math.abs(currentValue - initialValue) > 0.001;
  });
}, [state.dailyHours, state.initialHours]);
```

**Analysis:**
- ✓ Compares current hours (0 when empty) to initial hours from DB
- ✓ If DB had hours (e.g., Monday=8) and user clears it (=0), isDirty becomes TRUE
- ✓ This enables the Save button

#### canSubmit Logic (Lines 244-271)
```typescript
const canSubmit = useMemo(() => {
  // Must have employer
  if (!employerId) return false;

  // Must not be submitting
  if (state.isSubmitting) return false;

  // Must have no errors
  if (Object.keys(state.errors).length > 0) return false;

  // Must have changes from initial state
  if (!isDirty) return false;  // ✓ Checks isDirty

  // Must not exceed max weekly hours
  if (computedTotal > MAX_HOURS_PER_WEEK) return false;

  // Week must be complete
  if (!isWeekComplete(state.currentWeek)) return false;

  return true;
}, [...]);
```

**Analysis:**
- ✓ Requires `isDirty` to be true
- ✓ When all days are 0 but DB had hours: isDirty=true → canSubmit=true → CAN SUBMIT

#### Submit Function (Lines 606-658)
```typescript
const submit = useCallback(async (): Promise<boolean> => {
  // ...

  // Transform ALL daily hours (including zeros) for proper deletion support
  const weekEntries: Array<{ work_date: string; hours: number }> = [];

  Object.entries(state.dailyHours).forEach(([dateKey, hoursStr]) => {
    const validation = validateHours(hoursStr || '0', MAX_HOURS_PER_DAY);
    const hours = validation.decimalValue || 0;
    weekEntries.push({
      work_date: dateKey,
      hours: hours,  // ✓ Includes zeros
    });
  });

  // Get existing dates from initialHours for deletion logic
  const existingDates = Object.entries(state.initialHours)
    .filter(([, hours]) => hours > 0)
    .map(([dateKey]) => dateKey);

  // Execute the mutation with new API
  await saveWeekHoursMutation.mutateAsync({
    employerId,
    weekEntries,     // ✓ Includes entries with hours=0
    existingDates,   // ✓ Passes dates that exist in DB
  });
  // ...
}, [...]);
```

**Analysis:**
- ✓ Includes ALL entries, even those with 0 hours
- ✓ Passes `existingDates` array to backend for deletion logic
- ✓ Backend will delete entries where hours=0 AND date exists in DB

**Verdict: ✓ PASS** - Edge case properly handled

---

## Edge Case 2: All Days 0 with No DB Data → Should NOT Submit

**Requirement:** Form should prevent submitting when all fields are empty/0 AND the database has no existing hours. Nothing to save or delete.

### Code Implementation Verification ✓

#### Initial State (Lines 96-122)
```typescript
function createInitialState(initialWeek?: Date): WeekFormState {
  // ...
  dateKeys.forEach((key, index) => {
    dailyHours[key] = '';
    initialHours[key] = 0;  // ✓ Initializes to 0 when no DB data
    selectedDays[key] = index < 5;
  });
  // ...
}
```

**Analysis:**
- ✓ When no DB data exists, initialHours are all 0

#### isDirty Computation (Lines 221-231)
```typescript
const isDirty = useMemo(() => {
  const dateKeys = Object.keys(state.dailyHours);
  return dateKeys.some((key) => {
    const currentValue =
      currentStr.trim() === '' ? 0 : parseFloat(currentStr) || 0;
    const initialValue = state.initialHours[key] || 0;
    return Math.abs(currentValue - initialValue) > 0.001;
  });
}, [state.dailyHours, state.initialHours]);
```

**Analysis:**
- ✓ If DB had no data: initialHours[key] = 0
- ✓ If user leaves fields empty: currentValue = 0
- ✓ Comparison: 0 === 0 → isDirty = FALSE

#### canSubmit Logic (Lines 244-271)
```typescript
const canSubmit = useMemo(() => {
  // ...
  if (!isDirty) return false;  // ✓ Returns false when isDirty is false
  // ...
  return true;
}, [...]);
```

**Analysis:**
- ✓ When isDirty=false: canSubmit=false
- ✓ Save button is DISABLED

**Verdict: ✓ PASS** - Edge case properly handled

---

## Edge Case 3: 1 Day Selected with 30h → Should Show Error

**Requirement:** When only 1 day is selected for auto-distribute, entering >24h should show validation error and prevent distribution.

### Code Implementation Verification ✓

#### Distribution Function (Lines 52-91)
```typescript
function distributeHoursAcrossWeekdays(
  decimalValue: number,
  dayColumns: DayColumn[],
  currentDailyHours: Record<string, string>,
  selectedDays: Record<string, boolean>,
): DistributeHoursResult {
  const selectedCount = Object.values(selectedDays).filter(Boolean).length;

  // Prevent division by zero
  if (selectedCount === 0) {
    return {
      dailyHours: { ...currentDailyHours },
      error: 'Please select at least one day for distribution',
    };
  }

  const hoursPerDay = Math.round((decimalValue / selectedCount) * 100) / 100;
  const newDailyHours = { ...currentDailyHours };

  // Check if hours per day exceeds max
  if (hoursPerDay > MAX_HOURS_PER_DAY) {  // ✓ MAX_HOURS_PER_DAY = 24
    return {
      dailyHours: newDailyHours,
      error: `Cannot exceed ${MAX_HOURS_PER_DAY}h per day. Max total for ${selectedCount} day(s): ${MAX_HOURS_PER_DAY * selectedCount}h`,
    };
  }
  // ...
}
```

**Analysis:**
- ✓ Calculates hoursPerDay = totalHours / selectedCount
- ✓ For 1 day selected with 30h: hoursPerDay = 30 / 1 = 30
- ✓ Checks if 30 > 24 → TRUE
- ✓ Returns error: "Cannot exceed 24h per day. Max total for 1 day(s): 24h"

#### setTotalHours Action (Lines 389-440)
```typescript
const setTotalHours = useCallback(
  (hours: string) => {
    // ...
    if (
      prev.autoDistribute &&
      validation.isValid &&
      validation.decimalValue !== null
    ) {
      const result = distributeHoursAcrossWeekdays(
        validation.decimalValue,
        dayColumns,
        prev.dailyHours,
        prev.selectedDays,
      );

      if (result.error) {
        newErrors.total = result.error;  // ✓ Sets error in state
        return { ...newState, errors: newErrors };
      }
      // ...
    }
    // ...
  },
  [dayColumns],
);
```

**Analysis:**
- ✓ When distribution returns error, stores it in `state.errors.total`
- ✓ Error is displayed in AutoDistributeToggle component

#### canSubmit Logic (Lines 244-271)
```typescript
const canSubmit = useMemo(() => {
  // ...
  // Must have no errors
  if (Object.keys(state.errors).length > 0) return false;  // ✓ Checks for errors
  // ...
}, [...]);
```

**Analysis:**
- ✓ When error exists: canSubmit=false
- ✓ Save button is DISABLED

**Verdict: ✓ PASS** - Edge case properly handled

---

## Edge Case 4: Uncheck Day That Would Exceed 24h/Day → Should Prevent

**Requirement:** When auto-distribute is active with high total hours, unchecking a day should be prevented if it would cause remaining days to exceed 24h/day.

### Code Implementation Verification ✓

#### setDaySelected Action (Lines 447-522)
```typescript
const setDaySelected = useCallback(
  (dateKey: string, selected: boolean) => {
    setState((prev) => {
      const newSelectedDays = { ...prev.selectedDays, [dateKey]: selected };
      const newSelectedCount =
        Object.values(newSelectedDays).filter(Boolean).length;

      // Prevent unchecking if it would cause hours/day > 24h
      if (!selected && newSelectedCount > 0 && prev.autoDistribute) {
        const totalValidation = validateHours(
          prev.totalHours,
          MAX_HOURS_PER_WEEK,
        );
        if (totalValidation.isValid && totalValidation.decimalValue) {
          const hoursPerDay = totalValidation.decimalValue / newSelectedCount;
          if (hoursPerDay > MAX_HOURS_PER_DAY) {  // ✓ Check if would exceed 24h
            return {
              ...prev,
              errors: {
                ...prev.errors,
                [dateKey]: `Cannot uncheck: would exceed ${MAX_HOURS_PER_DAY}h/day`,
              },
            };  // ✓ Returns error, does NOT change selectedDays
          }
        }
      }

      // Clear any error for this day
      const newErrors = { ...prev.errors };
      delete newErrors[dateKey];

      // If auto-distribute is active, redistribute hours with new selection
      if (prev.autoDistribute && prev.totalHours) {
        // ... redistributes with new selection
      }

      return {
        ...prev,
        selectedDays: newSelectedDays,  // ✓ Only updates if validation passed
        errors: newErrors,
      };
    });
  },
  [dayColumns],
);
```

**Analysis:**
- ✓ When unchecking (!selected):
  - Calculates new selected count
  - Calculates hypothetical hoursPerDay = total / newSelectedCount
  - If hoursPerDay > 24: Returns early with error, does NOT change selectedDays
  - Checkbox remains checked, error message shown
- ✓ Example: 5 days with 100h total (20h/day)
  - Try to uncheck 1 day: 100h / 4 days = 25h/day
  - 25 > 24 → Error shown, checkbox stays checked

**Verdict: ✓ PASS** - Edge case properly handled

---

## Edge Case 5: Navigate to Different Week
**Requirement:** Navigating to a different week should reset the form and load that week's data.

### Code Implementation Verification ✓

#### setWeek Action (Lines 280-305)
```typescript
const setWeek = useCallback((date: Date) => {
  const monday = getMondayOfWeek(date);
  const dateKeys = getWeekDates(monday).map(formatDateKey);

  // Initialize daily hours, selectedDays, and initialHours for new week
  const dailyHours: Record<string, string> = {};
  const initialHours: Record<string, number> = {};
  const selectedDays: Record<string, boolean> = {};

  dateKeys.forEach((key, index) => {
    dailyHours[key] = '';              // ✓ Reset to empty
    initialHours[key] = 0;             // ✓ Reset to 0
    selectedDays[key] = index < 5;     // ✓ Reset to Mon-Fri default
  });

  setState((prev) => ({
    ...prev,
    currentWeek: monday,
    dailyHours,                        // ✓ New empty hours
    initialHours,                      // ✓ New initial hours
    selectedDays,                      // ✓ Reset selection
    errors: {},                        // ✓ Clear errors
    // Preserve auto-distribute and total hours settings
  }));
}, []);
```

**Analysis:**
- ✓ Creates fresh dailyHours, initialHours, selectedDays for new week
- ✓ Clears all errors
- ✓ Preserves auto-distribute toggle and total hours input (UX choice)

#### Prefill Effect (Lines 673-699)
```typescript
useEffect(() => {
  if (!existingHours || existingHours.length === 0) return;

  const weekKey = formatDateKey(state.currentWeek);

  // Avoid re-prefilling the same week
  if (lastPrefilledWeek === weekKey) return;

  // Build hours by date map for the current week
  const weekDateKeys = getWeekDates(state.currentWeek).map(formatDateKey);
  const hoursByDate: Record<string, number> = {};

  let hasDataForWeek = false;
  existingHours.forEach((entry) => {
    if (weekDateKeys.includes(entry.work_date)) {
      hoursByDate[entry.work_date] = entry.hours;
      hasDataForWeek = true;
    }
  });

  // Only prefill if there's data for this week
  if (hasDataForWeek) {
    prefillFromExisting(hoursByDate);  // ✓ Loads new week's data
  }

  setLastPrefilledWeek(weekKey);
}, [state.currentWeek, existingHours, prefillFromExisting, lastPrefilledWeek]);
```

**Analysis:**
- ✓ Watches state.currentWeek for changes
- ✓ When week changes, filters existingHours for new week's dates
- ✓ Calls prefillFromExisting to load that week's data
- ✓ Updates both dailyHours (for display) and initialHours (for dirty tracking)

**Verdict: ✓ PASS** - Edge case properly handled

---

## Edge Case 6: Calendar Disables Incomplete Weeks
**Requirement:** Calendar should disable future dates and weeks where Friday hasn't passed yet.

### Code Implementation Verification ✓

#### WeekNavigator - isDateDisabled Function (Lines 67-86)
```typescript
// File: week-navigator.tsx
const isDateDisabled = (date: Date) => {
  const today = new Date();
  const dayOfWeek = date.getDay();

  // If it's a future date, disable it
  if (date > today) return true;  // ✓ Future dates disabled

  // For current week, check if Friday (day 5) has passed
  // Get the Monday of this date's week
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Get Friday of this week
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  // Disable if Friday hasn't passed yet
  return friday > today;  // ✓ Incomplete weeks disabled
};
```

**Analysis:**
- ✓ Returns true (disabled) if date is in the future
- ✓ For any date, calculates that week's Friday
- ✓ Returns true (disabled) if Friday 23:59:59 hasn't passed yet
- ✓ Example scenarios:
  - Today is Wednesday Jan 8, 2026
  - Checking Monday Jan 6, 2026:
    - Monday of week: Jan 6
    - Friday of week: Jan 10
    - Friday Jan 10 > Today Jan 8 → DISABLED ✓
  - Checking Monday Dec 30, 2025:
    - Friday of week: Jan 3, 2026
    - Jan 3 < Today Jan 8 → ENABLED ✓

#### Calendar Integration (Lines 132-137)
```typescript
<Calendar
  mode="single"
  selected={currentWeek}
  onSelect={handleDateSelect}
  disabled={isDateDisabled}  // ✓ Passes disabled function to Calendar
/>
```

**Analysis:**
- ✓ Shadcn Calendar component respects `disabled` prop
- ✓ Disabled dates are grayed out and not clickable

**Verdict: ✓ PASS** - Edge case properly handled

---

## Additional Validation: Max Hours Per Week

### Code Implementation
```typescript
// Constants (line 30-31)
MAX_HOURS_PER_DAY = 24;
MAX_HOURS_PER_WEEK = 168;  // 24 * 7

// canSubmit validation (line 258)
if (computedTotal > MAX_HOURS_PER_WEEK) return false;
```

**Analysis:**
- ✓ Prevents submitting if weekly total exceeds 168 hours
- ✓ Even if individual days are valid, total must be ≤168h

**Verdict: ✓ PASS**

---

## Summary of Edge Case Verification

| Edge Case | Code Location | Status | Notes |
|-----------|---------------|--------|-------|
| 1. All days 0 with DB data → submit & delete | isDirty (221-231), canSubmit (244-271), submit (606-658) | ✓ PASS | isDirty=true enables submission, backend deletes |
| 2. All days 0 with no DB data → cannot submit | isDirty (221-231), canSubmit (244-271) | ✓ PASS | isDirty=false disables submission |
| 3. 1 day + 30h → show error | distributeHoursAcrossWeekdays (52-91), setTotalHours (389-440) | ✓ PASS | Validates hoursPerDay ≤ 24 |
| 4. Uncheck day → prevent if >24h | setDaySelected (447-522) | ✓ PASS | Validates before allowing uncheck |
| 5. Navigate week → reset form | setWeek (280-305), prefill effect (673-699) | ✓ PASS | Resets state and loads new week's data |
| 6. Calendar → disable incomplete weeks | isDateDisabled (week-navigator.tsx:67-86) | ✓ PASS | Disables future and incomplete weeks |

---

## Code Quality Observations

### Strengths ✓
1. **Comprehensive Validation**: All edge cases have explicit validation logic
2. **Clear Error Messages**: User-friendly error messages for each validation
3. **Defensive Programming**: Checks for division by zero, null values, etc.
4. **Proper State Management**: Uses React best practices (useMemo, useCallback)
5. **Type Safety**: Full TypeScript typing throughout
6. **Separation of Concerns**: Pure functions for distribution logic

### Potential Improvements (Optional)
1. **Floating Point Comparison**: Uses 0.001 tolerance for float comparison (good practice)
2. **Async Error Handling**: Submit function catches errors generically (could be more specific)
3. **Test Coverage**: Consider adding unit tests for edge case functions

---

## Conclusion

**All 6 edge cases specified in Phase 10 are properly handled in the code.**

The implementation includes:
- ✓ Proper isDirty state tracking
- ✓ Validation at multiple levels (input, distribution, submission)
- ✓ Clear error messaging
- ✓ Prevention of invalid states
- ✓ Proper data flow between components

**Code verification: COMPLETE ✓**
**Ready for manual testing: YES ✓**
