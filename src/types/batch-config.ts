import type { LightingCategory } from './library'

/**
 * Serializable subset of WizardState — no File objects, no previews.
 * Exported from UI via "Save Config", consumed by CLI fabricate script.
 */
export interface BatchConfig {
  camera: string
  lens: string
  fStop: string
  iso: string
  genre: string
  artist: string
  notes: string
  lightingCategory: LightingCategory
  lightingScenario: string
  lightSpecs: string
  aspectRatio: string
}
