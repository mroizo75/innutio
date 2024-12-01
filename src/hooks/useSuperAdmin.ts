import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useSuperAdmin() {
  const queryClient = useQueryClient()

  const { data: bedrifter, isLoading: bedrifterLoading } = useQuery({
    queryKey: ['bedrifter'],
    queryFn: async () => {
      const response = await fetch('/api/superadmin/bedrifter')
      if (!response.ok) throw new Error('Kunne ikke hente bedrifter')
      return response.json()
    }
  })

  const leggTilSupportLogg = useMutation({
    mutationFn: async (data: { 
      bedriftId: string
      type: string
      beskrivelse: string 
    }) => {
      const response = await fetch("/api/superadmin/support-logg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error()
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bedrifter'] })
      toast.success("Support-hendelse lagt til")
    },
    onError: () => {
      toast.error("Kunne ikke legge til support-hendelse")
    }
  })

  const leggTilStoffkartotek = useMutation({
    mutationFn: async (data: {
      bedriftId: string
      produktnavn: string
      beskrivelse: string
      faremerking: string
      bruksomrade: string
      forholdsregler: string
    }) => {
      const response = await fetch("/api/superadmin/stoffkartotek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error()
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bedrifter'] })
      toast.success("Stoffkartotek lagt til")
    },
    onError: () => {
      toast.error("Kunne ikke legge til stoffkartotek")
    }
  })

  return {
    bedrifter,
    bedrifterLoading,
    leggTilSupportLogg: leggTilSupportLogg.mutate,
    leggTilStoffkartotek: leggTilStoffkartotek.mutate
  }
}