import { useState, useEffect, useCallback } from 'react'

interface LightControlsProps {
  scenario: string
  lightSpecs: string
  onChange: (specs: string) => void
}

interface LightUnit {
  pan: number
  tilt: number
  color: string
  power: number
}

const PAN_SNAPS = [0, 30, 45, 60, 90, 120, 135, 150, 180].flatMap(v => v === 0 ? [0] : [-v, v]).sort((a, b) => a - b)
const TILT_SNAPS = [0, 30, 45, 60, 90].flatMap(v => v === 0 ? [0] : [-v, v]).sort((a, b) => a - b)

function snapTo(value: number, snaps: number[]): number {
  let closest = snaps[0]
  let minDist = Math.abs(value - closest)
  for (const s of snaps) {
    const dist = Math.abs(value - s)
    if (dist < minDist) { closest = s; minDist = dist }
  }
  return closest
}

function panLabel(v: number): string {
  if (v === 0) return "C"
  return v < 0 ? `L ${Math.abs(v)}°` : `R ${v}°`
}

function tiltLabel(v: number): string {
  if (v === 0) return "C"
  return v < 0 ? `D ${Math.abs(v)}°` : `U ${v}°`
}

export function LightControls({ scenario, onChange }: LightControlsProps) {
  const isLowKey = scenario === "Low Key Lighting"

  const [useStandard, setUseStandard] = useState(true)
  const [darkness, setDarkness] = useState(80)
  const [lowKeyLight, setLowKeyLight] = useState<LightUnit>({
    pan: 0, tilt: 45, color: "#FFFFFF", power: 80,
  })

  const [useStandardCustom, setUseStandardCustom] = useState(true)
  const [activeLights, setActiveLights] = useState(3)
  const [activeTab, setActiveTab] = useState(0)
  const [lights, setLights] = useState<LightUnit[]>([
    { pan: 0, tilt: 45, color: "#FFFFFF", power: 80 },
    { pan: -45, tilt: 30, color: "#FFFFFF", power: 60 },
    { pan: 45, tilt: 30, color: "#FFFFFF", power: 40 },
  ])

  const buildSpecs = useCallback(() => {
    if (isLowKey) {
      if (useStandard) return "Standard Low Key Setup."
      return `Low Key Mode (${darkness}% darkness). L1: ${lowKeyLight.color}, ${lowKeyLight.power}% power at Pan:${lowKeyLight.pan}, Tilt:${lowKeyLight.tilt}`
    } else {
      if (useStandardCustom) return "Standard Balanced 3-Point Studio Setup."
      return lights
        .slice(0, activeLights)
        .map((l, i) => `L${i + 1}: ${l.color} ${l.power}% power at Pan:${l.pan}, Tilt:${l.tilt}`)
        .join(" | ")
    }
  }, [isLowKey, useStandard, darkness, lowKeyLight, useStandardCustom, activeLights, lights])

  useEffect(() => {
    onChange(buildSpecs())
  }, [buildSpecs, onChange])

  const updateLight = (idx: number, field: keyof LightUnit, value: number | string) => {
    setLights((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))
  }

  const isStandard = isLowKey ? useStandard : useStandardCustom

  return (
    <div className="h-full flex flex-col">
      <label className="flex items-center gap-2 mb-4 cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={isStandard}
          onChange={(e) => isLowKey ? setUseStandard(e.target.checked) : setUseStandardCustom(e.target.checked)}
          className="accent-ash"
        />
        <span className="text-sm text-ash/60">Use standard setup</span>
      </label>

      {!isStandard && (
        <div className="flex-1 min-h-0 flex flex-col">
          {isLowKey ? (
            /* Low Key — single light, spread out */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <SliderRow label="Darkness" value={darkness} min={0} max={100} suffix="%"
                  onChange={setDarkness} />
                <SliderRow label="Pan" value={lowKeyLight.pan} min={-180} max={180}
                  display={panLabel(lowKeyLight.pan)}
                  onChange={(v) => setLowKeyLight((p) => ({ ...p, pan: snapTo(v, PAN_SNAPS) }))} />
                <SliderRow label="Tilt" value={lowKeyLight.tilt} min={-90} max={90}
                  display={tiltLabel(lowKeyLight.tilt)}
                  onChange={(v) => setLowKeyLight((p) => ({ ...p, tilt: snapTo(v, TILT_SNAPS) }))} />
                <SliderRow label="Power" value={lowKeyLight.power} min={0} max={100} suffix="%"
                  onChange={(v) => setLowKeyLight((p) => ({ ...p, power: v }))} />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ash/40 w-14 shrink-0">Color</span>
                  <input type="color" value={lowKeyLight.color}
                    onChange={(e) => setLowKeyLight((p) => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 rounded border-0 cursor-pointer" />
                </div>
              </div>
            </div>
          ) : (
            /* Custom Studio — tab per light */
            <div className="flex-1 flex flex-col">
              {/* Light count + tab bar */}
              <div className="shrink-0 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-ash/40">Active:</span>
                  {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => {
                      setActiveLights(n)
                      if (activeTab >= n) setActiveTab(n - 1)
                    }}
                      className={`w-7 h-7 rounded-sm text-xs font-bold transition-all duration-150 ${
                        activeLights === n
                          ? 'bg-ash text-obsidian'
                          : 'border border-ash/10 text-ash/40 hover:border-ash/30'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  {Array.from({ length: activeLights }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`
                        flex-1 py-2 rounded-default text-xs font-bold uppercase tracking-wider
                        transition-all duration-150
                        ${activeTab === i
                          ? 'bg-ash text-obsidian'
                          : 'border border-ash/10 text-ash/40 hover:border-ash/30'
                        }
                      `}
                    >
                      Light {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active light controls — fill remaining space */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <SliderRow label="Pan" value={lights[activeTab].pan} min={-180} max={180}
                    display={panLabel(lights[activeTab].pan)}
                    onChange={(v) => updateLight(activeTab, 'pan', snapTo(v, PAN_SNAPS))} />
                  <SliderRow label="Tilt" value={lights[activeTab].tilt} min={-90} max={90}
                    display={tiltLabel(lights[activeTab].tilt)}
                    onChange={(v) => updateLight(activeTab, 'tilt', snapTo(v, TILT_SNAPS))} />
                  <SliderRow label="Power" value={lights[activeTab].power} min={0} max={100} suffix="%"
                    onChange={(v) => updateLight(activeTab, 'power', v)} />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ash/40 w-14 shrink-0">Color</span>
                    <input type="color" value={lights[activeTab].color}
                      onChange={(e) => updateLight(activeTab, 'color', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SliderRow({ label, value, min, max, suffix, display, onChange }: {
  label: string; value: number; min: number; max: number; suffix?: string;
  display?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ash/40 w-14 shrink-0">{label}</span>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-ash h-1.5" />
      <span className="text-xs text-ash/60 w-14 text-right font-medium">{display ?? `${value}${suffix ?? ''}`}</span>
    </div>
  )
}
