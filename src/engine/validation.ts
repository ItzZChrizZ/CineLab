import type { WizardState } from '../types/wizard'
import { WizardStep } from '../types/wizard'

export function isStepComplete(state: WizardState, step: WizardStep): boolean {
  switch (step) {
    case WizardStep.Reference:
      return state.referenceImage !== null

    case WizardStep.Equipment:
      return state.camera !== null && state.lens !== null

    case WizardStep.ArtDirection:
      return state.genre !== null && state.artist !== null

    case WizardStep.Lighting:
      return state.lightingScenario !== null

    case WizardStep.Output:
      return state.generatedPrompt !== null

    default:
      return false
  }
}

export function canNavigateToStep(state: WizardState, targetStep: WizardStep): boolean {
  for (let i = 0; i < targetStep; i++) {
    if (!isStepComplete(state, i as WizardStep)) return false
  }
  return true
}
