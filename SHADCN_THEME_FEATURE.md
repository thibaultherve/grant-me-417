# SHADCN_THEME Feature Specification

## 1. Overview

**Objective:** Consolidate all theming to use `index.css` as the single source of truth. Remove all hardcoded colors scattered across the application and ensure consistent dark mode support.

**Summary:** Fix dark mode inconsistencies where the main container stays white and certain components display incorrect colors. Ensure all components use CSS variables defined in `index.css`.

**Tech Stack:** React 19.1.1, TailwindCSS 4.1.12, Shadcn UI

---

## 2. Context and Motivation

### Current Issues

1. **Missing base styles**: The `index.css` has no `@layer base` rules to apply theme colors to `html` and `body` elements
2. **Dashboard layout missing background**: The main layout container doesn't have `bg-background` class, causing white background in dark mode
3. **Missing CSS variables**: `--success` and `--warning` colors are used but not defined
4. **Hardcoded colors in components**:
   - `weekly-progress-chart.tsx`: Uses hardcoded rgba values and Tailwind color classes
   - `postcode-badges.tsx`: Uses hardcoded Tailwind color classes

### Expected Outcome

- Dark mode works consistently across all pages and components
- All colors are defined in `index.css` and nowhere else
- Components use themed CSS variables exclusively

---

## 3. Functional Specifications

### 3.1 Theme Variables

**New variables to add:**
- `--success`: Green color for positive states
- `--success-foreground`: Text color on success backgrounds
- `--warning`: Orange/amber color for warning states
- `--warning-foreground`: Text color on warning backgrounds

### 3.2 Base Styles

Add `@layer base` to apply:
- `background-color: var(--background)` to `body`
- `color: var(--foreground)` to `body`
- `border-color: var(--border)` to all elements

### 3.3 Component Color Mapping

**Postcode Badges:**
| Badge Type | New Theme Color |
|------------|-----------------|
| Regional Australia | `bg-chart-1` |
| Northern Australia | `bg-chart-2` |
| Remote/Very Remote | `bg-destructive` |
| Bushfire | `bg-chart-4` |
| Natural disaster | `bg-chart-5` |

**Weekly Progress Chart:**
| Eligible Days | New Theme Color |
|---------------|-----------------|
| 7 days (full) | `chart-1` |
| 5-6 days | `chart-2` |
| 3-4 days | `chart-3` |
| 1-2 days | `chart-4` |
| 0 days | transparent |

---

## 4. Technical Architecture

### 4.1 Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `@layer base`, add `--success`, `--warning` variables |
| `src/components/layouts/dashboard-layout.tsx` | Add `bg-background text-foreground` to root div |
| `src/app/routes/landing.tsx` | Add `bg-background text-foreground` to root div |
| `src/app/routes/auth/login.tsx` | Add `bg-background text-foreground` to root div |
| `src/app/routes/auth/register.tsx` | Add `bg-background text-foreground` to root div |
| `src/app/routes/not-found.tsx` | Add `bg-background text-foreground` to root div |
| `src/features/visas/components/weekly-progress-chart.tsx` | Replace hardcoded colors with CSS variables |
| `src/features/employers/components/postcode-badges.tsx` | Replace hardcoded colors with theme classes |

### 4.2 No New Files Required

All changes are modifications to existing files.

---

## 5. Database

No database changes required.

---

## 6. Backend Implementation

No backend changes required.

---

## 7. Frontend Implementation

### Phase 1: CSS Theme Variables

**File: `src/index.css`**

1. Add `--success` and `--success-foreground` to `:root` (light mode)
2. Add `--success` and `--success-foreground` to `.dark` (dark mode)
3. Add `--warning` and `--warning-foreground` to `:root` (light mode)
4. Add `--warning` and `--warning-foreground` to `.dark` (dark mode)
5. Add color mappings to `@theme inline` block
6. Add `@layer base` with html, body, and border styles

**Light mode values:**
```css
--success: oklch(0.6 0.2 145);
--success-foreground: oklch(1 0 0);
--warning: oklch(0.75 0.15 75);
--warning-foreground: oklch(0.25 0.05 75);
```

**Dark mode values:**
```css
--success: oklch(0.65 0.18 145);
--success-foreground: oklch(0.2 0.02 145);
--warning: oklch(0.7 0.13 75);
--warning-foreground: oklch(0.2 0.03 75);
```

### Phase 2: Layout Background Fix

**Files to update:**

1. `src/components/layouts/dashboard-layout.tsx` line 75:
   - Change: `className="flex min-h-screen flex-col"`
   - To: `className="flex min-h-screen flex-col bg-background text-foreground"`

2. `src/app/routes/landing.tsx` line 56:
   - Change: `className="flex min-h-screen flex-col"`
   - To: `className="flex min-h-screen flex-col bg-background text-foreground"`

3. `src/app/routes/auth/login.tsx` line 53:
   - Change: `className="min-h-screen flex items-center justify-center p-4"`
   - To: `className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground"`

4. `src/app/routes/auth/register.tsx` line 65:
   - Change: `className="flex min-h-screen items-center justify-center px-4"`
   - To: `className="flex min-h-screen items-center justify-center px-4 bg-background text-foreground"`

5. `src/app/routes/not-found.tsx` line 8:
   - Change: `className="flex min-h-screen flex-col items-center justify-center"`
   - To: `className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground"`

### Phase 3: Postcode Badges Theming

**File: `src/features/employers/components/postcode-badges.tsx`**

Replace BADGE_CONFIG colors:
```typescript
const BADGE_CONFIG = {
  is_regional_australia: {
    color: 'bg-chart-1',
    label: 'Regional Australia',
  },
  is_northern_australia: {
    color: 'bg-chart-2',
    label: 'Northern Australia',
  },
  is_remote_very_remote: {
    color: 'bg-destructive',
    label: 'Remote and Very Remote Australia',
  },
  is_bushfire_declared: {
    color: 'bg-chart-4',
    label: 'Bushfire declared areas',
  },
  is_natural_disaster_declared: {
    color: 'bg-chart-5',
    label: 'Natural disaster declared areas',
  },
} as const;
```

### Phase 4: Weekly Progress Chart Theming

**File: `src/features/visas/components/weekly-progress-chart.tsx`**

1. Replace `getBarColor` function to use CSS variables:
```typescript
const getBarColor = (eligibleDays: number, isHovered: boolean) => {
  const opacity = isHovered ? '1' : '0.9';
  if (eligibleDays === 7) return `oklch(from var(--chart-1) l c h / ${opacity})`;
  if (eligibleDays >= 5) return `oklch(from var(--chart-2) l c h / ${opacity})`;
  if (eligibleDays >= 3) return `oklch(from var(--chart-3) l c h / ${opacity})`;
  if (eligibleDays >= 1) return `oklch(from var(--chart-4) l c h / ${opacity})`;
  return 'transparent';
};
```

2. Replace legend colors (lines 204-217):
   - `bg-gray-400` → `bg-chart-4`
   - `bg-green-300` → `bg-chart-3`
   - `bg-green-400` → `bg-chart-2`
   - `bg-green-500` → `bg-chart-1`

---

## 8. Execution Plan

### Phase 1: CSS Theme Variables
- [x] Add `--success` and `--success-foreground` to `:root`
- [x] Add `--success` and `--success-foreground` to `.dark`
- [x] Add `--warning` and `--warning-foreground` to `:root`
- [x] Add `--warning` and `--warning-foreground` to `.dark`
- [x] Add `--color-success`, `--color-success-foreground` to `@theme inline`
- [x] Add `--color-warning`, `--color-warning-foreground` to `@theme inline`
- [x] Add `@layer base` with html, body, and * border styles

### Phase 2: Layout Background Fix
- [x] Update `dashboard-layout.tsx` - add `bg-background text-foreground`
- [x] Update `landing.tsx` - add `bg-background text-foreground`
- [x] Update `login.tsx` - add `bg-background text-foreground`
- [x] Update `register.tsx` - add `bg-background text-foreground`
- [x] Update `not-found.tsx` - add `bg-background text-foreground`

### Phase 3: Postcode Badges Theming
- [x] Replace hardcoded colors in `postcode-badges.tsx`

### Phase 4: Weekly Progress Chart Theming
- [x] Update `getBarColor` function to use CSS variables
- [x] Replace legend hardcoded colors

### Phase 5: Testing
- [ ] Test light mode on all pages
- [ ] Test dark mode on all pages
- [ ] Verify InfoCard "Track your work hours" displays correctly in dark mode
- [ ] Verify weekly progress chart colors in both modes
- [ ] Verify postcode badges display correctly

---

## 9. Important Notes

### Compatibility
- The solution uses oklch color space which is supported in modern browsers
- CSS `oklch(from var(...))` syntax requires TailwindCSS 4.x

### Performance
- No performance impact - only CSS variable changes

### Security
- No security implications

### Colors Used
All colors now reference CSS variables defined in `index.css`:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--success`, `--success-foreground` (new)
- `--warning`, `--warning-foreground` (new)
- `--chart-1` through `--chart-5`
