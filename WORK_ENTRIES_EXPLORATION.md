# Work Entries Database Exploration

## Database: dev (Supabase PostgreSQL)

## 1. work_entries Table Schema

### Table Definition
```sql
Table: work_entries
Purpose: Track individual work entries for each day/employer combination
RLS Enabled: true
Row Count: 5 (sample data)

Columns:
  - id (UUID, PK, auto-generated)
  - user_id (UUID, FK → auth.users.id)
  - employer_id (UUID, FK → employers.id)
  - work_date (DATE, not nullable)
  - hours (NUMERIC, check: hours >= 0 AND hours <= 24)
  - created_at (TIMESTAMPTZ, default: now())
  - updated_at (TIMESTAMPTZ, default: now())
```

### Constraints
- Primary Key: id
- Foreign Keys:
  - `work_entries_user_id_fkey`: user_id → auth.users.id
  - `work_entries_employer_id_fkey`: employer_id → employers.id
- Check Constraint: `hours >= 0 AND hours <= 24`

### Relationships
```
work_entries
  ├──→ auth.users (via user_id)
  ├──→ employers (via employer_id)
  └──→ visa_weekly_progress (indirect: updates trigger refresh)
  └──→ user_visas (indirect: updates trigger recalculation)
```

---

## 2. RLS Policies on work_entries

All policies enforce `auth.uid() = user_id` (users can only access their own data):

| Policy Name | Operation | Qual | With Check |
|------------|-----------|------|------------|
| Users can view own work entries | SELECT | `auth.uid() = user_id` | N/A |
| Users can insert own work entries | INSERT | N/A | `auth.uid() = user_id` |
| Users can update own work entries | UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| Users can delete own work entries | DELETE | `auth.uid() = user_id` | N/A |

**Summary**: Users have full CRUD access to their own work entries. All operations are restricted to `auth.uid() = user_id`.

---

## 3. Triggers on work_entries

### 3.1 Update Timestamp Trigger
```
Trigger Name: trg_work_entries_update_timestamp
Event: BEFORE UPDATE
Function: trgfn_update_timestamp()
Action: Sets NEW.updated_at = NOW()
```

**Purpose**: Automatically update the `updated_at` timestamp on every modification.

### 3.2 Recalculate Visa Progress Triggers
```
Triggers:
  - trg_work_entries_recalc_progress_insert (AFTER INSERT)
  - trg_work_entries_recalc_progress_update (AFTER UPDATE)
  - trg_work_entries_recalc_progress_delete (AFTER DELETE)

Function: trgfn_recalculate_visa_progress_statement()
Action: Calls fn_update_visa_progress() for all affected users
```

**Purpose**: When a work entry is inserted, updated, or deleted, the system automatically recalculates visa progress for the affected user.

**Behavior**:
- Uses statement-level triggers (efficient for bulk operations)
- Uses transition tables (`new_table`/`old_table`) to get all affected rows
- For INSERT/UPDATE: gets user_ids from NEW rows
- For DELETE: gets user_ids from OLD rows
- For UPDATE: also checks if user_id changed

### 3.3 Weekly Progress Refresh Trigger
```
Trigger Name: trg_refresh_weekly_progress_on_work_entry_change
Event: AFTER INSERT, UPDATE, DELETE
Function: trgfn_refresh_weekly_progress_on_work_entry_change()
Action: Calls refresh_weeks_for_work_entry()
```

**Purpose**: Refresh `visa_weekly_progress` table for affected weeks.

**Detailed Behavior**:
- **INSERT**: Refresh the week containing the new work entry
- **UPDATE**:
  - If `work_date` changed: refresh both old and new weeks
  - If only `hours` or `employer_id` changed: refresh current week
- **DELETE**: Refresh the week containing the deleted work entry

---

## 4. Related Database Functions

### 4.1 refresh_weeks_for_work_entry()
```sql
FUNCTION public.refresh_weeks_for_work_entry(target_user_id uuid, target_work_date date)
RETURNS void
```

**Purpose**: Recalculate weekly progress for a specific work date.

**Logic**:
1. Calculate the Monday (week_start) of the week containing `target_work_date`
2. Find all user_visas that cover this work_date (arrival_date ≤ work_date ≤ end_date)
3. For each affected visa, call `calc_weekly_progress()` to calculate week data
4. UPSERT the result into `visa_weekly_progress` table using:
   ```sql
   ON CONFLICT (user_visa_id, week_start_date)
   DO UPDATE SET ... updated_at = NOW()
   ```

**Key Point**: Uses UPSERT, so it handles both new weeks and updates to existing weeks.

### 4.2 calc_weekly_progress()
```sql
FUNCTION public.calc_weekly_progress(affected_visa_id uuid, week_start date)
RETURNS TABLE (...)
```

**Purpose**: Calculate hours, eligible_hours, eligible_days, and days_worked for a specific week.

### 4.3 trgfn_recalculate_visa_progress_statement()
**Purpose**: Statement-level trigger that updates user_visas.eligible_days and days_worked.

**Called by**: Calls `fn_update_visa_progress()` for each affected user.

### 4.4 fn_update_visa_progress()
```sql
FUNCTION public.fn_update_visa_progress(target_user_id uuid)
RETURNS void
```

**Purpose**: Recalculate visa progress fields for all user's visas.

**Logic**:
1. Find all visas for the user
2. For each visa, call `calc_visa_progress()` to get updated stats
3. Update the visa record:
   ```sql
   UPDATE user_visas
   SET
     eligible_days = progress_data.eligible_days,
     days_worked = progress_data.eligible_days,  -- NOTE: Bug? Both set to eligible_days
     updated_at = NOW()
   ```

### 4.5 calc_visa_progress()
```sql
FUNCTION public.calc_visa_progress(target_visa_id uuid)
RETURNS TABLE(...)
```

**Purpose**: Calculate total hours and eligible days across the entire visa period.

**Returns**:
- visa_id, visa_type, arrival_date, end_date
- hours (total all work)
- eligible_hours (work at eligible employers only)
- eligible_days (calculated from weekly eligible hours)
- days_required (88 for second_whv, 179 for third_whv, 0 for first_whv)
- progress_percentage

**Eligible Days Logic** (by week):
```
For each week with eligible work:
  - ≥30 hours = 7 days
  - ≥24 hours = 4 days
  - ≥18 hours = 3 days
  - ≥12 hours = 2 days
  - ≥6 hours = 1 day
  - <6 hours = 0 days
```

---

## 5. How Deletion Works

### Hard Delete (No Soft Delete)
- work_entries uses **hard delete** (rows are removed from database)
- No `deleted_at` column or soft delete mechanism

### Deletion Flow When User Sets 0 Hours
1. **Frontend sends DELETE request** to `/work_entries/{id}`
2. **RLS Policy checks**: `auth.uid() = user_id` must be true
3. **Row is deleted** from work_entries table
4. **Two triggers fire immediately**:

   **Trigger 1**: `trg_refresh_weekly_progress_on_work_entry_change`
   - Calls: `refresh_weeks_for_work_entry(OLD.user_id, OLD.work_date)`
   - Action: Recalculates visa_weekly_progress for that week
   - If all entries for the week are deleted, the week's eligible_days goes to 0

   **Trigger 2**: `trg_work_entries_recalc_progress_delete`
   - Calls: `fn_update_visa_progress(OLD.user_id)`
   - Action: Recalculates user_visas.eligible_days and days_worked

5. **Result**:
   - work_entries row is gone
   - visa_weekly_progress for that week is updated (can become empty or have 0 hours)
   - user_visas.eligible_days is recalculated (may decrease)

---

## 6. How to Check if Current Form Data Differs from DB Data

### Method 1: Fetch Current Entry from Database
```typescript
const response = await supabase
  .from('work_entries')
  .select('id, user_id, employer_id, work_date, hours')
  .eq('id', entryId)
  .single();

const dbEntry = response.data;

// Compare with form data
const hasChanges =
  dbEntry.employer_id !== formData.employer_id ||
  dbEntry.hours !== parseFloat(formData.hours) ||
  dbEntry.work_date !== formData.work_date;
```

### Method 2: Track Original Data on Form Load
```typescript
const [originalData, setOriginalData] = useState(null);
const [formData, setFormData] = useState(null);

useEffect(() => {
  // Load entry from DB
  const loadEntry = async () => {
    const { data } = await supabase
      .from('work_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    setOriginalData(data);
    setFormData(data);
  };

  loadEntry();
}, [entryId]);

// Check if changed
const isDirty = JSON.stringify(originalData) !== JSON.stringify(formData);
```

### Method 3: Smart Comparison (Handles Type Coercion)
```typescript
function hasDataChanged(original: WorkEntry, current: WorkEntry): boolean {
  return (
    original.employer_id !== current.employer_id ||
    Number(original.hours) !== Number(current.hours) ||
    original.work_date !== current.work_date
  );
}
```

### Recommended Approach for Your Feature
Since you need to delete when hours = 0:

```typescript
const handleFormSubmit = async (formData) => {
  // If hours is 0, delete the entry
  if (formData.hours === 0 || parseFloat(formData.hours) === 0) {
    await supabase
      .from('work_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId); // Extra safety check

    // Triggers handle automatic updates to visa_weekly_progress and user_visas
    return { success: true, deleted: true };
  }

  // Check if entry exists and has changed
  const { data: existing } = await supabase
    .from('work_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (!existing) {
    // Create new entry
    await supabase.from('work_entries').insert({
      user_id: userId,
      employer_id: formData.employer_id,
      work_date: formData.work_date,
      hours: formData.hours
    });
  } else if (hasDataChanged(existing, formData)) {
    // Update existing entry
    await supabase
      .from('work_entries')
      .update({
        employer_id: formData.employer_id,
        hours: formData.hours,
        work_date: formData.work_date
      })
      .eq('id', entryId);
  }

  return { success: true, deleted: false };
};
```

---

## 7. Sample Data

| ID | user_id | employer_id | work_date | hours | created_at | updated_at | employer_name |
|----|---------|-------------|-----------|-------|-----------|-----------|---------------|
| dacccb3a-... | aa5a8f99-... | 5e1fb0ba-... | 2024-11-10 | 10.87 | 2025-08-18 10:56:09 | 2025-08-18 10:56:09 | GrainFlow |
| ca40444c-... | aa5a8f99-... | 5e1fb0ba-... | 2024-10-31 | 4.00 | 2025-08-18 10:35:44 | 2025-08-18 10:43:10 | GrainFlow |
| 24fa7110-... | aa5a8f99-... | 5e1fb0ba-... | 2024-11-12 | 8.87 | 2025-08-18 10:56:09 | 2025-08-18 10:56:09 | GrainFlow |

---

## 8. Key Takeaways

### For Deletion Logic
- ✅ Use hard DELETE (no soft delete mechanism exists)
- ✅ Deletion triggers automatic visa progress recalculation
- ✅ No need for manual cleanup after deletion
- ✅ RLS policies prevent cross-user access

### For Form Data Comparison
- ✅ Fetch original data on form load
- ✅ Compare numerics carefully (hours may be decimal)
- ✅ Check for actual changes before API calls
- ✅ Handle 0 hours as deletion signal

### For Data Consistency
- ✅ Database triggers ensure visa_weekly_progress stays in sync
- ✅ visa_weekly_progress updates via UPSERT (handles insert/update)
- ✅ user_visas.eligible_days recalculates on every change
- ✅ No race conditions due to statement-level triggers

### Potential Bug Found
In `fn_update_visa_progress()`, there's a potential issue:
```sql
UPDATE user_visas
SET
  eligible_days = progress_data.eligible_days,
  days_worked = progress_data.eligible_days,  -- ⚠️ Both set to same value!
  updated_at = NOW()
```

Both fields are set to `progress_data.eligible_days`. This may be intentional, but if `days_worked` should track distinct days worked (not eligible days), this could be a bug.
