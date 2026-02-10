interface InfoBoxProps {
  children: React.ReactNode
}

export function InfoBox({ children }: InfoBoxProps) {
  return (
    <div className="border border-ash/10 rounded-default px-4 py-3 mt-3">
      <p className="text-ash/50 text-xs leading-relaxed">{children}</p>
    </div>
  )
}
