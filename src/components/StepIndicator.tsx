import { WizardStep, WIZARD_STEP_LABELS } from '../types/wizard'
import type { WizardState } from '../types/wizard'
import { isStepComplete, canNavigateToStep } from '../engine/validation'

interface StepIndicatorProps {
  state: WizardState
  onStepClick: (step: WizardStep) => void
}

const STEPS = [
  WizardStep.Reference,
  WizardStep.Equipment,
  WizardStep.ArtDirection,
  WizardStep.Lighting,
  WizardStep.Output,
]

export function StepIndicator({ state, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const isCurrent = state.currentStep === step
        const isCompleted = isStepComplete(state, step)
        const isAccessible = canNavigateToStep(state, step)

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => isAccessible && onStepClick(step)}
              disabled={!isAccessible}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-default text-sm font-medium
                uppercase tracking-wider transition-all duration-200
                ${isCurrent
                  ? 'bg-ash text-obsidian'
                  : isCompleted
                    ? 'bg-obsidian text-bone border border-ash/30 hover:border-ash/60'
                    : isAccessible
                      ? 'bg-obsidian text-ash/50 border border-ash/10 hover:border-ash/30'
                      : 'bg-obsidian text-ash/20 cursor-not-allowed'
                }
              `}
            >
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isCurrent
                  ? 'bg-obsidian text-bone'
                  : isCompleted
                    ? 'bg-ash/20 text-ash'
                    : 'bg-ash/5 text-ash/30'
                }
              `}>
                {isCompleted && !isCurrent ? '\u2713' : idx + 1}
              </span>

              <span className={`${isCurrent ? '' : 'hidden md:inline'}`}>
                {WIZARD_STEP_LABELS[step]}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className={`
                w-6 h-px mx-1
                ${isCompleted ? 'bg-ash/40' : 'bg-ash/10'}
              `} />
            )}
          </div>
        )
      })}
    </nav>
  )
}
