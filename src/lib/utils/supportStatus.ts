export const supportStatusMap = {
    OPEN: 'Åpen',
    IN_PROGRESS: 'Under behandling',
    RESOLVED: 'Løst',
    REJECTED: 'Avvist'
  } as const
  
  export type SupportStatus = keyof typeof supportStatusMap
  
  export const getStatusText = (status: SupportStatus) => supportStatusMap[status]
  
  export const getStatusConfig = (status: SupportStatus) => {
    const configs = {
      OPEN: { color: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800' },
      RESOLVED: { color: 'bg-green-100 text-green-800' },
      REJECTED: { color: 'bg-red-100 text-red-800' }
    }
    return {
      color: configs[status].color,
      text: supportStatusMap[status]
    }
  }