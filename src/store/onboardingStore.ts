import { create } from 'zustand'

type OnboardingDetails = {
  name: string
  owner: string
  value: string
  location: string
}

type OnboardingState = {
  trigger: string
  type: string
  details: OnboardingDetails
  setTrigger: (trigger: string) => void
  setType: (type: string) => void
  setDetails: (details: Partial<OnboardingDetails>) => void
  reset: () => void
}

const initialDetails: OnboardingDetails = {
  name: '',
  owner: '',
  value: '',
  location: '',
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  trigger: '',
  type: '',
  details: initialDetails,
  setTrigger: (trigger) => set({ trigger }),
  setType: (type) => set({ type }),
  setDetails: (details) =>
    set((state) => ({
      details: {
        ...state.details,
        ...details,
      },
    })),
  reset: () =>
    set({
      trigger: '',
      type: '',
      details: initialDetails,
    }),
}))
