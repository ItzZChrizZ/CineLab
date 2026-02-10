// === Photographer ===

export interface PhotographerInfo {
  style: string
  lighting: string
  vibe: string
}

// Genre -> { ArtistName -> PhotographerInfo }
export type PhotographerGenre = Record<string, PhotographerInfo>
export type PhotographerLibrary = Record<string, PhotographerGenre>

// === Camera ===

export interface CameraInfo {
  info: string
  vibe: string
}

export type CameraLibrary = Record<string, CameraInfo>

// === Lens ===

export interface LensInfo {
  info: string
  character: string
}

export type LensLibrary = Record<string, LensInfo>

// === Lighting ===

export interface LightingPresetInfo {
  info: string
  result: string
}

export type LightingCategory = "Studio" | "Outdoor"
export type LightingPresets = Record<LightingCategory, Record<string, LightingPresetInfo>>

// === Metadata ===

export interface SpatialLogic {
  pan: string
  tilt: string
}

export interface LibraryMetadata {
  project: string
  version: string
  spatial_logic: SpatialLogic
}

// === Full Library ===

export interface Library {
  metadata: LibraryMetadata
  photographers: PhotographerLibrary
  cameras: CameraLibrary
  lenses: LensLibrary
  lighting_presets: LightingPresets
}
