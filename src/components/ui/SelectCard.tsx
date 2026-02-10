interface SelectCardProps {
  label: string
  description?: string
  secondaryText?: string
  isSelected: boolean
  onClick: () => void
}

export function SelectCard({
  label,
  description,
  secondaryText,
  isSelected,
  onClick,
}: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-default
        border transition-all duration-150
        ${isSelected
          ? 'bg-ash text-obsidian border-ash'
          : 'bg-obsidian text-bone border-ash/10 hover:border-ash/30'
        }
      `}
    >
      <span className="text-sm font-medium block">{label}</span>
      {description && (
        <span className={`text-xs block mt-0.5 ${isSelected ? 'text-obsidian/60' : 'text-ash/40'}`}>
          {description}
        </span>
      )}
      {secondaryText && (
        <span className={`text-xs block mt-0.5 italic ${isSelected ? 'text-obsidian/50' : 'text-ash/30'}`}>
          {secondaryText}
        </span>
      )}
    </button>
  )
}
