interface WizardProgressIndicatorProps {
  text?: string
  variant?: 'inline' | 'badge' | 'bar'
  className?: string
}

export function WizardProgressIndicator({
  text = 'Processing...',
  variant = 'inline',
  className = '',
}: WizardProgressIndicatorProps) {
  // Inline variant: Small spinner with text next to it
  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${className}`}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        <div
          className="w-4 h-4 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span className="text-slate-400">{text}</span>
      </div>
    )
  }

  // Badge variant: Compact status badge
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm ${className}`}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        <div
          className="w-3 h-3 border-2 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span className="text-indigo-300 font-medium">{text}</span>
      </div>
    )
  }

  // Bar variant: Progress bar style
  if (variant === 'bar') {
    return (
      <div
        className={`w-full ${className}`}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{text}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '100%' }} />
        </div>
      </div>
    )
  }

  return null
}
