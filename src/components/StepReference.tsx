import type { WizardState, WizardAction } from '../types/wizard'
import { ImageUpload } from './ui/ImageUpload'

interface StepReferenceProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

export function StepReference({ state, dispatch }: StepReferenceProps) {
  const handleUpload = (file: File, preview: string) => {
    dispatch({ type: "SET_REFERENCE", file, preview })
  }

  const handleClear = () => {
    dispatch({ type: "CLEAR_REFERENCE" })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h2 className="font-warbler text-3xl text-bone mb-2">Reference</h2>
          <p className="text-ash/60 text-sm">
            Upload the image you want to recreate. This will be analyzed for subject,
            pose, clothing, and environment.
          </p>
        </div>

        <ImageUpload
          preview={state.referencePreview}
          onUpload={handleUpload}
          onClear={handleClear}
        />

        {!state.referenceImage && (
          <div className="mt-6 border border-ash/10 rounded-default p-4">
            <p className="text-ash/40 text-xs leading-relaxed">
              <span className="text-ash/60 font-medium">Tip:</span> For best results,
              upload a clear, well-lit photograph with a single subject. The reference
              determines the subject identity, pose, and environment that will be
              preserved in the final prompt.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
