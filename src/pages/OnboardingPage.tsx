import { useMemo, useState } from 'react'

import { Button, Card } from '@/components/ui'
import {
  AdditionalDetailsForm,
  BasicDetailsForm,
  CollateralTypeSelection,
  ReviewSubmit,
  Stepper,
  TriggerSelection,
} from '@/modules/onboarding/components'
import type { AdditionalDetails, OnboardingDraft } from '@/modules/onboarding/types'
import { useOnboardingStore } from '@/store/onboardingStore'

const initialAdditionalDetails: AdditionalDetails = {
  marginCallFrequency: '',
  valuationMethod: '',
  notes: '',
  registration: '',
  area: '',
}

const stepLabels = ['Trigger', 'Type', 'Forms', 'Review']

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [basicDetailsValid, setBasicDetailsValid] = useState(false)
  const [additionalDetailsValid, setAdditionalDetailsValid] = useState(false)
  const [additionalDetails, setAdditionalDetails] =
    useState<AdditionalDetails>(initialAdditionalDetails)

  const trigger = useOnboardingStore((state) => state.trigger)
  const type = useOnboardingStore((state) => state.type)
  const details = useOnboardingStore((state) => state.details)
  const setTrigger = useOnboardingStore((state) => state.setTrigger)
  const setType = useOnboardingStore((state) => state.setType)
  const setDetails = useOnboardingStore((state) => state.setDetails)
  const reset = useOnboardingStore((state) => state.reset)

  const onboardingDraft = useMemo<OnboardingDraft>(
    () => ({
      trigger,
      collateralTypes: type ? [type] : [],
      basicDetails: details,
      additionalDetails,
    }),
    [additionalDetails, details, trigger, type],
  )

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === stepLabels.length - 1

  const isStepComplete = (stepIndex: number) => {
    if (stepIndex === 0) {
      return Boolean(trigger.trim())
    }

    if (stepIndex === 1) {
      return Boolean(type.trim())
    }

    if (stepIndex === 2) {
      return basicDetailsValid && additionalDetailsValid
    }

    return true
  }

  const maxUnlockedStep = useMemo(() => {
    if (!isStepComplete(0)) {
      return 0
    }

    if (!isStepComplete(1)) {
      return 1
    }

    if (!isStepComplete(2)) {
      return 2
    }

    return 3
  }, [additionalDetailsValid, basicDetailsValid, trigger, type])

  const canGoNext = isStepComplete(currentStep)

  const handleTypeChange = (nextValues: string[]) => {
    const latestValue = nextValues[nextValues.length - 1] ?? ''
    setType(latestValue)
  }

  const handleNext = () => {
    if (!canGoNext) {
      return
    }

    setCurrentStep((value) => Math.min(value + 1, stepLabels.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((value) => Math.max(value - 1, 0))
  }

  const handleSubmit = () => {
    reset()
    setAdditionalDetails(initialAdditionalDetails)
    setCurrentStep(0)
  }

  const handleStepChange = (nextStep: number) => {
    if (nextStep > maxUnlockedStep) {
      return
    }

    setCurrentStep(nextStep)
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return <TriggerSelection value={trigger} onChange={setTrigger} />
    }

    if (currentStep === 1) {
      return (
        <CollateralTypeSelection
          values={type ? [type] : []}
          onChange={handleTypeChange}
        />
      )
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          <BasicDetailsForm
            value={details}
            onChange={(nextDetails) => setDetails(nextDetails)}
            onValidityChange={setBasicDetailsValid}
          />
          <AdditionalDetailsForm
            value={additionalDetails}
            onChange={setAdditionalDetails}
            collateralType={type}
            onValidityChange={setAdditionalDetailsValid}
          />
        </div>
      )
    }

    return <ReviewSubmit draft={onboardingDraft} onSubmit={handleSubmit} />
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">Collateral Onboarding</h2>
          <p className="text-sm text-slate-600">
            Configure trigger, type, and details before submission.
          </p>
        </div>

        <Stepper
          steps={stepLabels}
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          {renderStep()}
        </div>

        {!isLastStep && (
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        )}

        {!isLastStep && !canGoNext && (
          <p className="text-xs text-slate-500">
            Complete this step to continue.
          </p>
        )}
      </Card>
    </section>
  )
}

export default OnboardingPage
