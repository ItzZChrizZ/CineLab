import { useEffect, useMemo, useRef, useState } from 'react'
import type { WizardState, WizardAction } from '../types/wizard'
import type { Library } from '../types/library'
import type { BatchConfig } from '../types/batch-config'
import { buildPrompt } from '../engine/prompt-builder'
import { runCineEngine } from '../engine/run'

interface StepOutputProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  lib: Library
}

export function StepOutput({ state, dispatch, lib }: StepOutputProps) {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (loading) {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading])

  const prompt = useMemo(() => buildPrompt(state, lib), [state, lib])

  const handleGenerate = async () => {
    if (!state.referenceImage) return
    setLoading(true)
    setError(null)
    try {
      const json = await runCineEngine(prompt, state.referenceImage)
      setResult(json)
      dispatch({ type: "SET_GENERATED_PROMPT", prompt: json })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clipboard access denied")
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cinelab-recipe-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveConfig = () => {
    const config: BatchConfig = {
      camera: state.camera ?? '',
      lens: state.lens ?? '',
      fStop: state.fStop,
      iso: state.iso,
      genre: state.genre ?? '',
      artist: state.artist ?? '',
      notes: state.notes,
      lightingCategory: state.lightingCategory,
      lightingScenario: state.lightingScenario ?? '',
      lightSpecs: state.lightSpecs,
      aspectRatio: state.aspectRatio,
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cinelab-config.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    dispatch({ type: "RESET" })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="font-warbler text-3xl text-bone mb-2">Output</h2>
        <p className="text-ash/60 text-sm">
          Review your selections, then generate the JSON recipe via AI.
        </p>
      </div>

      {/* Summary + Reference row */}
      <div className="shrink-0 mb-4 flex gap-6 items-start">
        <div className="flex-1 grid grid-cols-4 gap-3">
          <SummaryCard label="Camera" value={state.camera} />
          <SummaryCard label="Lens" value={state.lens} />
          <SummaryCard label="Aperture" value={state.fStop} />
          <SummaryCard label="ISO" value={state.iso} />
          <SummaryCard label="Genre" value={state.genre} />
          <SummaryCard label="Artist" value={state.artist} />
          <SummaryCard label="Lighting" value={state.lightingScenario} />
          <SummaryCard label="Ratio" value={state.aspectRatio} />
        </div>
        {state.referencePreview && (
          <img
            src={state.referencePreview}
            alt="Reference"
            className="h-20 object-contain rounded-default shrink-0"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="shrink-0 border border-ash/20 rounded-default p-4">
          <p className="text-bone text-sm">Error: {error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="shrink-0 mb-4 h-1 rounded-full bg-ash loading-pulse" />
      )}

      {/* Action buttons */}
      <div className="shrink-0 flex gap-3">
        {/* Primary: Generate or Copy */}
        <button
          onClick={result ? handleCopy : handleGenerate}
          disabled={loading}
          className={`
            flex-1 py-3 rounded-default text-sm font-bold uppercase tracking-wider
            transition-all duration-150
            ${loading
              ? 'bg-ash/20 text-ash/40 cursor-wait'
              : copied
                ? 'bg-bone text-obsidian'
                : 'bg-ash text-obsidian hover:opacity-90'
            }
          `}
        >
          {loading ? `Generating... ${elapsed}s` : result ? (copied ? "Copied!" : "Copy JSON") : "Generate"}
        </button>

        <button
          onClick={handleDownload}
          disabled={!result}
          className={`
            flex-1 py-3 rounded-default text-sm font-bold uppercase tracking-wider
            transition-all duration-150
            ${result
              ? 'bg-ash text-obsidian hover:opacity-90'
              : 'bg-ash/10 text-ash/20 cursor-not-allowed'
            }
          `}
        >
          Download
        </button>

        <button
          onClick={handleGenerate}
          disabled={!result || loading}
          className={`
            px-6 py-3 rounded-default text-sm font-medium uppercase tracking-wider
            transition-all duration-150
            ${result
              ? 'border border-ash/20 text-ash/60 hover:text-bone hover:border-ash/40'
              : 'border border-ash/5 text-ash/15 cursor-not-allowed'
            }
          `}
        >
          Regenerate
        </button>

        <button
          onClick={handleSaveConfig}
          className="
            px-6 py-3 rounded-default text-sm font-medium uppercase tracking-wider
            border border-ash/20 text-ash/60 hover:text-bone hover:border-ash/40
            transition-all duration-150
          "
        >
          Save Config
        </button>

        <button
          onClick={handleReset}
          className="
            px-6 py-3 rounded-default text-sm font-medium uppercase tracking-wider
            border border-ash/20 text-ash/60 hover:text-bone hover:border-ash/40
            transition-all duration-150
          "
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border border-ash/10 rounded-default px-3 py-2">
      <p className="text-ash/40 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-bone text-sm font-medium truncate">{value ?? "\u2014"}</p>
    </div>
  )
}
