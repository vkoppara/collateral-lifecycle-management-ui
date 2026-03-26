import { useMemo, useState } from 'react'

import type {
  AdditionalDetails,
  BasicDetails,
  OnboardingDraft,
  OnboardingStep,
} from '@/modules/onboarding/types'

const steps: OnboardingStep[] = [
  { id: 'trigger-selection', label: 'Trigger' },
  { id: 'collateral-type-selection', label: 'Collateral Type' },
  { id: 'basic-details', label: 'Basic Details' },
  { id: 'additional-details', label: 'Additional Details' },
  { id: 'review-submit', label: 'Review & Submit' },
]

const initialDraft: OnboardingDraft = {
  trigger: '',
  collateralTypes: [],
  basicDetails: {
    name: '',
    owner: '',
    value: '',
    location: '',
  },
  additionalDetails: {
    marginCallFrequency: '',
    valuationMethod: '',
    notes: '',
    registration: '',
    area: '',
  },
}

function useOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const step = useMemo(() => steps[currentStep], [currentStep])

  const goNext = () => {
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1))
  }

  const goBack = () => {
    setCurrentStep((value) => Math.max(value - 1, 0))
  }

  const goToStep = (index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, steps.length - 1)))
  }

  const setTrigger = (trigger: string) => {
    setDraft((value) => ({ ...value, trigger }))
  }

  const setCollateralTypes = (collateralTypes: string[]) => {
    setDraft((value) => ({ ...value, collateralTypes }))
  }

  const setBasicDetails = (basicDetails: BasicDetails) => {
    setDraft((value) => ({ ...value, basicDetails }))
  }

  const setAdditionalDetails = (additionalDetails: AdditionalDetails) => {
    setDraft((value) => ({ ...value, additionalDetails }))
  }

  return {
    steps,
    step,
    draft,
    currentStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    setTrigger,
    setCollateralTypes,
    setBasicDetails,
    setAdditionalDetails,
  }
}

export { useOnboardingFlow }
