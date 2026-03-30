import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

import type { Employer, IndustryType } from '@regranted/shared';

import { useUser } from '@/lib/auth';

import { useCheckEligibility } from '../api/use-employers';
import { useGetSuburb } from '../api/use-suburbs';
import { INDUSTRY_OPTIONS } from '../constants';
import { createEmployerSchema, type CreateEmployerFormData } from '../schemas';

import { EligibilityCheckCard } from './eligibility-check-card';
import { IndustryChip } from './industry-chip';
import { SuburbCombobox } from './suburb-combobox';

interface EmployerFormProps {
  mode: 'add' | 'edit';
  employer?: Employer;
  onSubmit: (data: CreateEmployerFormData) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

export function EmployerForm({
  mode,
  employer,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
  isDeleting,
}: EmployerFormProps) {
  const isEdit = mode === 'edit';
  const { data: user } = useUser();
  const visaType = user?.whvType ?? '417';

  const form = useForm<CreateEmployerFormData>({
    resolver: zodResolver(createEmployerSchema),
    defaultValues:
      isEdit && employer
        ? {
            name: employer.name,
            industry: employer.industry,
            suburbId: employer.suburbId,
            eligibilityMode: employer.eligibilityMode,
            isEligible: employer.isEligible,
          }
        : {
            name: '',
            eligibilityMode: 'automatic' as const,
          },
  });

  const name = form.watch('name');
  const suburbId = form.watch('suburbId');
  const industry = form.watch('industry') as IndustryType | undefined;
  const eligibilityMode = form.watch('eligibilityMode');

  // Suburb postcode flags for the eligibility matrix
  const { data: suburb } = useGetSuburb(suburbId);
  const suburbFlags = suburb?.postcodeData ?? null;

  // Auto eligibility check — cached per (suburbId, industry) combination
  const { data: autoCheckResult, isFetching: isChecking } = useCheckEligibility(
    eligibilityMode === 'automatic' ? suburbId?.toString() : undefined,
    eligibilityMode === 'automatic' ? industry : undefined,
  );

  // Value shown in the status badge
  const displayIsEligible =
    eligibilityMode === 'automatic'
      ? (autoCheckResult?.isEligible ?? null)
      : (form.watch('isEligible') ?? null);

  const isFormIncomplete = !name || !suburbId || !industry;

  const handleSubmit = async (data: CreateEmployerFormData) => {
    try {
      // In automatic mode, server recomputes isEligible — strip it from payload
      const payload = { ...data };
      if (data.eligibilityMode === 'automatic') {
        delete payload.isEligible;
      }
      await onSubmit(payload);
      if (!isEdit) form.reset();
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${isEdit ? 'update' : 'add'} employer`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 2-column on desktop: form fields left | eligibility right */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-start">
          {/* Left: Form fields */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sunshine Farm"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormDescription>
                    Name of the farm or business you work for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full py-2.5 px-3">
                        {field.value ? (
                          <IndustryChip
                            industry={field.value as IndustryType}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Select Industry...
                          </span>
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <IndustryChip
                            industry={option.value as IndustryType}
                          />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of work performed for this employer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suburbId"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right: Eligibility Check Card */}
          <EligibilityCheckCard
            mode={eligibilityMode ?? 'automatic'}
            onModeChange={(newMode) => {
              form.setValue('eligibilityMode', newMode);
              // Pre-populate manual isEligible with last auto result
              if (newMode === 'manual' && autoCheckResult) {
                form.setValue('isEligible', autoCheckResult.isEligible);
              }
            }}
            isEligible={displayIsEligible}
            isChecking={isChecking}
            selectedIndustry={industry ?? null}
            suburbFlags={suburbFlags}
            visaType={visaType}
            onManualEligibilityChange={(eligible) =>
              form.setValue('isEligible', eligible)
            }
          />
        </div>

        {/* Form-level error */}
        {form.formState.errors.root && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isDeleting}
          >
            Cancel
          </Button>

          {isEdit && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete employer?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this employer and all
                    associated hours. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isDeleting || isFormIncomplete}
          >
            {isSubmitting
              ? isEdit
                ? 'Saving...'
                : 'Adding...'
              : isEdit
                ? 'Save Changes'
                : 'Add Employer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
