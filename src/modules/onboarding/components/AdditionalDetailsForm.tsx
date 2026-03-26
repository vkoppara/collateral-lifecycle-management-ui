import { useEffect, useMemo } from 'react'
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
import type { AdditionalDetails } from '@/modules/onboarding/types'

type AdditionalDetailsFormProps = {
  value: AdditionalDetails
  onChange: (value: AdditionalDetails) => void
  collateralType?: string
  onValidityChange?: (isValid: boolean) => void
}

function AdditionalDetailsForm({
  value,
  onChange,
  collateralType,
  onValidityChange,
}: AdditionalDetailsFormProps) {
  const isVehicle = collateralType === 'vehicle'
  const isProperty = collateralType === 'land-building' || collateralType === 'property'

  const schema = useMemo(
    () =>
      z
        .object({
          marginCallFrequency: z.string().trim().min(1, 'Select frequency'),
          valuationMethod: z.string().trim().min(1, 'Select valuation method'),
          notes: z.string(),
          registration: z.string(),
          area: z.string(),
        })
        .superRefine((data, ctx) => {
          if (isVehicle && !data.registration.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['registration'],
              message: 'Registration is required',
            })
          }

          if (isProperty && !data.area.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['area'],
              message: 'Area is required',
            })
          }
        }),
    [isProperty, isVehicle],
  )

  const form = useForm<AdditionalDetails>({
    resolver: zodResolver(schema),
    defaultValues: value,
    mode: 'onChange',
  })

  useEffect(() => {
    form.reset(value)
  }, [form, value])

  useEffect(() => {
    void form.trigger()
  }, [form, isProperty, isVehicle])

  useEffect(() => {
    onValidityChange?.(form.formState.isValid)
  }, [form.formState.isValid, onValidityChange])

  useEffect(() => {
    const subscription = form.watch((nextValues) => {
      onChange({
        marginCallFrequency: nextValues.marginCallFrequency ?? '',
        valuationMethod: nextValues.valuationMethod ?? '',
        notes: nextValues.notes ?? '',
        registration: nextValues.registration ?? '',
        area: nextValues.area ?? '',
      })
    })

    return () => subscription.unsubscribe()
  }, [form, onChange])

  return (
    <Form {...form}>
      <form className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="marginCallFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin Call Frequency</FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valuationMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valuation Method</FormLabel>
              <FormControl>
                <select
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">Select method</option>
                  <option value="mark-to-market">Mark to Market</option>
                  <option value="haircut">Haircut Model</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isVehicle && (
          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vehicle registration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isProperty && (
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <Input placeholder="Enter property area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="Add additional context for review"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export { AdditionalDetailsForm }
