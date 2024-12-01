import { useQuery } from "@tanstack/react-query"

export function useAdminData() {
  return useQuery({
    queryKey: ['adminData'],
    queryFn: async () => {
      const response = await fetch('/api/admin')
      if (!response.ok) {
        throw new Error('Kunne ikke hente admin data')
      }
      return response.json()
    }
  })
}