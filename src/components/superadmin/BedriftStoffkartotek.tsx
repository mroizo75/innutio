"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { OpprettStoffkartotek } from "./OpprettStoffkartotek"
import { KopiStoffkartotek } from "./KopiStoffkartotek"

interface BedriftStoffkartotekProps {
  bedrift: any
  alleBedrifter: { id: string; navn: string }[]
}

export function BedriftStoffkartotek({ bedrift, alleBedrifter }: BedriftStoffkartotekProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Stoffkartotek</h3>
        <div className="flex space-x-2">
          <KopiStoffkartotek
            fraBedriftId={bedrift.id}
            alleBedrifter={alleBedrifter}
            stoffkartotek={bedrift.Stoffkartotek}
          />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Legg til stoff
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bedrift.Stoffkartotek?.map((stoff: any) => (
          <Card key={stoff.id} className="p-4">
            <h4 className="font-medium">{stoff.produktnavn}</h4>
            <p className="text-sm text-muted-foreground">{stoff.beskrivelse}</p>
          </Card>
        ))}
      </div>

      {isAddModalOpen && (
        <OpprettStoffkartotek
          bedriftId={bedrift.id}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  )
}