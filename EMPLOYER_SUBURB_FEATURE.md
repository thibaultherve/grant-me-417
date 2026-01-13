# EMPLOYER_SUBURB Feature Specification

## Overview

**Objective:** Replace the postcode input with a unified suburb selector when creating/editing employers. Users can search by postcode OR suburb name, and the selected suburb is stored as a foreign key.

**Summary:**

- Unified combobox searching both postcode and suburb_name
- Display format: "SUBURB, POSTCODE STATE" (e.g., "DARWIN CITY, 0800 NT")
- Postcode badges shown in search results
- Suburb required for new employers

**Tech Stack:**

- Frontend: React 19.1.1, TypeScript, TailwindCSS, Shadcn UI, React Query v5
- Database: Supabase PostgreSQL
- Validation: Zod with async refinement

---

## Context and Motivation

Currently, employers store only a `postcode` field. The business requires more precise location tracking via suburbs. The `suburbs` table already exists with the following structure:

```
suburbs
├── id (integer, PK)
├── suburb_name (varchar) - e.g., "DARWIN CITY"
├── postcode (varchar) - e.g., "0800"
└── state_code (varchar) - e.g., "NT"
```

Multiple suburbs can share the same postcode (e.g., postcode "0810" contains ALAWA, BRINKIN, CASUARINA, etc.).

---

## Functional Specifications

### 1. Suburb Search Behavior

**Input:**

- Single combobox field replacing the current PostcodeCombobox
- Placeholder: "Search by postcode or suburb name..."
- Debounce: 200ms (same as current postcode search)

**Search Logic:**

- If input is numeric (e.g., "2000"), search by postcode prefix
- If input is alphabetic (e.g., "Sydney"), search by suburb name (contains)
- Mixed input: search both fields

**Results Display:**

- Maximum 10 results
- Simple list (not grouped by state)
- Format: "SUBURB_NAME, POSTCODE STATE" (e.g., "SYDNEY, 2000 NSW")
- Show postcode badges (Regional, Remote, etc.) next to each result

**Selection:**

- On select, store `suburb_id` in form state
- Display selected suburb in same format with badges

### 2. Employer Form Changes

**Current Flow:**

1. Enter employer name
2. Select postcode (PostcodeCombobox)
3. Select industry (shown after postcode)
4. Submit

**New Flow:**

1. Enter employer name
2. Select suburb (SuburbCombobox) - **REQUIRED**
3. Select industry (shown after suburb)
4. Submit

### 3. Employer Card Display

**Current:** "Postcode" with badges
**New:** "SUBURB, POSTCODE STATE" with badges

Example: "DARWIN CITY, 0800 NT" + Regional Australia badge

### 4. Data Migration Strategy

- **DONE:** `postcode` column removed from employers table
- **DONE:** `suburb_id` column is NOT NULL (required FK to suburbs.id)
- All employers now have a suburb_id

### 5. Edge Cases

| Case                  | Behavior                          |
| --------------------- | --------------------------------- |
| No results found      | Show "No suburbs found" message   |
| API error             | Show error toast, disable submit  |
| Very long suburb name | Truncate with ellipsis in results |

---

## Technical Architecture

### Existing Files to Modify

| File                                                  | Changes                                                          |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `src/features/employers/types/index.ts`               | Add `suburb_id: number`, `suburb: Suburb` to Employer (required) |
| `src/features/employers/types/postcode.ts`            | Keep as-is (used by suburbs join)                                |
| `src/features/employers/schemas/index.ts`             | Replace postcode with suburb_id validation                       |
| `src/features/employers/components/employer-form.tsx` | Replace PostcodeCombobox with SuburbCombobox                     |
| `src/features/employers/components/employer-card.tsx` | Display suburb info with badges                                  |
| `src/features/employers/api/employers.ts`             | Add suburb_id to insert/update, fetch with suburb join           |
| `src/features/employers/api/use-employers.ts`         | No changes (uses type inference)                                 |

### New Files to Create

| File                                                    | Purpose                                    |
| ------------------------------------------------------- | ------------------------------------------ |
| `src/features/employers/types/suburb.ts`                | Suburb and SuburbWithPostcode interfaces   |
| `src/features/employers/api/suburbs.ts`                 | searchSuburbs(), getSuburb() API functions |
| `src/features/employers/api/use-suburbs.ts`             | useSearchSuburbs(), useGetSuburb() hooks   |
| `src/features/employers/components/suburb-combobox.tsx` | Unified suburb search combobox             |

---

## Database

### Migration 1: Add suburb_id to employers

```sql
-- Migration: add_suburb_id_to_employers

-- Add suburb_id column (nullable for backward compatibility)
ALTER TABLE employers
ADD COLUMN suburb_id INTEGER REFERENCES suburbs(id);

-- Create index for performance
CREATE INDEX idx_employers_suburb_id ON employers(suburb_id);

-- Ensure suburbs table has search indexes
CREATE INDEX IF NOT EXISTS idx_suburbs_postcode ON suburbs(postcode);
CREATE INDEX IF NOT EXISTS idx_suburbs_name ON suburbs(suburb_name);
CREATE INDEX IF NOT EXISTS idx_suburbs_postcode_name ON suburbs(postcode, suburb_name);
```

### No RLS Changes Required

The `suburbs` table is public reference data and should already have SELECT policy for authenticated users.

---

## Frontend Implementation

### Phase 1: Types & API Functions

**File: `src/features/employers/types/suburb.ts`**

```typescript
import type { Postcode } from './postcode';

export interface Suburb {
  id: number;
  suburb_name: string;
  postcode: string;
  state_code: string;
}

export interface SuburbWithPostcode extends Suburb {
  postcodeData?: Postcode | null;
}
```

**File: `src/features/employers/types/index.ts`** (modify)

```typescript
import type { Suburb } from './suburb';

export interface Employer {
  id: string;
  name: string;
  industry: IndustryType;
  suburb_id: number; // FK to suburbs (required)
  suburb: Suburb; // Joined suburb data
  is_eligible: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployerInput {
  name: string;
  industry: IndustryType;
  suburb_id: number; // NEW: Required
  is_eligible?: boolean;
}
```

**File: `src/features/employers/api/suburbs.ts`**

```typescript
import { supabase } from '@/lib/supabase';
import type { SuburbWithPostcode } from '../types/suburb';

export const searchSuburbs = async (
  query: string,
): Promise<SuburbWithPostcode[]> => {
  if (!query || query.length === 0) {
    return [];
  }

  const isNumeric = /^\d+$/.test(query);

  let queryBuilder = supabase
    .from('suburbs')
    .select(
      `
      id,
      suburb_name,
      postcode,
      state_code,
      postcodes!suburbs_postcode_fkey (
        is_regional_australia,
        is_remote_very_remote,
        is_northern_australia,
        is_bushfire_declared,
        is_natural_disaster_declared
      )
    `,
    )
    .limit(10);

  if (isNumeric) {
    queryBuilder = queryBuilder.ilike('postcode', `${query}%`);
  } else {
    queryBuilder = queryBuilder.ilike('suburb_name', `%${query}%`);
  }

  const { data, error } = await queryBuilder.order('suburb_name', {
    ascending: true,
  });

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    suburb_name: item.suburb_name,
    postcode: item.postcode,
    state_code: item.state_code,
    postcodeData: item.postcodes || null,
  }));
};

export const getSuburb = async (
  id: number,
): Promise<SuburbWithPostcode | null> => {
  const { data, error } = await supabase
    .from('suburbs')
    .select(
      `
      id,
      suburb_name,
      postcode,
      state_code,
      postcodes!suburbs_postcode_fkey (
        is_regional_australia,
        is_remote_very_remote,
        is_northern_australia,
        is_bushfire_declared,
        is_natural_disaster_declared
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    suburb_name: data.suburb_name,
    postcode: data.postcode,
    state_code: data.state_code,
    postcodeData: data.postcodes || null,
  };
};

export const validateSuburbId = async (suburbId: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('suburbs')
    .select('id')
    .eq('id', suburbId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw error;
  }
  return !!data;
};
```

---

### Phase 2: React Query Hooks

**File: `src/features/employers/api/use-suburbs.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { searchSuburbs, getSuburb } from './suburbs';

export const useSearchSuburbs = (query: string) => {
  return useQuery({
    queryKey: ['suburbs', 'search', query],
    queryFn: () => searchSuburbs(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetSuburb = (id: number | undefined) => {
  return useQuery({
    queryKey: ['suburbs', id],
    queryFn: () => getSuburb(id!),
    enabled: !!id && id > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

---

### Phase 3: Update Schema Validation

**File: `src/features/employers/schemas/index.ts`** (modify)

```typescript
import { z } from 'zod';
import { validateSuburbId } from '../api/suburbs';

// ... keep existing industryTypeSchema ...

export const createEmployerSchema = z.object({
  name: z
    .string()
    .min(2, 'Employer name must be at least 2 characters')
    .max(200, 'Employer name must be less than 200 characters')
    .trim(),
  industry: industryTypeSchema,
  suburb_id: z
    .number({ required_error: 'Please select a suburb' })
    .int()
    .positive('Please select a valid suburb')
    .refine(
      async (suburbId) => {
        return await validateSuburbId(suburbId);
      },
      {
        message: 'Selected suburb does not exist',
      },
    ),
  is_eligible: z.boolean().default(true),
});

export type CreateEmployerFormData = z.infer<typeof createEmployerSchema>;
```

---

### Phase 4: SuburbCombobox Component

**File: `src/features/employers/components/suburb-combobox.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearchSuburbs, useGetSuburb } from '../api/use-suburbs';
import { PostcodeBadges } from './postcode-badges';
import type { SuburbWithPostcode } from '../types/suburb';

interface SuburbComboboxProps {
  value: number | undefined;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const formatSuburbDisplay = (suburb: SuburbWithPostcode): string => {
  return `${suburb.suburb_name}, ${suburb.postcode} ${suburb.state_code}`;
};

export function SuburbCombobox({
  value,
  onValueChange,
  disabled,
}: SuburbComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suburbs = [], isLoading } = useSearchSuburbs(debouncedQuery);
  const { data: selectedSuburb } = useGetSuburb(value);

  const handleSelect = (suburb: SuburbWithPostcode) => {
    onValueChange(suburb.id);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedSuburb ? (
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatSuburbDisplay(selectedSuburb)}</span>
              {selectedSuburb.postcodeData && (
                <PostcodeBadges
                  postcode={selectedSuburb.postcodeData}
                  size="sm"
                  className="ml-1"
                />
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Search by postcode or suburb name...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by postcode or suburb name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : debouncedQuery.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search suburbs...
              </div>
            ) : suburbs.length === 0 ? (
              <CommandEmpty>No suburbs found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {suburbs.map((suburb) => (
                  <CommandItem
                    key={suburb.id}
                    value={suburb.id.toString()}
                    onSelect={() => handleSelect(suburb)}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          value === suburb.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">{formatSuburbDisplay(suburb)}</span>
                    </span>
                    {suburb.postcodeData && (
                      <PostcodeBadges
                        postcode={suburb.postcodeData}
                        size="sm"
                        className="ml-2"
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

---

### Phase 5: Update Employer Form

**File: `src/features/employers/components/employer-form.tsx`** (modify)

Key changes:

1. Replace `postcode` field with `suburb_id` field
2. Replace `PostcodeCombobox` with `SuburbCombobox`
3. Update form schema reference
4. Update conditional rendering (industry shows after suburb selection)

```typescript
// Replace PostcodeCombobox import with:
import { SuburbCombobox } from './suburb-combobox';

// In the form, replace the postcode FormField with:
<FormField
  control={form.control}
  name="suburb_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Location</FormLabel>
      <FormControl>
        <SuburbCombobox
          value={field.value}
          onValueChange={field.onChange}
          disabled={isSubmitting}
        />
      </FormControl>
      <FormDescription>
        Search by postcode or suburb name
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// Update conditional rendering:
{form.watch('suburb_id') && (
  <FormField
    control={form.control}
    name="industry"
    // ... rest unchanged
  />
)}
```

---

### Phase 6: Update Employer API

**File: `src/features/employers/api/employers.ts`** (modify)

```typescript
// Update getEmployers to include suburb join
export const getEmployers = async (): Promise<Employer[]> => {
  const { data, error } = await supabase
    .from('employers')
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update addEmployer
export const addEmployer = async (
  input: CreateEmployerInput,
): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .insert([
      {
        name: input.name,
        industry: input.industry,
        suburb_id: input.suburb_id,
        is_eligible: input.is_eligible ?? true,
      },
    ])
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code
      )
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

// Update updateEmployer similarly
export const updateEmployer = async (
  id: string,
  input: CreateEmployerInput,
): Promise<Employer> => {
  const { data, error } = await supabase
    .from('employers')
    .update({
      name: input.name,
      industry: input.industry,
      suburb_id: input.suburb_id,
      is_eligible: input.is_eligible ?? true,
    })
    .eq('id', id)
    .select(
      `
      *,
      suburb:suburbs (
        id,
        suburb_name,
        postcode,
        state_code
      )
    `,
    )
    .single();

  if (error) throw error;
  return data;
};
```

---

### Phase 7: Update Employer Card

**File: `src/features/employers/components/employer-card.tsx`** (modify)

```typescript
export function EmployerCard({ employer, onDelete, onEdit }: EmployerCardProps) {
  // Display suburb info (always available since suburb_id is required)
  const locationDisplay = `${employer.suburb.suburb_name}, ${employer.suburb.postcode} ${employer.suburb.state_code}`;

  // In the render:
  <span className="flex items-center gap-1">
    <MapPin className="w-3 h-3" />
    {locationDisplay}
    {/* Badges from suburb.postcodeData */}
  </span>
}
```

---

## Execution Plan

### Database Phase

- [x] Apply migration: add_suburb_id_to_employers
- [x] Verify indexes created
- [x] Test FK constraint

### Phase 1: Types & API

- [x] Create `src/features/employers/types/suburb.ts`
- [x] Update `src/features/employers/types/index.ts` (add suburb_id, suburb)
- [x] Create `src/features/employers/api/suburbs.ts`
- [ ] Test searchSuburbs with both postcode and name

### Phase 2: React Query Hooks

- [x] Create `src/features/employers/api/use-suburbs.ts`
- [ ] Test hooks in isolation

### Phase 3: Schema Validation

- [x] Update `src/features/employers/schemas/index.ts`
- [x] Replace postcode with suburb_id validation
- [ ] Test async validation

### Phase 4: SuburbCombobox Component

- [x] Create `src/features/employers/components/suburb-combobox.tsx`
- [x] Implement debounced search
- [x] Display results with badges
- [ ] Test selection behavior

### Phase 5: Update Employer Form

- [x] Replace PostcodeCombobox with SuburbCombobox
- [x] Update form default values for edit mode
- [ ] Test create/edit flows

### Phase 6: Update Employer API

- [x] Update getEmployers with suburb join
- [x] Update addEmployer with suburb_id
- [x] Update updateEmployer with suburb_id
- [ ] Test optimistic updates

### Phase 7: Update Employer Card

- [x] Display suburb info (always present)
- [x] Show postcodeData badges
- [ ] Test display

### Testing

- [ ] Test create employer with suburb
- [ ] Test edit employer
- [ ] Test search by postcode (numeric)
- [ ] Test search by suburb name (alpha)
- [ ] Test badges display

---

## Important Notes

### Schema

- `suburb_id` is required (NOT NULL) on employers table
- `postcode` column has been removed from employers
- Suburb data is always joined when fetching employers

### Performance

- Indexes on suburbs.postcode and suburbs.suburb_name for fast search
- Debounced search (200ms) prevents excessive API calls
- React Query caching (5-10 min) reduces duplicate fetches

### Security

- No sensitive data exposed
- Suburbs table is public reference data
- FK constraint ensures data integrity

### i18n

- All user-facing strings should use react-i18next
- Error messages in schema need translation keys

---

## Next Steps

After this spec is approved:

1. **Database migration:**

   ```bash
   # Apply via Supabase MCP
   mcp__supabase__apply_migration
   ```

2. **Frontend development:**
   ```bash
   /dev spec=EMPLOYER_SUBURB_FEATURE.md phase=1
   ```

Follow phases in order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → Testing
