import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const bedrift = useQuery({
    queryKey: ['bedrift'],
    queryFn: () => fetchBedrift(session?.user?.bedriftId as string),
  })
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    bedrift: bedrift.data,
  }
}

function fetchBedrift(bedriftId: string): any {
    throw new Error('Function not implemented.')
}
