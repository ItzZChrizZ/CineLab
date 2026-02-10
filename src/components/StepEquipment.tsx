import type { WizardState, WizardAction } from '../types/wizard'
import type { Library } from '../types/library'
import { F_STOP_OPTIONS, ISO_OPTIONS } from '../types/wizard'
import type { FStop, ISO } from '../types/wizard'
import { SelectCard } from './ui/SelectCard'
import { InfoBox } from './ui/InfoBox'
import { OptionPill } from './ui/OptionPill'

interface StepEquipmentProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  lib: Library
}

export function StepEquipment({ state, dispatch, lib }: StepEquipmentProps) {
  const cameras = Object.keys(lib.cameras).sort()
  const lenses = Object.keys(lib.lenses).sort()

  const selectedCamInfo = state.camera ? lib.cameras[state.camera] : null
  const selectedLensInfo = state.lens ? lib.lenses[state.lens] : null

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="font-warbler text-3xl text-bone mb-2">Equipment</h2>
        <p className="text-ash/60 text-sm">
          Select camera body and lens. Each combination produces a distinct
          optical character and sensor DNA.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        {/* Col 1: Camera Body */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Camera Body
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
            {cameras.map((cam) => (
              <SelectCard
                key={cam}
                label={cam}
                description={lib.cameras[cam].info}
                isSelected={state.camera === cam}
                onClick={() => dispatch({ type: "SET_CAMERA", camera: cam })}
              />
            ))}
          </div>
          {selectedCamInfo && (
            <div className="shrink-0 mt-2">
              <InfoBox>
                <strong>{state.camera}</strong> — {selectedCamInfo.info} | Vibe: {selectedCamInfo.vibe}
              </InfoBox>
            </div>
          )}
        </div>

        {/* Col 2: Lens */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Lens
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
            {lenses.map((lens) => (
              <SelectCard
                key={lens}
                label={lens}
                description={lib.lenses[lens].info}
                isSelected={state.lens === lens}
                onClick={() => dispatch({ type: "SET_LENS", lens })}
              />
            ))}
          </div>
          {selectedLensInfo && (
            <div className="shrink-0 mt-2">
              <InfoBox>
                <strong>{state.lens}</strong> — {selectedLensInfo.info} | Character: {selectedLensInfo.character}
              </InfoBox>
            </div>
          )}
        </div>

        {/* Col 3: F-Stop + ISO */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10">
              F-Stop
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {F_STOP_OPTIONS.map((f) => (
                <OptionPill
                  key={f}
                  label={f}
                  isSelected={state.fStop === f}
                  onClick={() => dispatch({ type: "SET_FSTOP", fStop: f as FStop })}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10">
              ISO
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ISO_OPTIONS.map((iso) => (
                <OptionPill
                  key={iso}
                  label={iso}
                  isSelected={state.iso === iso}
                  onClick={() => dispatch({ type: "SET_ISO", iso: iso as ISO })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
