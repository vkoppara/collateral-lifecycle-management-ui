export type OnboardingStepId =
  | 'trigger-selection'
  | 'collateral-type-selection'
  | 'basic-details'
  | 'additional-details'
  | 'review-submit'

export type OnboardingStep = {
  id: OnboardingStepId
  label: string
}

export type TriggerOption = {
  id: string
  label: string
  description: string
}

export type CollateralTypeOption = {
  id: string
  label: string
}

export type BasicDetails = {
  name: string
  owner: string
  value: string
  location: string
}

export type AdditionalDetails = {
  marginCallFrequency: string
  valuationMethod: string
  notes: string
  registration: string
  area: string
}

export type OnboardingDraft = {
  trigger: string
  collateralTypes: string[]
  basicDetails: BasicDetails
  additionalDetails: AdditionalDetails
}
