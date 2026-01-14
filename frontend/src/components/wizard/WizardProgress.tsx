interface WizardProgressProps {
  currentStep: number
  loadingStep?: number | null
}

const steps = [
  { num: 1, label: 'Describe' },
  { num: 2, label: 'Actions' },
  { num: 3, label: 'Auth' },
  { num: 4, label: 'Deploy' },
]

export function WizardProgress({ currentStep, loadingStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-label={`Wizard progress: step ${currentStep} of 4`}>
      {steps.map((step, idx) => {
        const isCompleted = step.num < currentStep
        const isCurrent = step.num === currentStep
        const isLoading = loadingStep === step.num
        
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all relative
                  ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-400 border-2'
                  }`}
                aria-label={isLoading ? `Loading ${step.label}` : isCompleted ? `Completed ${step.label}` : isCurrent ? `Current step: ${step.label}` : step.label}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : isCompleted ? (
                  '✓'
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-xs transition-colors ${isCurrent ? 'text-white font-medium' : 'text-slate-500'}`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div 
                className={`w-16 h-0.5 mx-2 mb-6 transition-colors ${
                  step.num < currentStep ? 'bg-green-500' : 'bg-slate-600'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
