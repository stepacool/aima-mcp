import type { Action } from '@/lib/backend-client'

interface ActionCardProps {
  action: Action
  selected: boolean
  disabled: boolean
  onToggle: () => void
}

export function ActionCard({ action, selected, disabled, onToggle }: ActionCardProps) {
  return (
    <div
      onClick={() => !disabled && onToggle()}
      className={`bg-slate-900 rounded-xl p-4 border cursor-pointer transition-all
        ${selected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-400'}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          className="w-4 h-4"
        />
        <span className="font-semibold text-indigo-400 font-mono">{action.name}</span>
        {action.auth_required && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-semibold">
            Auth Required
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-3">{action.description}</p>
      {action.parameters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {action.parameters.map((p) => (
            <span
              key={p.name}
              className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400 font-mono"
            >
              {p.name}: {p.type || 'string'}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
