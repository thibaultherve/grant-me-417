import { zodResolver } from '@hookform/resolvers/zod';
import type { Visa, VisaType } from '@regranted/shared';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { useAvailableVisas } from '../hooks/use-available-visas';
import { useBlockedRanges } from '../hooks/use-blocked-ranges';
import {
  createVisaSchema,
  updateVisaSchema,
  type CreateVisaFormData,
  type UpdateVisaFormData,
} from '../schemas';

import { VisaDatePicker } from './visa-date-picker';
import { VisaFormFooter } from './visa-form-footer';
import { VisaNumberSelector } from './visa-number-selector';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToIsoString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoStringToDate(str: string): Date | undefined {
  if (!str) return undefined;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// ─── Props ────────────────────────────────────────────────────────────────────

type VisaFormAddProps = {
  mode: 'add';
  visa?: never;
  onSubmit: (data: CreateVisaFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: never;
  isSubmitting?: boolean;
  isDeleting?: boolean;
};

type VisaFormEditProps = {
  mode: 'edit';
  visa: Visa;
  onSubmit: (data: UpdateVisaFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
};

type VisaFormProps = VisaFormAddProps | VisaFormEditProps;

// ─── Component ────────────────────────────────────────────────────────────────

export function VisaForm({
  mode,
  visa,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
  isDeleting,
}: VisaFormProps) {
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(
    mode === 'edit' && visa ? visa.visaType : null,
  );

  const { allVisaTypes, loading, error, hasAvailableVisas } =
    useAvailableVisas();

  const {
    blockedRanges,
    minDate,
    maxDate,
    orderingConstraint,
    successorConstraint,
  } = useBlockedRanges(
    mode === 'edit' && visa ? visa.id : undefined,
    selectedVisaType,
  );

  const schema = mode === 'add' ? createVisaSchema : updateVisaSchema;

  const form = useForm<CreateVisaFormData | UpdateVisaFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'edit' && visa
        ? { arrivalDate: visa.arrivalDate }
        : { visaType: undefined, arrivalDate: '' },
  });

  const handleVisaTypeSelect = (visaType: VisaType) => {
    if (mode === 'edit') return;
    setSelectedVisaType(visaType);
    (form as ReturnType<typeof useForm<CreateVisaFormData>>).setValue(
      'visaType',
      visaType,
    );
    form.clearErrors(
      'visaType' as keyof (CreateVisaFormData | UpdateVisaFormData),
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

  const isBusy = isSubmitting || isDeleting;

  if (mode === 'add' && loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="rounded-xl border border-border">
          <CardContent className="flex flex-col gap-7 p-7 pb-6">
            {mode === 'add' && (
              <FormField
                control={form.control}
                name="visaType"
                render={() => (
                  <FormItem>
                    <VisaNumberSelector
                      value={selectedVisaType}
                      onChange={handleVisaTypeSelect}
                      allVisaTypes={allVisaTypes}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="arrivalDate"
              render={({ field }) => (
                <FormItem>
                  <VisaDatePicker
                    value={isoStringToDate(field.value)}
                    onChange={(date) => {
                      field.onChange(date ? dateToIsoString(date) : '');
                    }}
                    blockedRanges={blockedRanges}
                    minDate={minDate}
                    maxDate={maxDate}
                    orderingConstraint={orderingConstraint}
                    successorConstraint={successorConstraint}
                    disabled={mode === 'add' && !selectedVisaType}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {form.formState.errors.root.message}
              </div>
            )}

            {mode === 'edit' ? (
              <VisaFormFooter
                mode="edit"
                isBusy={!!isBusy}
                isSubmitting={isSubmitting}
                isDeleting={isDeleting}
                visaId={visa.id}
                onCancel={onCancel}
                onDelete={onDelete}
              />
            ) : (
              <VisaFormFooter
                mode="add"
                isBusy={!!isBusy}
                isSubmitting={isSubmitting}
                canSubmit={!!selectedVisaType}
                onCancel={onCancel}
              />
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
