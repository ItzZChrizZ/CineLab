import type { ProviderConfig, ProviderId } from './provider-types'
import { PROVIDER_ID } from './provider-types'

const DEFAULT_MODELS: Record<ProviderId, string> = {
  [PROVIDER_ID.Gemini]: 'gemini-3-flash-preview',
  [PROVIDER_ID.OpenAI]: 'gpt-4o',
  [PROVIDER_ID.Anthropic]: 'claude-sonnet-4-5-20250929',
}

const KEY_ENV_VARS: Record<ProviderId, string> = {
  [PROVIDER_ID.Gemini]: 'VITE_GOOGLE_API_KEY',
  [PROVIDER_ID.OpenAI]: 'VITE_OPENAI_API_KEY',
  [PROVIDER_ID.Anthropic]: 'VITE_ANTHROPIC_API_KEY',
}

/**
 * Auto-detect provider from available API keys.
 * Priority: explicit VITE_PROVIDER > first available key > error.
 */
function detectProvider(env: Record<string, string | undefined>): { providerId: ProviderId; apiKey: string } {
  // 1. Explicit choice
  const explicit = env.VITE_PROVIDER as ProviderId | undefined
  if (explicit) {
    const key = env[KEY_ENV_VARS[explicit]]
    if (key) return { providerId: explicit, apiKey: key }
  }

  // 2. Auto-detect from available keys
  for (const id of [PROVIDER_ID.Gemini, PROVIDER_ID.OpenAI, PROVIDER_ID.Anthropic] as ProviderId[]) {
    const key = env[KEY_ENV_VARS[id]]
    if (key) return { providerId: id, apiKey: key }
  }

  throw new Error(
    'No API key found. Add at least one to your .env:\n' +
    '  VITE_GOOGLE_API_KEY=...\n  VITE_OPENAI_API_KEY=...\n  VITE_ANTHROPIC_API_KEY=...'
  )
}

/**
 * Reads env vars and returns the active provider config.
 * Auto-detects provider if VITE_PROVIDER is not set.
 */
export function resolveConfig(): ProviderConfig {
  const env = import.meta.env
  const { providerId, apiKey } = detectProvider(env as Record<string, string | undefined>)
  const model = (env.VITE_MODEL as string | undefined) ?? DEFAULT_MODELS[providerId]
  return { providerId, model, apiKey }
}
