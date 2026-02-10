import type { LightingCategory } from './library'

// === F-Stop & ISO Options (fixed lists) ===

export const F_STOP_OPTIONS = [
  "f/1.2", "f/1.4", "f/1.8", "f/2.0", "f/2.8",
  "f/4", "f/5.6", "f/8", "f/11", "f/16", "f/22"
] as const

export const ISO_OPTIONS = [
  "50", "100", "200", "400", "800",
  "1600", "3200", "6400", "Grainy"
] as const

export const ASPECT_RATIO_OPTIONS = [
  "4:5", "16:9", "1:1", "9:16"
] as const

export type FStop = typeof F_STOP_OPTIONS[number]
export type ISO = typeof ISO_OPTIONS[number]
export type AspectRatio = typeof ASPECT_RATIO_OPTIONS[number]

// === Wizard Step ===

export const WizardStep = {
  Reference: 0,
  Equipment: 1,
  ArtDirection: 2,
  Lighting: 3,
  Output: 4,
} as const

export type WizardStep = (typeof WizardStep)[keyof typeof WizardStep]

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  [WizardStep.Reference]: "Reference",
  [WizardStep.Equipment]: "Equipment",
  [WizardStep.ArtDirection]: "Art Direction",
  [WizardStep.Lighting]: "Lighting",
  [WizardStep.Output]: "Output",
}

// === Wizard State ===

export interface WizardState {
  currentStep: WizardStep

  // Step 1: Reference
  referenceImage: File | null
  referencePreview: string | null

  // Step 2: Equipment
  camera: string | null
  lens: string | null
  fStop: FStop
  iso: ISO

  // Step 3: Art Direction
  genre: string | null
  artist: string | null
  notes: string

  // Step 4: Lighting
  lightingCategory: LightingCategory
  lightingScenario: string | null
  lightSpecs: string
  aspectRatio: AspectRatio

  // Step 5: Output
  generatedPrompt: string | null
}

// === Wizard Actions ===

export type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  // Step 1
  | { type: "SET_REFERENCE"; file: File; preview: string }
  | { type: "CLEAR_REFERENCE" }
  // Step 2
  | { type: "SET_CAMERA"; camera: string }
  | { type: "SET_LENS"; lens: string }
  | { type: "SET_FSTOP"; fStop: FStop }
  | { type: "SET_ISO"; iso: ISO }
  // Step 3
  | { type: "SET_GENRE"; genre: string }
  | { type: "SET_ARTIST"; artist: string }
  | { type: "SET_NOTES"; notes: string }
  // Step 4
  | { type: "SET_LIGHTING_CATEGORY"; category: LightingCategory }
  | { type: "SET_LIGHTING_SCENARIO"; scenario: string }
  | { type: "SET_LIGHT_SPECS"; specs: string }
  | { type: "SET_ASPECT_RATIO"; ratio: AspectRatio }
  // Step 5
  | { type: "SET_GENERATED_PROMPT"; prompt: string }
  | { type: "RESET" }

// === Initial State ===

export const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: WizardStep.Reference,

  referenceImage: null,
  referencePreview: null,

  camera: null,
  lens: null,
  fStop: "f/2.8",
  iso: "400",

  genre: null,
  artist: null,
  notes: "",

  lightingCategory: "Studio",
  lightingScenario: null,
  lightSpecs: "",
  aspectRatio: "4:5",

  generatedPrompt: null,
}
