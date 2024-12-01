import { SupportStatus, getStatusConfig } from '@/lib/utils/supportStatus'

interface StatusBadgeProps {
  status: SupportStatus
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { color, text } = getStatusConfig(status)
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  )
}