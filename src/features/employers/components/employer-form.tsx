import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
  SelectValue,
} from '@/components/ui/select';

import { INDUSTRY_OPTIONS } from '../constants';
import { createEmployerSchema, type CreateEmployerFormData } from '../schemas';
import type { Employer } from '../types';

import { SuburbCombobox } from './suburb-combobox';

interface EmployerFormProps {
  mode: 'add' | 'edit';
  employer?: Employer;
  onSubmit: (data: CreateEmployerFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onError?: (error: Error) => void;
}

export function EmployerForm({
  mode,
  employer,
  onSubmit,
  onCancel,
  isSubmitting,
  onError,
}: EmployerFormProps) {
  const isEdit = mode === 'edit';

  const form = useForm<CreateEmployerFormData>({
    resolver: zodResolver(createEmployerSchema),
    defaultValues:
      isEdit && employer
        ? {
            name: employer.name,
            industry: employer.industry,
            suburb_id: employer.suburb_id,
            is_eligible: employer.is_eligible,
          }
        : {
            name: '',
            industry: 'plant_and_animal_cultivation' as const,
            suburb_id: undefined,
            is_eligible: true,
          },
  });

  // Watch form fields to check if all required fields are filled
  const name = form.watch('name');
  const suburbId = form.watch('suburb_id');
  const industry = form.watch('industry');

  // Disable submit if any required field is empty
  const isFormIncomplete = !name || !suburbId || !industry;

  const handleSubmit = async (data: CreateEmployerFormData) => {
    try {
      await onSubmit(data);
      // Reset form only in add mode after successful submission
      if (!isEdit) {
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error
          : new Error(`Failed to ${isEdit ? 'update' : 'add'} employer`);
      onError?.(errorMessage);

      // Set form-level error if onError is not provided
      if (!onError) {
        form.setError('root', {
          type: 'manual',
          message: errorMessage.message,
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-lg mx-auto"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employer Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Sunshine Farm"
                  {...field}
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription>
                The name of your employer or farm
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {form.watch('suburb_id') && (
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-base py-3"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The industry type for specified work eligibility
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.formState.errors.root && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 text-base"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 text-base"
            disabled={isSubmitting || isFormIncomplete}
          >
            {isSubmitting
              ? isEdit
                ? 'Updating...'
                : 'Adding...'
              : isEdit
                ? 'Update Employer'
                : 'Add Employer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
