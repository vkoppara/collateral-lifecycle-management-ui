import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import type { BasicDetails } from '@/modules/onboarding/types'

const basicDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  owner: z.string().trim().min(2, 'Owner is required'),
  value: z
    .string()
    .trim()
    .min(1, 'Value is required')
    .refine((val) => !Number.isNaN(Number(val.replaceAll(',', ''))), {
      message: 'Enter a valid number',
    }),
  location: z.string().trim().min(2, 'Location is required'),
})

type BasicDetailsFormProps = {
  value: BasicDetails
  onChange: (value: BasicDetails) => void
  onValidityChange?: (isValid: boolean) => void
}

function BasicDetailsForm({
  value,
  onChange,
  onValidityChange,
}: BasicDetailsFormProps) {
  const form = useForm<BasicDetails>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: value,
    mode: 'onChange',
  })

  useEffect(() => {
    form.reset(value)
  }, [form, value])

  useEffect(() => {
    onValidityChange?.(form.formState.isValid)
  }, [form.formState.isValid, onValidityChange])

  useEffect(() => {
    const subscription = form.watch((nextValues) => {
      onChange({
        name: nextValues.name ?? '',
        owner: nextValues.owner ?? '',
        value: nextValues.value ?? '',
        location: nextValues.location ?? '',
      })
    })

    return () => subscription.unsubscribe()
  }, [form, onChange])

  return (
    <Form {...form}>
      <form className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Collateral name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner</FormLabel>
              <FormControl>
                <Input placeholder="Owner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2500000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export { BasicDetailsForm }
