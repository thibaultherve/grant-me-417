import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEmployerSchema, type CreateEmployerFormData } from '../schemas'
import { INDUSTRY_OPTIONS } from '../constants'

interface AddEmployerFormProps {
  onSubmit: (data: CreateEmployerFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  onError?: (error: Error) => void
}

export function AddEmployerForm({ onSubmit, onCancel, isSubmitting, onError }: AddEmployerFormProps) {
  const form = useForm<CreateEmployerFormData>({
    resolver: zodResolver(createEmployerSchema),
    defaultValues: {
      name: '',
      industry: 'plant_and_animal_cultivation' as const,
      postcode: '',
      is_eligible: true
    }
  })

  const handleSubmit = async (data: CreateEmployerFormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Failed to add employer')
      onError?.(errorMessage)
      
      // Set form-level error if onError is not provided
      if (!onError) {
        form.setError('root', {
          type: 'manual',
          message: errorMessage.message
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-lg mx-auto">
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
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <FormField
          control={form.control}
          name="postcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postcode (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 4000" 
                  {...field} 
                  className="h-12 text-base"
                  maxLength={4}
                />
              </FormControl>
              <FormDescription>
                Australian postcode where you worked
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Employer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}