# EDIT_ADD_EMPLOYER_PAGE Feature Specification

## 1. Overview

### Objective
Refactor employer creation and editing from Sheet modals to dedicated pages with proper routing.

### Summary
- Replace Sheet-based forms with standalone pages
- Add routes: `/employers/new` and `/employers/:id/edit`
- Reuse existing `EmployerForm` component
- Add `getEmployer(id)` API for direct page access
- Layout: Card with Breadcrumb navigation (consistent with hours/edit pattern)

### Tech Stack
- React 19.1.1 + react-router 7.9.4
- @tanstack/react-query 5.90.5
- Shadcn UI (Card, Breadcrumb)
- Existing EmployerForm component

---

## 2. Context and Motivation

### Current State
- Employer add/edit uses Sheet modals on `/app/employers` page
- Form opens as overlay, no dedicated URL
- Cannot bookmark or share edit links
- Edit relies on passing employer object via state

### Target State
- Dedicated pages with clean URLs
- Direct access to edit page via URL
- Consistent with hours/edit pattern in codebase
- Better UX with full-page forms

---

## 3. Functional Specifications

### 3.1 Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/app/employers` | List employers (existing) | Authenticated users |
| `/app/employers/new` | Create new employer | Authenticated users |
| `/app/employers/:id/edit` | Edit existing employer | Owner only (RLS) |

### 3.2 Create Employer Page (`/employers/new`)

**Layout:**
- Breadcrumb: `Employers > New Employer`
- Card containing EmployerForm
- Form in 'add' mode

**Behavior:**
- On submit success: toast + redirect to `/app/employers`
- On cancel: navigate to `/app/employers`
- Loading state: disabled form fields + spinner on submit button

### 3.3 Edit Employer Page (`/employers/:id/edit`)

**Layout:**
- Breadcrumb: `Employers > Edit {employer.name}`
- Card containing EmployerForm
- Form in 'edit' mode

**Data Loading:**
- Fetch employer by ID via `useGetEmployer(id)`
- Show loading skeleton while fetching
- Show error state if employer not found or access denied

**Behavior:**
- On submit success: toast + redirect to `/app/employers`
- On cancel: navigate to `/app/employers`
- Loading state: disabled form fields + spinner on submit button

### 3.4 Employers List Page (modified)

**Changes:**
- Remove Sheet components for add/edit
- Add "New Employer" button linking to `/employers/new`
- Modify EmployerCard to navigate to edit page instead of opening Sheet

### 3.5 Error Handling

| Scenario | Behavior |
|----------|----------|
| Employer not found | Show "Employer not found" message with back link |
| Access denied (RLS) | Show "Access denied" message |
| Network error | Show retry button |
| Form validation error | Inline field errors (existing behavior) |

---

## 4. Technical Architecture

### 4.1 Existing Files to Modify

| File | Changes |
|------|---------|
| [src/config/paths.ts](src/config/paths.ts) | Add `employers.new` and `employers.edit` paths |
| [src/app/router.tsx](src/app/router.tsx) | Add nested routes for employers |
| [src/app/routes/app/employers.tsx](src/app/routes/app/employers.tsx) | Remove Sheets, add Link to new page |
| [src/features/employers/components/employer-card.tsx](src/features/employers/components/employer-card.tsx) | Change Edit to navigate instead of callback |
| [src/features/employers/api/employers.ts](src/features/employers/api/employers.ts) | Add `getEmployer(id)` function |
| [src/features/employers/api/use-employers.ts](src/features/employers/api/use-employers.ts) | Add `useGetEmployer(id)` hook |

### 4.2 New Files to Create

| File | Purpose |
|------|---------|
| `src/app/routes/app/employers/new.tsx` | Create employer page |
| `src/app/routes/app/employers/edit.tsx` | Edit employer page |

---

## 5. Database

No database changes required. Using existing:
- `employers` table
- RLS policies (user can only access own employers)

---

## 6. Implementation Details

### 6.1 Path Configuration (`paths.ts`)

```typescript
// Add to paths.app object
employers: {
  path: '/app/employers',
  getHref: () => '/app/employers',
  new: {
    path: '/app/employers/new',
    getHref: () => '/app/employers/new',
  },
  edit: {
    path: '/app/employers/:id/edit',
    getHref: (id: string) => `/app/employers/${id}/edit`,
  },
},
```

### 6.2 Router Configuration (`router.tsx`)

```typescript
// Add nested routes under /app
{
  path: 'employers',
  lazy: async () => {
    const { EmployersRoute } = await import('./routes/app/employers');
    return { Component: EmployersRoute };
  },
  children: [
    {
      path: 'new',
      lazy: async () => {
        const { EmployerNewRoute } = await import('./routes/app/employers/new');
        return { Component: EmployerNewRoute };
      },
    },
    {
      path: ':id/edit',
      lazy: async () => {
        const { EmployerEditRoute } = await import('./routes/app/employers/edit');
        return { Component: EmployerEditRoute };
      },
    },
  ],
},
```

### 6.3 API Function (`employers.ts`)

```typescript
export async function getEmployer(id: string): Promise<Employer | null> {
  const { data, error } = await supabase
    .from('employers')
    .select(`
      *,
      suburb:suburbs(
        id,
        suburb_name,
        postcode,
        state_code,
        postcodes(
          postcode,
          is_regional_australia,
          is_northern_australia,
          is_remote_very_remote,
          is_bushfire_declared,
          is_natural_disaster_declared
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as Employer;
}
```

### 6.4 React Query Hook (`use-employers.ts`)

```typescript
export function useGetEmployer(id: string | undefined) {
  return useQuery({
    queryKey: ['employer', id],
    queryFn: () => getEmployer(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 6.5 New Page Component (`employers/new.tsx`)

```typescript
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { EmployerForm } from '@/features/employers/components/employer-form';
import { useAddEmployer } from '@/features/employers/api/use-employers';
import { paths } from '@/config/paths';
import type { CreateEmployerFormData } from '@/features/employers/schemas';

export function EmployerNewRoute() {
  const navigate = useNavigate();
  const { mutateAsync: addEmployer, isPending } = useAddEmployer();

  const handleSubmit = async (data: CreateEmployerFormData) => {
    await addEmployer(data);
    navigate(paths.app.employers.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.employers.getHref());
  };

  return (
    <div className="container max-w-2xl py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={paths.app.employers.getHref()}>
              Employers
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Employer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Add New Employer</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployerForm
            mode="add"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6.6 Edit Page Component (`employers/edit.tsx`)

```typescript
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployerForm } from '@/features/employers/components/employer-form';
import { useGetEmployer, useUpdateEmployer } from '@/features/employers/api/use-employers';
import { paths } from '@/config/paths';
import type { CreateEmployerFormData } from '@/features/employers/schemas';

export function EmployerEditRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employer, isLoading, error } = useGetEmployer(id);
  const { mutateAsync: updateEmployer, isPending } = useUpdateEmployer();

  const handleSubmit = async (data: CreateEmployerFormData) => {
    if (!id) return;
    await updateEmployer({ id, data });
    navigate(paths.app.employers.getHref());
  };

  const handleCancel = () => {
    navigate(paths.app.employers.getHref());
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Employer not found or you don't have access.
            </p>
            <Button variant="outline" onClick={handleCancel}>
              Back to Employers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={paths.app.employers.getHref()}>
              Employers
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit {employer.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Edit Employer</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployerForm
            mode="edit"
            employer={employer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7. Execution Plan

### Phase 1: API Layer
- [x] Add `getEmployer(id)` function to `src/features/employers/api/employers.ts`
- [x] Add `useGetEmployer(id)` hook to `src/features/employers/api/use-employers.ts`

### Phase 2: Routing Configuration
- [x] Add `employers.new` and `employers.edit` paths to `src/config/paths.ts`
- [x] Add nested routes to `src/app/router.tsx`

### Phase 3: New Pages
- [x] Create `src/app/routes/app/employers/new.tsx` (create employer page)
- [x] Create `src/app/routes/app/employers/edit.tsx` (edit employer page)

### Phase 4: Update Existing Components
- [x] Modify `src/app/routes/app/employers.tsx`:
  - Remove Sheet imports and components
  - Remove `isAddingEmployer` and `editingEmployer` state
  - Add Link to `/employers/new` button
  - Remove `handleStartEdit` function
  - Keep delete functionality
- [x] Modify `src/features/employers/components/employer-card.tsx`:
  - Change `onEdit` prop to use navigation
  - Import `useNavigate` and `paths`
  - Navigate to edit page instead of calling callback

### Phase 5: Cleanup & Testing
- [x] Verify create flow works end-to-end
- [x] Verify edit flow works end-to-end
- [x] Verify cancel navigation works
- [x] Verify direct URL access to edit page works
- [x] Remove unused Sheet imports

---

## 8. Important Notes

### Compatibility
- EmployerForm component requires no changes
- Existing mutations (useAddEmployer, useUpdateEmployer) remain unchanged
- RLS policies already handle access control

### Performance
- Edit page fetches single employer (not full list)
- React Query caching reduces redundant fetches
- Lazy loading for route components

### Security
- RLS ensures users can only edit their own employers
- API function returns null for unauthorized access
- Edit page shows appropriate error message
