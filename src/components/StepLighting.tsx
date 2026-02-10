import { useEffect } from 'react'
import type { WizardState, WizardAction } from '../types/wizard'
import type { Library, LightingCategory } from '../types/library'
import { ASPECT_RATIO_OPTIONS } from '../types/wizard'
import type { AspectRatio } from '../types/wizard'
import { SelectCard } from './ui/SelectCard'
import { InfoBox } from './ui/InfoBox'
import { LightControls } from './LightControls'

interface StepLightingProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  lib: Library
}

export function StepLighting({ state, dispatch, lib }: StepLightingProps) {
  const categories: LightingCategory[] = ["Studio", "Outdoor"]
  const presets = Object.keys(lib.lighting_presets[state.lightingCategory]).sort()
  const selectedPresetInfo = state.lightingScenario
    ? lib.lighting_presets[state.lightingCategory][state.lightingScenario]
    : null

  const hasCustomControls =
    state.lightingScenario === "Low Key Lighting" ||
    state.lightingScenario === "Custom Studio Lights"

  useEffect(() => {
    if (state.lightingScenario && !hasCustomControls) {
      dispatch({
        type: "SET_LIGHT_SPECS",
        specs: `Preset: ${state.lightingScenario}.`,
      })
    }
  }, [state.lightingScenario, hasCustomControls, dispatch])

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 shrink-0">
        <h2 className="font-warbler text-3xl text-bone mb-2">Lighting</h2>
        <p className="text-ash/60 text-sm">
          Define the lighting environment. Studio setups offer precise control;
          outdoor presets capture natural conditions.
        </p>
      </div>

      {/* Category toggle */}
      <div className="mb-4 shrink-0">
        <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-2 pb-1 border-b border-ash/10">
          Category
        </h3>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch({ type: "SET_LIGHTING_CATEGORY", category: cat })}
              className={`
                flex-1 py-2.5 rounded-default text-sm font-bold uppercase tracking-wider
                transition-all duration-150
                ${state.lightingCategory === cat
                  ? 'bg-ash text-obsidian'
                  : 'bg-obsidian text-ash/40 border border-ash/10 hover:border-ash/30'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column content */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        {/* Col 1: Scenario */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Scenario
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
            {presets.map((preset) => (
              <SelectCard
                key={preset}
                label={preset}
                description={lib.lighting_presets[state.lightingCategory][preset].info}
                isSelected={state.lightingScenario === preset}
                onClick={() => dispatch({ type: "SET_LIGHTING_SCENARIO", scenario: preset })}
              />
            ))}
          </div>
          {selectedPresetInfo && (
            <div className="shrink-0 mt-2">
              <InfoBox>
                <strong>{state.lightingScenario}</strong> — {selectedPresetInfo.info}
                <br />Result: {selectedPresetInfo.result}
              </InfoBox>
            </div>
          )}
        </div>

        {/* Col 2: Controls */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Controls
          </h3>
          <div className="flex-1 min-h-0">
            {hasCustomControls ? (
              <LightControls
                scenario={state.lightingScenario!}
                lightSpecs={state.lightSpecs}
                onChange={(specs) => dispatch({ type: "SET_LIGHT_SPECS", specs })}
              />
            ) : state.lightingScenario ? (
              <div className="border border-ash/10 rounded-card p-6 text-center">
                <p className="text-ash/40 text-sm">
                  Using standard <strong className="text-ash/60">{state.lightingScenario}</strong> preset.
                </p>
                <p className="text-ash/30 text-xs mt-1">No custom controls needed.</p>
              </div>
            ) : (
              <div className="border border-dashed border-ash/10 rounded-card p-6 text-center">
                <p className="text-ash/30 text-sm">Select a scenario first</p>
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Aspect Ratio */}
        <div className="flex flex-col">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Aspect Ratio
          </h3>
          <div className="flex flex-col gap-2">
            {ASPECT_RATIO_OPTIONS.map((ratio) => (
              <button
                key={ratio}
                onClick={() => dispatch({ type: "SET_ASPECT_RATIO", ratio: ratio as AspectRatio })}
                className={`
                  w-full py-2.5 rounded-default text-sm font-bold
                  transition-all duration-150
                  ${state.aspectRatio === ratio
                    ? 'bg-ash text-obsidian'
                    : 'bg-obsidian text-ash/40 border border-ash/10 hover:border-ash/30'
                  }
                `}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
