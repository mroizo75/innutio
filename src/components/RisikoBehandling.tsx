"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { nb } from "date-fns/locale"

interface RisikoBehandlingProps {
  risikoVurdering: any
  currentUser: any
  open: boolean
  onClose: () => void
}

export default function RisikoBehandling({ 
  risikoVurdering, 
  currentUser, 
  open, 
  onClose 
}: RisikoBehandlingProps) {
  const router = useRouter()
  const [kommentar, setKommentar] = useState("")

  const handleStartBehandling = async () => {
    try {
      const response = await fetch(`/api/risiko/${risikoVurdering.id}/behandle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          behandlerId: currentUser.id,
          status: "Under behandling"
        })
      })

      if (!response.ok) throw new Error("Kunne ikke starte behandling")
      
      toast.success("Behandling startet")
      router.refresh()
    } catch (error) {
      toast.error("Kunne ikke starte behandling")
    }
  }

  const handleFerdigBehandling = async () => {
    try {
      const response = await fetch(`/api/risiko/${risikoVurdering.id}/ferdig`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Ferdig behandlet",
          kommentar
        })
      })

      if (!response.ok) throw new Error("Kunne ikke fullføre behandling")
      
      toast.success("Behandling fullført")
      router.refresh()
      onClose()
    } catch (error) {
      toast.error("Kunne ikke fullføre behandling")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Behandling av risikovurdering - {risikoVurdering.prosjekt.navn}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grunnleggende informasjon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <p>{risikoVurdering.status}</p>
            </div>
            <div>
              <Label>Dato</Label>
              <p>{format(new Date(risikoVurdering.dato), 'dd.MM.yyyy', { locale: nb })}</p>
            </div>
          </div>

          {/* Fareidentifikasjon */}
          <div className="space-y-4">
            <h3 className="font-semibold">Fareidentifikasjon</h3>
            <div className="space-y-2">
              <Label>Beskrivelse av fare</Label>
              <p className="mt-1">{risikoVurdering.fareBeskrivelse}</p>
            </div>
            <div className="space-y-2">
              <Label>Årsaker</Label>
              <p className="mt-1">{risikoVurdering.arsaker}</p>
            </div>
            <div className="space-y-2">
              <Label>Konsekvenser</Label>
              <p className="mt-1">{risikoVurdering.konsekvenser}</p>
            </div>
          </div>

          {/* Risikoanalyse */}
          <div className="space-y-4">
            <h3 className="font-semibold">Risikoanalyse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sannsynlighet</Label>
                <p className="mt-1">{risikoVurdering.sannsynlighet}</p>
              </div>
              <div>
                <Label>Konsekvensgrad</Label>
                <p className="mt-1">{risikoVurdering.konsekvensGrad}</p>
              </div>
            </div>
          </div>

          {/* Tiltak og oppfølging */}
          <div className="space-y-4">
            <div>
              <Label>Eksisterende tiltak</Label>
              <p className="mt-1">{risikoVurdering.eksisterendeTiltak}</p>
            </div>
            <div>
              <Label>Nye tiltak</Label>
              <p className="mt-1">{risikoVurdering.nyeTiltak}</p>
            </div>
            <div>
              <Label>Oppfølgingsplan</Label>
              <p className="mt-1">{risikoVurdering.oppfolging}</p>
            </div>
          </div>

          {/* Behandling */}
          <div className="space-y-4 pt-4 border-t">
            {risikoVurdering.status === "Ubehandlet" && (
              <Button onClick={handleStartBehandling}>
                Start behandling
              </Button>
            )}

            {risikoVurdering.status === "Under behandling" && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Legg til kommentar..."
                  value={kommentar}
                  onChange={(e) => setKommentar(e.target.value)}
                />
                <Button onClick={handleFerdigBehandling}>
                  Fullfør behandling
                </Button>
              </div>
            )}

            {risikoVurdering.status === "Ferdig behandlet" && (
              <div>
                <p className="text-green-600 font-medium">Behandling fullført</p>
                {risikoVurdering.kommentar && (
                  <div className="mt-2">
                    <Label>Kommentar fra behandler</Label>
                    <p className="mt-1">{risikoVurdering.kommentar}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}