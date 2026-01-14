interface LoadingOverlayProps {
  text?: string
}

export function LoadingOverlay({
  text = 'Processing...',
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-50">
      <div className="w-12 h-12 border-3 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
      <p className="mt-4 text-slate-400">{text}</p>
    </div>
  )
}
