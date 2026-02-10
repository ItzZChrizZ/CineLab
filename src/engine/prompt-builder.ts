import type { WizardState } from '../types/wizard'
import type { Library } from '../types/library'

/**
 * Builds the exact same prompt text as Streamlit cine_engine.build_prompt().
 * This text goes to Gemini along with the reference image.
 */
export function buildPrompt(state: WizardState, lib: Library): string {
  const camInfo = state.camera
    ? `${lib.cameras[state.camera].info} | ${lib.cameras[state.camera].vibe}`
    : ""
  const lensInfo = state.lens
    ? `${lib.lenses[state.lens].info} | ${lib.lenses[state.lens].character}`
    : ""

  let locationLogic: string
  if (state.lightingCategory === "Studio") {
    locationLogic = `LOCATION SWITCH: 100% EMPTY STUDIO.
        - REMOVE the reference image background completely.
        - Use a neutral, minimalist, empty CYCLORAMA WALL as the background.
        - POSE OVERRIDE: If the subject is leaning against, holding, or interacting with any environmental object (wall, pole, railing, furniture, etc.), REPLACE that pose with a confident, free-standing editorial pose in the style of '${state.artist}' — because those objects do NOT exist in an empty cyclorama studio. Maintain the subject's attitude and energy, but the body must be fully self-supporting.
        - Ensure the subject remains centered in the frame.
        - HARD RULE: No lighting equipment, softboxes, stands, reflectors, or any studio gear may be visible in the frame. All equipment must be completely invisible. The image must look like a clean, final photograph — not a behind-the-scenes shot.`
  } else {
    locationLogic = "LOCATION KEEP: Maintain the exact outdoor environment and location from the reference image."
  }

  return `
    ROLE: Professional Director of Photography (DP).
    OBJECTIVE: Create a '4x4' (Dört Dörtlük) FLAWLESS and comprehensive cinematography recipe.

    PHASE 1: SUBJECT RETENTION & GENDER LOCK (80% Weight)
    - **GENDER LOCK**: You MUST maintain the exact GENDER and IDENTITY of the person in the reference image. If it's a woman, keep her as a woman. Do not change sex based on clothing style.
    - Perform a '4x4' analysis: Describe the subject in 4 categories (Anatomy, Pose, Outfit, Identity) with 4 high-fidelity descriptors each.
    - Recreate the subject's exact facial features, skin tone, and clothing with absolute precision.
    - **FRAMING ANALYSIS**: Analyze the reference image and determine its framing type — "close-up" (face/head only), "portrait" (head and shoulders), "half-body" (waist up), or "full-body" (head to toe). You MUST preserve the same framing type in the output composition.
    - ${locationLogic}

    PHASE 2: TECHNICAL OVERRIDE (Mandatory)
    - Body: ${state.camera} -> ${camInfo}
    - Lens: ${state.lens} -> ${lensInfo}
    - Aperture: ${state.fStop} | ISO: ${state.iso} | Ratio: ${state.aspectRatio}
    - Apply the specific optical character and sensor DNA of this equipment. Discard metadata from the source image.

    PHASE 3: ARTISTIC DNA (20% Weight)
    - Artist: '${state.artist}'. Infuse their specific color science, film grain, and texture.

    PHASE 4: LIGHTING PHYSICS
    - Setup: ${state.lightingScenario}
    - Precise Physical Specs: ${state.lightSpecs}
    - Director's Notes: ${state.notes || ""}

    OUTPUT: Provide ONLY raw, valid JSON using EXACTLY these keys:
    - Root: cinematography_recipe
    - Phase 1: phase_1_subject_retention > gender_lock, framing_type (one of: "close-up", "portrait", "half-body", "full-body" — detected from the reference image), four_by_four_analysis (anatomy/pose/outfit/identity arrays of 4), environment_override (location/background/composition). The "composition" field MUST include: the detected framing type preserved exactly, the pose in the style of the selected artist, zero background clutter, and zero visible equipment.
    - Phase 2: phase_2_technical_override > camera_body, lens_specs, aperture, iso (number), aspect_ratio, optical_character
    - Phase 3: phase_3_artistic_dna > artist_influence, visual_style (array of 4)
    - Phase 4: phase_4_lighting_physics > setup, physical_specs (key_light/fill_light/back_light/background_light), directors_notes
    `
}
