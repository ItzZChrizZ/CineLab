import type { CineProvider } from './provider-types'
import { PROVIDER_ID } from './provider-types'
import { resolveConfig } from './provider-config'
import { CINE_RECIPE_SCHEMA } from './response-schema'
import { fileToBase64 } from './utils'
import { geminiProvider } from './providers/gemini'
import { openaiProvider } from './providers/openai'
import { anthropicProvider } from './providers/anthropic'

const SYSTEM_INSTRUCTION =
  "Act as a technical Director of Photography. Focus on light physics and professional cinematography."

const PROVIDERS: Record<string, CineProvider> = {
  [PROVIDER_ID.Gemini]: geminiProvider,
  [PROVIDER_ID.OpenAI]: openaiProvider,
  [PROVIDER_ID.Anthropic]: anthropicProvider,
}

/**
 * Single entry point for the UI — same signature as the old gemini.ts export.
 */
export async function runCineEngine(prompt: string, imageFile: File): Promise<string> {
  const config = resolveConfig()
  const provider = PROVIDERS[config.providerId]

  if (!provider) {
    throw new Error(`Unknown provider: "${config.providerId}"`)
  }

  const imageBase64 = await fileToBase64(imageFile)

  return provider.generate(
    {
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt,
      imageBase64,
      imageMimeType: imageFile.type,
      schema: CINE_RECIPE_SCHEMA,
      temperature: 0.1,
    },
    config,
  )
}
