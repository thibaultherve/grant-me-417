# HOURS FORMS IMPROVEMENT - Testing Checklist

**Feature:** Week-based hours entry form with calendar navigation, day selection, and reset functionality
**Phases Tested:** 6-9 (Week Navigator, Grid Enhancement, Auto-Distribute, Integration)
**Date:** 2026-01-09

---

## Pre-Testing Setup

### Database Setup
- [ ] Ensure you have at least one employer created
- [ ] Create test data: Add hours for a previous week (e.g., last week)
- [ ] Create test data: Leave current week empty for testing

### Test Environment
- [ ] Start development server: `pnpm dev`
- [ ] Open browser to localhost
- [ ] Navigate to Hours page
- [ ] Select an employer to enter hours

---

## Phase 6: Week Navigator Enhancement

### Calendar Popover
- [ ] **Open calendar:** Click on the week range text (e.g., "Mon 6 Jan - Sun 12 Jan 2025")
- [ ] **Verify:** Calendar popover opens centered below the text
- [ ] **Verify:** Current week is highlighted in the calendar
- [ ] **Verify:** Today's date has a visual indicator
- [ ] **Navigate months:** Use calendar arrows to navigate to previous/next months
- [ ] **Verify:** Future dates are disabled (grayed out and not clickable)
- [ ] **Verify:** Incomplete weeks are disabled (weeks where Friday hasn't passed yet)
- [ ] **Select past complete week:** Click on any date in a past complete week
- [ ] **Verify:** Form updates to show selected week's date range
- [ ] **Verify:** Calendar popover closes after selection
- [ ] **Verify:** Form loads existing hours for that week (if any)

### Prominent Navigation Arrows
- [ ] **Visual check:** "Prev" and "Next" buttons have outline style (not ghost)
- [ ] **Visual check:** Buttons show both icon AND text ("Prev" / "Next")
- [ ] **Visual check:** Buttons are larger and more prominent than before
- [ ] **Click Prev:** Navigate to previous week
- [ ] **Verify:** Week range updates correctly
- [ ] **Click Next:** Navigate to next week (if week is complete)
- [ ] **Verify:** Next button is disabled if current week is incomplete
- [ ] **Verify:** Calendar icon appears next to week range text

---

## Phase 7: Week Hours Grid Enhancement

### Day Selection Checkboxes
- [ ] **Visual check:** Each day column has a checkbox above the day name
- [ ] **Verify initial state:** Mon-Fri checkboxes are checked by default
- [ ] **Verify initial state:** Sat-Sun checkboxes are unchecked by default
- [ ] **Check Saturday:** Click Saturday checkbox
- [ ] **Verify:** Checkbox becomes checked
- [ ] **Uncheck Monday:** Click Monday checkbox
- [ ] **Verify:** Checkbox becomes unchecked
- [ ] **Enable auto-distribute:** Check the "Auto-distribute" toggle
- [ ] **Enter total hours:** Input "40" in total hours field
- [ ] **Verify:** Only checked days receive distributed hours
- [ ] **Verify:** Unchecked days show empty (0 hours)

### Reset Button
- [ ] **Initial state:** Verify Reset button is NOT visible (form not dirty)
- [ ] **Enter hours:** Type "8" in Monday field
- [ ] **Verify:** Reset button appears in a new column after Total
- [ ] **Visual check:** Reset button shows rotate-counterclockwise icon (↺)
- [ ] **Hover over Reset:** Verify tooltip appears: "Reset to initial values"
- [ ] **Click Reset:** Click the reset button
- [ ] **Verify:** All hours revert to their initial values (empty or DB values)
- [ ] **Verify:** Auto-distribute is turned off
- [ ] **Verify:** Total hours field is cleared
- [ ] **Verify:** Reset button disappears (form no longer dirty)
- [ ] **Load week with existing data:** Navigate to a week with saved hours
- [ ] **Modify existing hours:** Change Monday from "8" to "10"
- [ ] **Verify:** Reset button appears
- [ ] **Click Reset:** Verify hours revert to "8" (original DB value)

---

## Phase 8: Auto-Distribute Toggle Update

### Selected Days Info Display
- [ ] **Enable auto-distribute:** Check the toggle
- [ ] **Enter 40 hours:** Type "40" in total hours field
- [ ] **Verify display:** Shows "→ 8.0h/day (Mon-Fri)" (5 days selected by default)
- [ ] **Select all 7 days:** Check Saturday and Sunday
- [ ] **Verify display:** Shows "→ 5.7h/day (all days)"
- [ ] **Select only 3 days:** Uncheck all except Mon, Tue, Wed
- [ ] **Verify display:** Shows "→ 13.3h/day (3 days)"
- [ ] **Select only 1 day:** Uncheck all except Monday
- [ ] **Verify display:** Shows "→ 40.0h/day (1 day)"

### Max Hours Context
- [ ] **5 days selected:** Verify shows "Max 120h for 5 selected days"
- [ ] **7 days selected:** Verify shows "Max 168h for 7 selected days"
- [ ] **1 day selected:** Verify shows "Max 24h for 1 selected day"

### Approaching Limit Warning
- [ ] **Select 5 days, enter 110h:** Type "110" in total hours
- [ ] **Verify:** Yellow warning appears: "Approaching maximum hours limit (110h / 120h)"
- [ ] **Visual check:** Warning has AlertCircle icon
- [ ] **Enter 100h:** Type "100"
- [ ] **Verify:** Warning disappears (below 90% threshold)
- [ ] **Select 1 day, enter 22h:** Select only Monday, type "22"
- [ ] **Verify:** Warning appears (>90% of 24h limit)

---

## Phase 9: Week Hours Form Integration

### Component Wiring
- [ ] **Open calendar from Navigator:** Verify calendar opens with correct week selected
- [ ] **Select week from calendar:** Verify Grid updates with correct dates
- [ ] **Check day checkbox in Grid:** Verify Auto-Distribute recalculates correctly
- [ ] **Enter total in Auto-Distribute:** Verify Grid day cells update
- [ ] **Click Reset in Grid:** Verify all components reset correctly
- [ ] **Modify hours in Grid:** Verify Auto-Distribute toggle turns off
- [ ] **Navigate with Prev/Next:** Verify all components reset for new week

### Data Flow
- [ ] **Load week with existing data:** Navigate to a week with saved hours
- [ ] **Verify Grid:** Shows existing hours in day cells
- [ ] **Verify isDirty:** Save button is disabled (no changes)
- [ ] **Modify one day:** Change any day's hours
- [ ] **Verify isDirty:** Save button becomes enabled
- [ ] **Reset:** Click reset button
- [ ] **Verify isDirty:** Save button becomes disabled again

---

## Manual Testing Scenarios

### Scenario 1: Week Navigation via Calendar
**Goal:** Test calendar picker functionality

1. Click on week range text to open calendar
2. Navigate to previous month using calendar arrows
3. Select a date in a complete past week
4. Verify form updates to that week
5. Verify existing hours load (if any)
6. Try to select a future date → Verify it's disabled
7. Try to select current incomplete week → Verify it's disabled

**Expected Result:** ✓ Calendar navigation works correctly, disabled dates cannot be selected

---

### Scenario 2: Week Navigation via Arrows
**Goal:** Test previous/next button navigation

1. Click "Prev" button multiple times
2. Verify week decrements correctly each time
3. Navigate to a past week with saved hours
4. Verify hours load automatically
5. Click "Next" button to return to recent weeks
6. Try to go beyond current week → Verify "Next" is disabled

**Expected Result:** ✓ Arrow navigation works, boundaries are enforced

---

### Scenario 3: Auto-Distribute with Various Day Selections
**Goal:** Test flexible day selection for auto-distribute

1. Enable auto-distribute toggle
2. Enter "40" hours total
3. **Test 1:** Mon-Fri selected (default)
   - Verify: 8h distributed to each weekday
   - Verify: Sat-Sun remain empty
4. **Test 2:** Select all 7 days
   - Verify: 5.71h distributed to each day
   - Verify: Display shows "(all days)"
5. **Test 3:** Select only Mon-Wed (3 days)
   - Verify: 13.33h distributed to each selected day
   - Verify: Thu-Sun remain empty
6. **Test 4:** Select only Monday (1 day)
   - Verify: 40h goes to Monday
   - Verify: All other days empty

**Expected Result:** ✓ Hours distribute correctly across any selected day combination

---

### Scenario 4: Save Button State - Various Dirty Scenarios
**Goal:** Test isDirty logic and save button enable/disable

1. **Test 1:** Fresh form, no changes
   - Verify: Save button disabled
2. **Test 2:** Enter hours in one day
   - Verify: Save button enabled
3. **Test 3:** Enter hours then delete them (back to empty)
   - If DB was empty: Save button disabled
   - If DB had hours: Save button enabled (dirty)
4. **Test 4:** Load week with existing hours
   - Verify: Save button disabled (no changes)
5. **Test 5:** Change existing hours
   - Verify: Save button enabled
6. **Test 6:** Change back to original values
   - Verify: Save button disabled (not dirty)
7. **Test 7:** Click reset button
   - Verify: Save button disabled

**Expected Result:** ✓ Save button only enabled when form has changes from DB

---

### Scenario 5: Reset Functionality
**Goal:** Test reset to initial values

1. Navigate to empty week
2. Enter hours: Mon=8, Tue=6, Wed=7
3. Click reset button
4. Verify: All fields clear to empty
5. Navigate to week with existing data (e.g., Mon=8, Tue=8, Wed=8)
6. Change to: Mon=10, Tue=6, Wed=0
7. Click reset button
8. Verify: Values revert to Mon=8, Tue=8, Wed=8
9. Verify: Auto-distribute toggle is off
10. Verify: Total hours field is empty

**Expected Result:** ✓ Reset reverts to initial DB values or empty

---

### Scenario 6: Delete via Zero Hours
**Goal:** Test that setting 0 hours deletes DB entries

1. Navigate to week with existing hours (e.g., Mon=8, Tue=8)
2. Clear Tuesday field (set to empty = 0)
3. Verify: Save button enabled (isDirty)
4. Click Save
5. Verify: Success toast appears
6. Reload page or navigate away and back
7. Verify: Tuesday has no hours (deleted from DB)
8. Verify: Monday still has 8 hours

**Expected Result:** ✓ Zero hours delete existing DB entries

---

### Scenario 7: Single Notification on Save
**Goal:** Verify duplicate notification bug is fixed

1. Enter hours for multiple days
2. Click Save button
3. **VERIFY:** Only ONE toast notification appears
4. **VERIFY:** Toast shows: "Hours saved for [week range]"
5. **VERIFY:** NO second toast about "Successfully updated X work entries"

**Expected Result:** ✓ Only one notification, no duplicates

---

## Edge Case Testing

### Edge Case 1: All Days Zero with Existing DB Data
**Goal:** Verify form allows submitting all zeros to delete all entries

1. Navigate to week with existing hours (e.g., Mon=8, Tue=8, Wed=8)
2. Clear all fields (set all to empty/0)
3. **Verify:** Form isDirty = true (changed from DB)
4. **Verify:** Save button is ENABLED
5. Click Save
6. **Verify:** Save succeeds
7. Reload page or navigate away and back
8. **Verify:** All hours are gone (deleted from DB)

**Expected Result:** ✓ Can submit all zeros to delete all DB entries

---

### Edge Case 2: All Days Zero with No DB Data
**Goal:** Verify form prevents submitting when nothing to save

1. Navigate to week with NO existing hours (empty week)
2. Verify all fields are empty
3. **Verify:** Save button is DISABLED (isDirty = false)
4. Enter "8" in Monday, then delete it (back to empty)
5. **Verify:** Save button is DISABLED
6. Try to submit form
7. **Verify:** Cannot submit (button disabled)

**Expected Result:** ✓ Cannot submit empty form when DB is also empty

---

### Edge Case 3: 1 Day Selected with 30 Hours
**Goal:** Verify validation prevents exceeding 24h/day

1. Enable auto-distribute
2. Uncheck all days except Monday (1 day selected)
3. Enter "30" in total hours field
4. **Verify:** Error message appears: "Cannot exceed 24h per day. Max total for 1 day(s): 24h"
5. **Verify:** Hours are NOT distributed to Monday
6. **Verify:** Save button is DISABLED
7. Change to "24" hours
8. **Verify:** Error clears
9. **Verify:** 24h distributed to Monday
10. **Verify:** Save button ENABLED

**Expected Result:** ✓ Cannot exceed 24h per day, validation prevents it

---

### Edge Case 4: Uncheck Day That Would Exceed 24h/Day
**Goal:** Verify validation prevents unchecking days that would cause overflow

1. Enable auto-distribute
2. Select Mon-Fri (5 days)
3. Enter "100" total hours (20h/day)
4. **Verify:** Hours distributed successfully (20h/day across 5 days)
5. Try to uncheck Monday (would leave 4 days = 25h/day)
6. **Verify:** Checkbox does NOT uncheck
7. **Verify:** Error message appears: "Cannot uncheck: would exceed 24h/day"
8. Change total to "96" hours (exactly 24h/day for 4 days)
9. Try to uncheck Monday again
10. **Verify:** Checkbox unchecks successfully
11. **Verify:** 24h distributed to remaining 4 days

**Expected Result:** ✓ Cannot uncheck day if it would cause hours/day > 24h

---

### Edge Case 5: Navigate to Different Week Mid-Entry
**Goal:** Verify form resets when navigating away

1. Enter hours: Mon=8, Tue=6
2. Enable auto-distribute and set total=40
3. Click "Prev" to navigate to previous week
4. **Verify:** Form resets completely
5. **Verify:** All fields are empty (or show previous week's data)
6. **Verify:** Auto-distribute is still enabled (setting persists)
7. **Verify:** Total hours persists
8. Click "Next" to return
9. **Verify:** Previously entered hours (Mon=8, Tue=6) are GONE (not saved)

**Expected Result:** ✓ Navigating away resets unsaved changes

---

### Edge Case 6: Calendar Select Incomplete Week
**Goal:** Verify calendar properly disables incomplete weeks

1. Click week range to open calendar
2. Navigate to current month
3. Try to click on today's date (if today is before Friday)
4. **Verify:** Date is disabled (grayed out, not clickable)
5. Try to click on any date in the current week (if Friday hasn't passed)
6. **Verify:** All dates in current week are disabled
7. Navigate to next week (future)
8. **Verify:** All future dates are disabled

**Expected Result:** ✓ Cannot select incomplete or future weeks from calendar

---

## Mobile Responsiveness Check

### Visual Tests (Resize browser to mobile width: 375px - 428px)

#### Week Navigator
- [ ] **Layout:** Prev/Next buttons don't overlap week range text
- [ ] **Text:** Week range text doesn't truncate or wrap awkwardly
- [ ] **Calendar popover:** Opens and displays fully within viewport
- [ ] **Touch targets:** Buttons are large enough (min 44x44px)

#### Week Hours Grid
- [ ] **Horizontal scroll:** Grid scrolls horizontally smoothly
- [ ] **Column visibility:** All 7 day columns visible via scroll
- [ ] **Checkbox size:** Checkboxes are touch-friendly (min 24x24px)
- [ ] **Input fields:** Day input fields are usable (not too small)
- [ ] **Reset button:** Visible and usable when isDirty
- [ ] **Employer name:** Truncates with ellipsis if too long

#### Auto-Distribute Toggle
- [ ] **Layout:** Total hours input and calculation display don't overflow
- [ ] **Text wrapping:** "→ Xh/day (Y days)" wraps gracefully if needed
- [ ] **Max hours info:** Displays below input on separate line
- [ ] **Warning:** Approaching limit warning displays fully

#### Action Buttons
- [ ] **Position:** Save/Cancel buttons stack or fit horizontally
- [ ] **Size:** Buttons are touch-friendly
- [ ] **Spacing:** Adequate gap between buttons

### Functional Tests (on actual mobile device or emulator)

- [ ] **Touch calendar:** Tap week range to open calendar
- [ ] **Touch select date:** Tap calendar date to select week
- [ ] **Touch checkboxes:** Tap day checkboxes to toggle selection
- [ ] **Touch reset:** Tap reset button when visible
- [ ] **Touch inputs:** Tap to focus and type in day hour fields
- [ ] **Touch auto-distribute:** Toggle auto-distribute checkbox
- [ ] **Touch navigation:** Tap Prev/Next buttons
- [ ] **Scroll grid:** Swipe horizontally to scroll day columns
- [ ] **Keyboard:** Virtual keyboard doesn't cover critical UI

---

## Test Results Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|-------------|--------------|-------|
| Phase 6: Week Navigator | __ / __ | __ / __ | |
| Phase 7: Grid Enhancement | __ / __ | __ / __ | |
| Phase 8: Auto-Distribute | __ / __ | __ / __ | |
| Phase 9: Integration | __ / __ | __ / __ | |
| Manual Scenarios | __ / 7 | __ / 7 | |
| Edge Cases | __ / 6 | __ / 6 | |
| Mobile Responsiveness | __ / __ | __ / __ | |
| **TOTAL** | **__ / __** | **__ / __** | |

---

## Issues Found

### Critical Issues
*(Issues that prevent core functionality from working)*

1.
2.
3.

### Major Issues
*(Issues that significantly impact UX but have workarounds)*

1.
2.
3.

### Minor Issues
*(Polish issues, minor visual glitches)*

1.
2.
3.

---

## Recommendations for Phase 11 (Future Polish)

### Potential Improvements
- [ ] Add keyboard shortcuts (e.g., Ctrl+S to save)
- [ ] Add loading skeletons for data fetching
- [ ] Add animation when Reset button appears/disappears
- [ ] Add focus management when calendar closes
- [ ] Consider adding "bulk actions" (e.g., "Copy last week")
- [ ] Consider adding "undo" functionality
- [ ] Add aria-live region for Save button state changes
- [ ] Consider adding day name abbreviations for narrow screens

### Performance Considerations
- [ ] Measure render performance with large datasets
- [ ] Check for unnecessary re-renders in day cells
- [ ] Verify memoization is working effectively
- [ ] Test with slow network conditions

---

## Sign-Off

**Tester:** _______________________
**Date:** _______________________
**Overall Status:** ☐ PASS  ☐ FAIL  ☐ PASS WITH MINOR ISSUES
**Ready for Production:** ☐ YES  ☐ NO

**Notes:**


---

## Testing Complete ✓

Once all tests pass, mark Phase 10 as complete in `HOURS_FORMS_IMPROVEMENT_FEATURE.md`.
