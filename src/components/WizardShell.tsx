import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { WizardState } from '../types/wizard'
import { WizardStep } from '../types/wizard'
import { StepIndicator } from './StepIndicator'
import { isStepComplete } from '../engine/validation'

interface WizardShellProps {
  state: WizardState
  onStepClick: (step: WizardStep) => void
  onNext: () => void
  onBack: () => void
  children: ReactNode
}

export function WizardShell({
  state,
  onStepClick,
  onNext,
  onBack,
  children,
}: WizardShellProps) {
  const isFirst = state.currentStep === WizardStep.Reference
  const isLast = state.currentStep === WizardStep.Output
  const canProceed = isStepComplete(state, state.currentStep)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed && !isLast) {
        onNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canProceed, isLast, onNext])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-obsidian text-bone">
      <div className="w-full max-w-6xl mx-auto px-8 flex flex-col h-full">
        {/* Header */}
        <header className="border-l-4 border-ash pl-3 mt-6 mb-4 shrink-0">
          <h1 className="font-avenir text-ash font-black text-base uppercase tracking-[4px]">
            Cinelab Pro
            <span className="text-[0.5rem] opacity-50 font-light ml-2">
              | Prompt Generator v4.0
            </span>
          </h1>
        </header>

        {/* Step Indicator */}
        <div className="shrink-0 mb-4">
          <StepIndicator state={state} onStepClick={onStepClick} />
        </div>

        {/* Step Content */}
        <main className="flex-1 min-h-0 overflow-hidden" key={state.currentStep}>
          <div className="step-enter h-full">
            {children}
          </div>
        </main>

        {/* Navigation */}
        <footer className="shrink-0 py-4 flex items-center justify-between">
          {!isFirst ? (
            <button
              onClick={onBack}
              className="
                px-6 py-3 rounded-default text-sm font-medium uppercase tracking-wider
                border border-ash/20 text-ash/60 hover:text-bone hover:border-ash/40
                transition-all duration-200
              "
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {!isLast && (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`
                px-8 py-3 rounded-default text-sm font-bold uppercase tracking-wider
                transition-all duration-200
                ${canProceed
                  ? 'bg-ash text-obsidian hover:opacity-90'
                  : 'bg-ash/10 text-ash/20 cursor-not-allowed'
                }
              `}
            >
              Next
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
