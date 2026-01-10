import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle, Clock, Plane, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

import { useAvailableVisas } from '../hooks/use-available-visas';
import { createVisaSchema, type CreateVisaFormData } from '../schemas';
import type { VisaType } from '../types';

interface AddVisaFormProps {
  onSubmit: (data: CreateVisaFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onError?: (error: Error) => void;
}

const iconMap = {
  Plane: Plane,
  Clock: Clock,
  CheckCircle: CheckCircle,
};

export function AddVisaForm({
  onSubmit,
  onCancel,
  isSubmitting,
  onError,
}: AddVisaFormProps) {
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(
    null,
  );
  const { availableVisas, loading, error, hasAvailableVisas } =
    useAvailableVisas();

  const form = useForm<CreateVisaFormData>({
    resolver: zodResolver(createVisaSchema),
    defaultValues: {
      visa_type: undefined,
      arrival_date: '',
    },
  });

  const handleVisaTypeSelect = (visaType: VisaType) => {
    setSelectedVisaType(visaType);
    form.setValue('visa_type', visaType);
    form.clearErrors('visa_type');
  };

  const handleSubmit = async (data: CreateVisaFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setSelectedVisaType(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error : new Error('Failed to add visa');
      onError?.(errorMessage);

      if (!onError) {
        form.setError('root', {
          type: 'manual',
          message: errorMessage.message,
        });
      }
    }
  };

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-sm text-destructive">
          Error loading available visas: {error.message}
        </p>
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  if (!hasAvailableVisas) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">All Visas Added</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You have already added all available Working Holiday Visas to your
          account.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="visa_type"
          render={() => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Select Visa Type
              </FormLabel>
              <FormDescription>
                Choose which Working Holiday Visa you want to track (
                {availableVisas.length} available)
              </FormDescription>
              <FormControl>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                  {availableVisas.map((option) => {
                    const Icon = iconMap[option.icon as keyof typeof iconMap];
                    const isSelected = selectedVisaType === option.type;

                    return (
                      <Card
                        key={option.type}
                        className={`cursor-pointer transition-all border-2 hover:shadow-md ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleVisaTypeSelect(option.type)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {option.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {option.duration}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm leading-relaxed">
                            {option.description}
                          </CardDescription>
                          {option.requiredDays > 0 && (
                            <div className="mt-3">
                              <Badge
                                variant={option.variant}
                                className="text-xs"
                              >
                                {option.requiredDays} days required
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                The date you first arrived in Australia on this visa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
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
            disabled={isSubmitting || !selectedVisaType}
          >
            {isSubmitting ? 'Adding...' : 'Add Visa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
