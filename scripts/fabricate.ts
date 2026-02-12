import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join, basename, extname } from 'node:path'
import { config as loadEnv } from 'dotenv'
import type { BatchConfig } from '../src/types/batch-config.ts'
import type { WizardState } from '../src/types/wizard.ts'
import type { Library } from '../src/types/library.ts'
import type { ProviderConfig, ProviderId } from '../src/engine/provider-types.ts'
import { PROVIDER_ID } from '../src/engine/provider-types.ts'
import { CINE_RECIPE_SCHEMA } from '../src/engine/response-schema.ts'
import { buildPrompt } from '../src/engine/prompt-builder.ts'
import { geminiProvider } from '../src/engine/providers/gemini.ts'
import { openaiProvider } from '../src/engine/providers/openai.ts'
import { anthropicProvider } from '../src/engine/providers/anthropic.ts'
import type { CineProvider, CineRequest } from '../src/engine/provider-types.ts'

// ── Constants ──

const SYSTEM_INSTRUCTION =
  "Act as a technical Director of Photography. Focus on light physics and professional cinematography."

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const PROVIDERS: Record<string, CineProvider> = {
  [PROVIDER_ID.Gemini]: geminiProvider,
  [PROVIDER_ID.OpenAI]: openaiProvider,
  [PROVIDER_ID.Anthropic]: anthropicProvider,
}

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

// ── Helpers ──

function resolveProviderConfig(): ProviderConfig {
  // 1. Explicit choice
  const explicit = process.env.VITE_PROVIDER as ProviderId | undefined
  if (explicit) {
    const key = process.env[KEY_ENV_VARS[explicit]]
    if (!key) {
      throw new Error(
        `Provider "${explicit}" selected via VITE_PROVIDER, but ${KEY_ENV_VARS[explicit]} is missing.\n` +
        `Add the required key to your .env or remove VITE_PROVIDER to auto-detect.`
      )
    }
    const model = process.env.VITE_MODEL ?? DEFAULT_MODELS[explicit]
    return { providerId: explicit, model, apiKey: key }
  }

  // 2. Auto-detect from available keys
  for (const id of [PROVIDER_ID.Gemini, PROVIDER_ID.OpenAI, PROVIDER_ID.Anthropic] as ProviderId[]) {
    const key = process.env[KEY_ENV_VARS[id]]
    if (key) {
      const model = process.env.VITE_MODEL ?? DEFAULT_MODELS[id]
      return { providerId: id, model, apiKey: key }
    }
  }

  throw new Error(
    'No API key found. Add at least one to your .env:\n' +
    '  VITE_GOOGLE_API_KEY=...\n  VITE_OPENAI_API_KEY=...\n  VITE_ANTHROPIC_API_KEY=...'
  )
}

function batchConfigToWizardState(cfg: BatchConfig): WizardState {
  return {
    currentStep: 0,
    referenceImage: null,
    referencePreview: null,
    camera: cfg.camera,
    lens: cfg.lens,
    fStop: cfg.fStop as WizardState['fStop'],
    iso: cfg.iso as WizardState['iso'],
    genre: cfg.genre,
    artist: cfg.artist,
    notes: cfg.notes,
    lightingCategory: cfg.lightingCategory,
    lightingScenario: cfg.lightingScenario,
    lightSpecs: cfg.lightSpecs,
    aspectRatio: cfg.aspectRatio as WizardState['aspectRatio'],
    generatedPrompt: null,
  }
}

function parseArgs(): { folderPath: string; configPath: string; concurrency: number } {
  const args = process.argv.slice(2)
  let folderPath = ''
  let configPath = 'cinelab-config.json'
  let concurrency = 3

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = args[i + 1]
      i++
    } else if (args[i] === '--concurrency' && args[i + 1]) {
      concurrency = Math.max(1, Math.min(10, parseInt(args[i + 1], 10) || 3))
      i++
    } else if (!args[i].startsWith('--')) {
      folderPath = args[i]
    }
  }

  if (!folderPath) {
    console.error('\nUsage: npm run fabricate -- <folder-path> [--config <config-path>] [--concurrency <n>]\n')
    console.error('  <folder-path>   Path to folder with images (jpg/png/webp)')
    console.error('  --config        Path to cinelab-config.json (default: ./cinelab-config.json)')
    console.error('  --concurrency   Parallel requests (1-10, default: 3)\n')
    process.exit(1)
  }

  return { folderPath: resolve(folderPath), configPath: resolve(configPath), concurrency }
}

async function runPool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tasks.length) {
      const i = nextIndex++
      results[i] = await tasks[i]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()))
  return results
}

// ── Main ──

async function main() {
  // Load .env
  loadEnv()

  const { folderPath, configPath, concurrency } = parseArgs()

  // Read config
  if (!existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`)
    console.error('Export your config from the Cinelab UI first (Save Config button).')
    process.exit(1)
  }

  const batchConfig: BatchConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
  console.log(`\n  Config loaded: ${configPath}`)
  console.log(`  Camera: ${batchConfig.camera} | Lens: ${batchConfig.lens} | Artist: ${batchConfig.artist}`)

  // Read library
  const libPath = resolve(import.meta.dirname, '..', 'src', 'data', 'library.json')
  const lib: Library = JSON.parse(readFileSync(libPath, 'utf-8'))

  // Resolve provider
  const providerConfig = resolveProviderConfig()
  const provider = PROVIDERS[providerConfig.providerId]
  if (!provider) {
    console.error(`Unknown provider: "${providerConfig.providerId}"`)
    process.exit(1)
  }
  console.log(`  Provider: ${provider.name} (${providerConfig.model})`)
  console.log(`  Concurrency: ${concurrency}`)

  // List images
  if (!existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`)
    process.exit(1)
  }

  const files = readdirSync(folderPath)
    .filter(f => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
    .sort()

  if (files.length === 0) {
    console.error(`No images found in: ${folderPath}`)
    process.exit(1)
  }

  console.log(`  Images found: ${files.length}\n`)

  // Create output dir
  const outputDir = join(folderPath, 'Prompts')
  mkdirSync(outputDir, { recursive: true })

  // Build prompt (same for all images — only the image changes)
  const fakeState = batchConfigToWizardState(batchConfig)
  const prompt = buildPrompt(fakeState, lib)

  // Process images in parallel
  let success = 0
  let failed = 0
  const errors: Array<{ file: string; error: string }> = []
  const padLen = String(files.length).length

  const tasks = files.map((file, i) => async () => {
    const ext = extname(file).toLowerCase()
    const imagePath = join(folderPath, file)
    const outputName = basename(file, extname(file)) + '.json'
    const outputPath = join(outputDir, outputName)
    const tag = `[${String(i + 1).padStart(padLen, ' ')}/${files.length}]`

    try {
      const imageBuffer = readFileSync(imagePath)
      const imageBase64 = imageBuffer.toString('base64')
      const imageMimeType = MIME_TYPES[ext] ?? 'image/jpeg'

      const request: CineRequest = {
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt,
        imageBase64,
        imageMimeType,
        schema: CINE_RECIPE_SCHEMA,
        temperature: 0.1,
      }

      const json = await provider.generate(request, providerConfig)
      writeFileSync(outputPath, json, 'utf-8')
      success++
      console.log(`  ${tag} ${file} -> OK`)
    } catch (e) {
      failed++
      const msg = e instanceof Error ? e.message : String(e)
      errors.push({ file, error: msg })
      console.error(`  ${tag} ${file} -> FAIL: ${msg}`)
    }
  })

  await runPool(tasks, concurrency)

  // Summary
  console.log(`\n  Done! ${success} OK, ${failed} failed.`)
  console.log(`  Output: ${outputDir}\n`)

  if (errors.length > 0) {
    console.log('  Failed files:')
    for (const { file, error } of errors) {
      console.log(`    - ${file}: ${error}`)
    }
    console.log()
  }
}

main()
