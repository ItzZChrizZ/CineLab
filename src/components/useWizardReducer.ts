import { useReducer } from 'react'
import type { WizardState, WizardAction } from '../types/wizard'
import { WizardStep, INITIAL_WIZARD_STATE } from '../types/wizard'

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, WizardStep.Output) as WizardStep,
      }

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, WizardStep.Reference) as WizardStep,
      }

    // Step 1: Reference
    case "SET_REFERENCE":
      if (state.referencePreview) URL.revokeObjectURL(state.referencePreview)
      return { ...state, referenceImage: action.file, referencePreview: action.preview }

    case "CLEAR_REFERENCE":
      if (state.referencePreview) URL.revokeObjectURL(state.referencePreview)
      return { ...state, referenceImage: null, referencePreview: null }

    // Step 2: Equipment
    case "SET_CAMERA":
      return { ...state, camera: action.camera }

    case "SET_LENS":
      return { ...state, lens: action.lens }

    case "SET_FSTOP":
      return { ...state, fStop: action.fStop }

    case "SET_ISO":
      return { ...state, iso: action.iso }

    // Step 3: Art Direction
    case "SET_GENRE":
      return { ...state, genre: action.genre, artist: null }

    case "SET_ARTIST":
      return { ...state, artist: action.artist }

    case "SET_NOTES":
      return { ...state, notes: action.notes }

    // Step 4: Lighting
    case "SET_LIGHTING_CATEGORY":
      return { ...state, lightingCategory: action.category, lightingScenario: null, lightSpecs: "" }

    case "SET_LIGHTING_SCENARIO":
      return { ...state, lightingScenario: action.scenario }

    case "SET_LIGHT_SPECS":
      return { ...state, lightSpecs: action.specs }

    case "SET_ASPECT_RATIO":
      return { ...state, aspectRatio: action.ratio }

    // Step 5: Output
    case "SET_GENERATED_PROMPT":
      return { ...state, generatedPrompt: action.prompt }

    case "RESET":
      if (state.referencePreview) URL.revokeObjectURL(state.referencePreview)
      return { ...INITIAL_WIZARD_STATE }

    default:
      return state
  }
}

export function useWizardReducer() {
  return useReducer(wizardReducer, INITIAL_WIZARD_STATE)
}
