"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface StatusEndringProps {
  skjemaId: string
  currentStatus: string
}

export function StatusEndring({ skjemaId, currentStatus }: StatusEndringProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusEndring = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sja/${skjemaId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke oppdatere status")
      }

      toast.success("Status oppdatert")
      router.refresh()
    } catch (error) {
      toast.error("Kunne ikke oppdatere status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Velg status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Ubehandlet">Ubehandlet</SelectItem>
          <SelectItem value="Under behandling">Under behandling</SelectItem>
          <SelectItem value="Godkjent">Godkjent</SelectItem>
          <SelectItem value="Avvist">Avvist</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        onClick={handleStatusEndring} 
        disabled={status === currentStatus || isLoading}
      >
        Oppdater status
      </Button>
    </div>
  )
}