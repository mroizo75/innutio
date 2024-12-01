import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface SupportLogg {
  id: string
  type: string
  beskrivelse: string
  opprettetAv: string
  createdAt: string
  bedrift: {
    id: string
    navn: string
  }
  superAdmin?: { 
    navn: string
    etternavn: string 
  } | null
  user?: { 
    navn: string 
  } | null
}

export function useSupportLogg(bedriftId: string) {
  const queryClient = useQueryClient()

  const { data: supportLogger, isLoading } = useQuery<SupportLogg[]>({
    queryKey: ['supportLogg', bedriftId],
    queryFn: async () => {
      const response = await fetch(`/api/superadmin/support-logg?bedriftId=${bedriftId}`)
      if (!response.ok) throw new Error('Kunne ikke hente support-logger')
      const data = await response.json()
      return data.map((logg: any) => ({
        ...logg,
        createdAt: logg.createdAt.toString()
      }))
    }
  })

  const { mutate: leggTilSupportLogg } = useMutation({
    mutationFn: async (data: { type: string; beskrivelse: string }) => {
      const response = await fetch("/api/superadmin/support-logg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedriftId,
          ...data,
        }),
      })
      if (!response.ok) throw new Error()
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportLogg', bedriftId] })
      toast.success("Support-hendelse lagt til")
    },
    onError: () => {
      toast.error("Kunne ikke legge til support-hendelse")
    }
  })

  return {
    supportLogger,
    isLoading,
    leggTilSupportLogg
  }
}