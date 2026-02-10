/**
 * Provider-neutral schema type using standard JSON Schema conventions.
 * Each provider adapter converts this to its native format if needed.
 */
export interface CineResponseSchema {
  type: string
  properties?: Record<string, CineResponseSchema>
  items?: CineResponseSchema
  required?: string[]
  enum?: string[]
  additionalProperties?: boolean
}

/**
 * The canonical Cinelab recipe schema.
 * - OpenAI: used directly via response_format.json_schema
 * - Anthropic: used directly via tool input_schema
 * - Gemini: converted to uppercase types by toGeminiSchema()
 */
export const CINE_RECIPE_SCHEMA: CineResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    cinematography_recipe: {
      type: "object",
      additionalProperties: false,
      properties: {
        phase_1_subject_retention: {
          type: "object",
          additionalProperties: false,
          properties: {
            gender_lock: { type: "string" },
            framing_type: {
              type: "string",
              enum: ["close-up", "portrait", "half-body", "full-body"],
            },
            four_by_four_analysis: {
              type: "object",
              additionalProperties: false,
              properties: {
                anatomy: { type: "array", items: { type: "string" } },
                pose: { type: "array", items: { type: "string" } },
                outfit: { type: "array", items: { type: "string" } },
                identity: { type: "array", items: { type: "string" } },
              },
              required: ["anatomy", "pose", "outfit", "identity"],
            },
            environment_override: {
              type: "object",
              additionalProperties: false,
              properties: {
                location: { type: "string" },
                background: { type: "string" },
                composition: { type: "string" },
              },
              required: ["location", "background", "composition"],
            },
          },
          required: [
            "gender_lock",
            "framing_type",
            "four_by_four_analysis",
            "environment_override",
          ],
        },
        phase_2_technical_override: {
          type: "object",
          additionalProperties: false,
          properties: {
            camera_body: { type: "string" },
            lens_specs: { type: "string" },
            aperture: { type: "string" },
            iso: { type: "integer" },
            aspect_ratio: { type: "string" },
            optical_character: { type: "string" },
          },
          required: [
            "camera_body",
            "lens_specs",
            "aperture",
            "iso",
            "aspect_ratio",
            "optical_character",
          ],
        },
        phase_3_artistic_dna: {
          type: "object",
          additionalProperties: false,
          properties: {
            artist_influence: { type: "string" },
            visual_style: { type: "array", items: { type: "string" } },
          },
          required: ["artist_influence", "visual_style"],
        },
        phase_4_lighting_physics: {
          type: "object",
          additionalProperties: false,
          properties: {
            setup: { type: "string" },
            physical_specs: {
              type: "object",
              additionalProperties: false,
              properties: {
                key_light: { type: "string" },
                fill_light: { type: "string" },
                back_light: { type: "string" },
                background_light: { type: "string" },
              },
              required: [
                "key_light",
                "fill_light",
                "back_light",
                "background_light",
              ],
            },
            directors_notes: { type: "string" },
          },
          required: ["setup", "physical_specs", "directors_notes"],
        },
      },
      required: [
        "phase_1_subject_retention",
        "phase_2_technical_override",
        "phase_3_artistic_dna",
        "phase_4_lighting_physics",
      ],
    },
  },
  required: ["cinematography_recipe"],
}
