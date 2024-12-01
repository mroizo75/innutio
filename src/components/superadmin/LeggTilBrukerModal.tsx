"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { opprettBrukerMedVerifisering } from "@/actions/superadmin-actions"

interface LeggTilBrukerModalProps {
  bedriftId: string
  onClose: () => void
}

export function LeggTilBrukerModal({ bedriftId, onClose }: LeggTilBrukerModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        email: formData.get("email") as string,
        navn: formData.get("navn") as string,
        etternavn: formData.get("etternavn") as string,
        stilling: formData.get("stilling") as string,
        role: formData.get("role") as string,
        bedriftId
      }

      const result = await opprettBrukerMedVerifisering(data)
      
      if (result.success) {
        toast.success("Bruker lagt til. En e-post med registreringslenke er sendt.")
        onClose()
      } else {
        toast.error(result.error || "Kunne ikke legge til bruker")
      }
    } catch (error) {
      toast.error("Kunne ikke legge til bruker")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny bruker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fornavn</Label>
            <Input name="navn" placeholder="Fornavn" required />
          </div>
          <div className="space-y-2">
            <Label>Etternavn</Label>
            <Input name="etternavn" placeholder="Etternavn" required />
          </div>
          <div className="space-y-2">
            <Label>E-post</Label>
            <Input name="email" type="email" placeholder="E-post" required />
          </div>
          <div className="space-y-2">
            <Label>Stilling</Label>
            <Input name="stilling" placeholder="Stilling" />
          </div>
          <div className="space-y-2">
            <Label>Rolle</Label>
            <Select name="role" defaultValue="USER">
              <SelectTrigger>
                <SelectValue placeholder="Velg rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Bruker</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LEDER">Leder</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Legger til..." : "Legg til bruker"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}