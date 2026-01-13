interface WizardProgressProps {
  currentStep: number
}

const steps = [
  { num: 1, label: 'Describe' },
  { num: 2, label: 'Actions' },
  { num: 3, label: 'Auth' },
  { num: 4, label: 'Deploy' },
]

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                ${
                  step.num < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.num === currentStep
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 border-2'
                }`}
            >
              {step.num < currentStep ? '✓' : step.num}
            </div>
            <span
              className={`text-xs ${step.num === currentStep ? 'text-white font-medium' : 'text-slate-500'}`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-slate-600 mx-2 mb-6" />
          )}
        </div>
      ))}
    </div>
  )
}
