import type { CineResponseSchema } from './response-schema'

/**
 * Provider-agnostic request. Same shape for Gemini, OpenAI, Anthropic.
 */
export interface CineRequest {
  systemInstruction: string
  prompt: string
  imageBase64: string
  imageMimeType: string
  schema: CineResponseSchema
  temperature: number
}

/**
 * Adapter contract. Each provider exports a const object satisfying this.
 */
export interface CineProvider {
  readonly name: string
  generate(request: CineRequest, config: ProviderConfig): Promise<string>
}

export const PROVIDER_ID = {
  Gemini: 'gemini',
  OpenAI: 'openai',
  Anthropic: 'anthropic',
} as const

export type ProviderId = (typeof PROVIDER_ID)[keyof typeof PROVIDER_ID]

export interface ProviderConfig {
  providerId: ProviderId
  model: string
  apiKey: string
}
