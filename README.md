---
name: cinelab
description: >
  AI-powered cinematography recipe generator. Analyzes reference images and produces
  structured JSON lighting/camera recipes using a 5-step wizard. Supports Gemini, OpenAI,
  and Anthropic as interchangeable providers. Includes CLI batch mode for processing
  hundreds of images in parallel.
license: Apache-2.0
metadata:
  author: Kraftreich
  version: "2.4"
  stack: React 19, TypeScript, Vite 7, Tailwind CSS v4
  status: stable
compatibility: Requires Node.js 20+. At least one AI provider API key (Google Gemini, OpenAI, or Anthropic).
---

# Cinelab

**AI-powered cinematography recipe engine by Kraftreich.**

---

## The Story Behind Cinelab

Cinelab wasn't built by a team of frontend engineers. It was built by a **Creative Director** — through conversation.

The entire application, from the multi-provider AI engine to the 5-step wizard UI to the CLI batch system, was developed through **vibe coding with Claude**. No boilerplate was copy-pasted from Stack Overflow. No components were dragged from a UI kit. Every architecture decision, every prompt engineering rule, every adapter pattern was born from a back-and-forth dialogue between a creative mind and an AI pair programmer.

The idea was simple: a Director of Photography shouldn't need to write a 500-word prompt to get a consistent lighting recipe. They should pick a camera, pick a lens, pick an artist they admire, and let the system translate that intent into physics. That's what Cinelab does.

**What started as a Streamlit prototype** became a full React 19 + TypeScript application with provider-agnostic architecture, enforced JSON schemas, parallel batch processing, and multi-IDE support — all built through prompts, not sprints.

This is what happens when domain expertise meets AI-assisted development. The Creative Director knows *what* the tool should do. Claude knows *how* to build it. Neither could have done it alone.

> **Cinelab** is a Kraftreich tool.
> Vibe-coded from zero to production — one prompt at a time.

---

Cinelab takes a reference photograph and a set of creative choices — camera body, lens, artistic influence, lighting setup — and generates a structured JSON recipe that describes how to recreate and elevate that image from a Director of Photography's perspective.

## How It Works

```
Reference Image + Creative Choices ──► Prompt Builder ──► AI Provider ──► JSON Recipe
```

The wizard walks through five steps:

| Step | Name | What It Does |
|------|------|-------------|
| 1 | **Reference** | Upload a reference photograph (drag & drop) |
| 2 | **Equipment** | Choose camera body, lens, f-stop, ISO |
| 3 | **Art Direction** | Pick a genre and photographer influence, add director's notes |
| 4 | **Lighting** | Select studio or outdoor, configure a lighting scenario, set aspect ratio |
| 5 | **Output** | Generate the cinematography recipe as structured JSON |

The output is a `cinematography_recipe` JSON with four phases:

- **Phase 1 — Subject Retention**: Gender lock, framing analysis, 4x4 subject description, environment override
- **Phase 2 — Technical Override**: Camera body, lens specs, aperture, ISO, aspect ratio, optical character
- **Phase 3 — Artistic DNA**: Photographer influence, visual style descriptors
- **Phase 4 — Lighting Physics**: Setup name, key/fill/back/background light specs, director's notes

## Quick Start

```bash
# 1. Clone and install
cd Cinelab
npm install

# 2. Configure your AI provider
cp .env.example .env
# Add at least one API key:
#   VITE_GOOGLE_API_KEY=...    (Gemini — default)
#   VITE_OPENAI_API_KEY=...    (OpenAI)
#   VITE_ANTHROPIC_API_KEY=... (Anthropic)

# 3. Start the wizard
npm run dev
```

Open `http://localhost:3000` and walk through the five steps.

## Provider Auto-Detection

Cinelab detects which AI provider to use based on available API keys. No manual `VITE_PROVIDER` needed.

**Priority order:** Gemini → OpenAI → Anthropic (first available key wins).

| Provider | Default Model | Env Variable |
|----------|--------------|-------------|
| Gemini | `gemini-3-flash-preview` | `VITE_GOOGLE_API_KEY` |
| OpenAI | `gpt-4o` | `VITE_OPENAI_API_KEY` |
| Anthropic | `claude-sonnet-4-5-20250929` | `VITE_ANTHROPIC_API_KEY` |

Override the model with `VITE_MODEL=your-model-id` if needed.

## Batch Mode (Fabrication)

Process hundreds of images with the same creative settings via CLI.

```bash
# 1. Complete the wizard in the UI and click "Save Config"
#    → exports cinelab-config.json

# 2. Run batch processing
npm run fabrication -- ./photos

# Options
npm run fabrication -- ./photos --config ./custom-config.json
npm run fabrication -- ./photos --concurrency 5
```

- Reads `cinelab-config.json` for creative settings (camera, lens, artist, lighting)
- Processes every `.jpg`, `.png`, `.webp` in the target folder
- Outputs `Prompts/{filename}.json` next to the source images
- Parallel execution with `--concurrency` (1–10, default: 3)
- Logs progress: `[12/235] photo.jpg -> OK`

## Equipment Library

The built-in `library.json` contains:

| Category | Count | Examples |
|----------|-------|---------|
| Camera Bodies | 23 | ARRI ALEXA Mini LF, RED V-RAPTOR, Sony VENICE 2, Hasselblad X2D |
| Lenses | 14 | Cooke S7/i, Zeiss Supreme Prime, Leica Summilux-M |
| Genres | 7 | Fashion, Cinematic, Fine Art Nude, Automotive, Product/Still Life, Sports, Architecture |
| Photographers | 57 | Roger Deakins, Mario Testino, Tim Walker, Annie Leibovitz, Peter Lindbergh |
| Lighting Presets | 12 | Rembrandt, Butterfly, Split, Loop, Broad, Short, Natural |

## Architecture

```
src/
├── engine/                     # AI-agnostic core — no UI dependency
│   ├── run.ts                  # Single entry point: runCineEngine()
│   ├── prompt-builder.ts       # Builds the DP prompt from wizard state
│   ├── response-schema.ts      # Universal JSON Schema for the recipe
│   ├── provider-types.ts       # CineProvider interface + CineRequest
│   ├── provider-config.ts      # Auto-detect provider from env
│   ├── validation.ts           # Input validation
│   ├── utils.ts                # fileToBase64 helper
│   └── providers/
│       ├── gemini.ts           # Gemini REST adapter
│       ├── openai.ts           # OpenAI Chat adapter
│       └── anthropic.ts        # Anthropic Messages adapter
├── components/                 # React UI
│   ├── WizardShell.tsx         # Main wizard container
│   ├── StepIndicator.tsx       # 5-step progress bar
│   ├── useWizardReducer.ts     # useReducer state management
│   ├── StepReference.tsx       # Step 1: image upload
│   ├── StepEquipment.tsx       # Step 2: camera/lens/f-stop/ISO
│   ├── StepArtDirection.tsx    # Step 3: genre/artist/notes
│   ├── StepLighting.tsx        # Step 4: lighting/aspect ratio
│   ├── LightControls.tsx       # Per-light sliders (pan/tilt/intensity)
│   ├── StepOutput.tsx          # Step 5: generate + display recipe
│   ├── ErrorBoundary.tsx       # Branded error fallback
│   └── ui/                     # Shared UI primitives
│       ├── ImageUpload.tsx
│       ├── SelectCard.tsx
│       ├── InfoBox.tsx
│       └── OptionPill.tsx
├── types/
│   ├── wizard.ts               # WizardState, WizardAction, step config
│   ├── library.ts              # Camera, Lens, Photographer types
│   └── batch-config.ts         # Serializable config for CLI
├── data/
│   ├── library.json            # Equipment + photographer catalog
│   └── useLibrary.ts           # JSON loader hook
├── App.tsx
├── main.tsx
└── index.css                   # Tailwind + Kraftreich design tokens
```

**Design principle:** The `engine/` layer has zero React dependency. If the UI framework changes, the engine stays untouched.

## Key Design Decisions

### Adapter Pattern for AI Providers

Every provider implements the same `CineProvider` interface:

```typescript
interface CineProvider {
  readonly name: string
  generate(request: CineRequest, config: ProviderConfig): Promise<string>
}
```

The universal `CineResponseSchema` is converted to each provider's native format:
- **Gemini** → `responseSchema` with uppercase type names
- **OpenAI** → `response_format.json_schema`
- **Anthropic** → `tool_use` with `input_schema`

### Enforced JSON Schema

The response schema locks every key name, nesting level, and type. This eliminates the inconsistency problem where AI models generate different key names on every run (`lens_specs` vs `lens_profile` vs `lens_specifications`).

### Prompt Engineering

The prompt builder produces a structured DP brief with:
- **Gender Lock** — preserves subject identity regardless of clothing
- **Framing Analysis** — detects close-up / portrait / half-body / full-body from the reference
- **Pose Override** — when switching to studio, replaces environment-dependent poses with free-standing editorial poses
- **Equipment Invisibility** — hard rule that no studio gear appears in the final image

## Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run start-engine` | Dev server + open browser |
| `npm run stop-engine` | Kill process on port 3000 |
| `npm run fabrication -- <folder>` | Batch process images |
| `npm run stop-fabrication` | Kill running fabrication |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_API_KEY` | One of three | Google Gemini API key |
| `VITE_OPENAI_API_KEY` | One of three | OpenAI API key |
| `VITE_ANTHROPIC_API_KEY` | One of three | Anthropic API key |
| `VITE_PROVIDER` | No | Force a specific provider (`gemini` / `openai` / `anthropic`) |
| `VITE_MODEL` | No | Override the default model ID |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| Styling | Tailwind CSS v4 |
| Fonts | Warbler (headlines) + Avenir (body) |
| CLI Runtime | tsx (for batch scripts) |
| Linter | ESLint 9 |

## Roadmap

Planned features and improvements for future releases:

| Feature | Description | Status |
|---------|------------|--------|
| **New AI Providers** | Mistral, Grok, and local model support (Ollama) | Planned |
| **IDE Plugins** | Native extensions for VS Code, Cursor, and Antigravity — run Cinelab directly from the editor sidebar | Planned |
| **Video Support** | Analyze video clips frame-by-frame to generate time-coded cinematography recipes across scenes | Planned |
| **Extended Library** | More camera bodies, anamorphic lenses, vintage glass, and an expanded photographer roster covering street, documentary, and editorial genres | Planned |
| **Recipe Preview** | Visual preview of the generated recipe — simulated lighting diagram + mood board before export | Planned |
| **Collaborative Configs** | Share and import `cinelab-config.json` presets across teams | Planned |

