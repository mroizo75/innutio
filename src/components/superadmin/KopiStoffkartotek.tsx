"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface KopiStoffkartotekProps {
  fraBedriftId: string
  alleBedrifter: { id: string; navn: string }[]
  stoffkartotek: {
    id: string
    produktnavn: string
    FareSymbolMapping: { symbol: string }[]
  }[]
}

export function KopiStoffkartotek({
  fraBedriftId,
  alleBedrifter,
  stoffkartotek,
}: KopiStoffkartotekProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [valgteBedrifter, setValgteBedrifter] = useState<string[]>([])
  const [valgteStoffkartotek, setValgteStoffkartotek] = useState<string[]>([])

  const handleKopier = async () => {
    try {
      const response = await fetch("/api/superadmin/stoffkartotek/kopier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fraBedriftId,
          tilBedrifter: valgteBedrifter,
          stoffkartotekIds: valgteStoffkartotek,
        }),
      })

      if (!response.ok) throw new Error()

      toast.success("Stoffkartotek kopiert til valgte bedrifter")
      setIsOpen(false)
      setValgteBedrifter([])
      setValgteStoffkartotek([])
    } catch (error) {
      toast.error("Kunne ikke kopiere stoffkartotek")
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Kopier til andre bedrifter
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kopier stoffkartotek til andre bedrifter</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Velg stoffkartotek å kopiere</h4>
              <div className="grid gap-2">
                {stoffkartotek.map((stoff) => (
                  <div key={stoff.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={stoff.id}
                      checked={valgteStoffkartotek.includes(stoff.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValgteStoffkartotek([...valgteStoffkartotek, stoff.id])
                        } else {
                          setValgteStoffkartotek(
                            valgteStoffkartotek.filter((id) => id !== stoff.id)
                          )
                        }
                      }}
                    />
                    <label htmlFor={stoff.id} className="text-sm">
                      {stoff.produktnavn}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Velg bedrifter å kopiere til</h4>
              <div className="grid gap-2">
                {alleBedrifter
                  .filter((bedrift) => bedrift.id !== fraBedriftId)
                  .map((bedrift) => (
                    <div key={bedrift.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={bedrift.id}
                        checked={valgteBedrifter.includes(bedrift.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValgteBedrifter([...valgteBedrifter, bedrift.id])
                          } else {
                            setValgteBedrifter(
                              valgteBedrifter.filter((id) => id !== bedrift.id)
                            )
                          }
                        }}
                      />
                      <label htmlFor={bedrift.id} className="text-sm">
                        {bedrift.navn}
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Avbryt
              </Button>
              <Button
                onClick={handleKopier}
                disabled={valgteBedrifter.length === 0 || valgteStoffkartotek.length === 0}
              >
                Kopier til valgte bedrifter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}