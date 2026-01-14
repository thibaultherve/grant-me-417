import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { useState } from 'react';
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

import { useAvailableVisas } from '../hooks/use-available-visas';
import {
  createVisaSchema,
  updateVisaSchema,
  type CreateVisaFormData,
  type UpdateVisaFormData,
} from '../schemas';
import type { UserVisa, VisaType } from '../types';
import { getVisaLabel } from '../utils/visa-helpers';

type VisaFormAddProps = {
  mode: 'add';
  visa?: never;
  onSubmit: (data: CreateVisaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

type VisaFormEditProps = {
  mode: 'edit';
  visa: UserVisa;
  onSubmit: (data: UpdateVisaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

type VisaFormProps = VisaFormAddProps | VisaFormEditProps;

export function VisaForm({
  mode,
  visa,
  onSubmit,
  onCancel,
  isSubmitting,
}: VisaFormProps) {
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(
    mode === 'edit' && visa ? visa.visa_type : null,
  );
  const { availableVisaTypes, loading, error, hasAvailableVisas } =
    useAvailableVisas();

  const schema = mode === 'add' ? createVisaSchema : updateVisaSchema;

  const form = useForm<CreateVisaFormData | UpdateVisaFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'edit' && visa
        ? { arrival_date: visa.arrival_date }
        : { visa_type: undefined, arrival_date: '' },
  });

  const handleVisaTypeSelect = (visaType: VisaType) => {
    if (mode === 'edit') return;
    setSelectedVisaType(visaType);
    (form as ReturnType<typeof useForm<CreateVisaFormData>>).setValue(
      'visa_type',
      visaType,
    );
    form.clearErrors(
      'visa_type' as keyof (CreateVisaFormData | UpdateVisaFormData),
    );
  };

  const handleSubmit = async (
    data: CreateVisaFormData | UpdateVisaFormData,
  ) => {
    try {
      if (mode === 'add') {
        await (onSubmit as (data: CreateVisaFormData) => Promise<void>)(
          data as CreateVisaFormData,
        );
        form.reset();
        setSelectedVisaType(null);
      } else {
        await (onSubmit as (data: UpdateVisaFormData) => Promise<void>)(
          data as UpdateVisaFormData,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  // Handle loading state (only for add mode)
  if (mode === 'add' && loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state (only for add mode)
  if (mode === 'add' && error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-sm text-destructive">
          Error loading available visas: {error.message}
        </p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  // Handle no available visas (only for add mode)
  if (mode === 'add' && !hasAvailableVisas) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">All Visas Added</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You have already added all available Working Holiday Visas to your
          account.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Visa Type Selection - only for add mode */}
        {mode === 'add' && (
          <FormField
            control={form.control}
            name="visa_type"
            render={() => (
              <FormItem>
                <FormLabel>Visa Type</FormLabel>
                <Select
                  value={selectedVisaType || ''}
                  onValueChange={(value) =>
                    handleVisaTypeSelect(value as VisaType)
                  }
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a visa type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableVisaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getVisaLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose which Working Holiday Visa you want to track
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Visa Type Display - only for edit mode */}
        {mode === 'edit' && visa && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Visa Type</label>
            <div className="p-3 bg-muted rounded-md">
              <span className="font-medium">{getVisaLabel(visa.visa_type)}</span>
              <p className="text-sm text-muted-foreground mt-1">
                Visa type cannot be changed
              </p>
            </div>
          </div>
        )}

        {/* Arrival Date */}
        <FormField
          control={form.control}
          name="arrival_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrival Date in Australia</FormLabel>
              <FormControl>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    {...field}
                    className="h-12 text-base pl-10"
                  />
                </div>
              </FormControl>
              <FormDescription>
                {mode === 'add'
                  ? 'The date you first arrived in Australia on this visa'
                  : 'Update your arrival date if needed'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form error */}
        {form.formState.errors.root && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Buttons */}
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
            disabled={isSubmitting || (mode === 'add' && !selectedVisaType)}
          >
            {isSubmitting
              ? mode === 'add'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'add'
                ? 'Create Visa'
                : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
