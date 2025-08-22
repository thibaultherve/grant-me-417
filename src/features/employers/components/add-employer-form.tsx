import React from 'react'
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

interface AddEmployerFormProps {
  onSubmit: (data: CreateEmployerFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const industryOptions = [
  { value: 'plant_and_animal_cultivation', label: 'Plant and Animal Cultivation' },
  { value: 'fishing_and_pearling', label: 'Fishing and Pearling' },
  { value: 'tree_farming_and_felling', label: 'Tree Farming and Felling' },
  { value: 'mining', label: 'Mining' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality_and_tourism', label: 'Hospitality and Tourism' },
  { value: 'bushfire_recovery_work', label: 'Bushfire Recovery Work' },
  { value: 'critical_covid19_work', label: 'Critical COVID-19 Work' },
  { value: 'other', label: 'Other' }
] as const

export function AddEmployerForm({ onSubmit, onCancel, isSubmitting }: AddEmployerFormProps) {
  const form = useForm<CreateEmployerFormData>({
    resolver: zodResolver(createEmployerSchema),
    defaultValues: {
      name: '',
      industry: 'plant_and_animal_cultivation',
      postcode: '',
      is_eligible: true
    }
  })

  const handleSubmit = async (data: CreateEmployerFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  {industryOptions.map((option) => (
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