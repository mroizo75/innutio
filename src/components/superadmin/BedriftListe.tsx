"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { BedriftDetaljerModal } from "./BedriftDetaljerModal"
import { slettBedrift } from "@/actions/superadmin-actions"
import { Bedrift, User, Prosjekt, SupportLogg } from "@prisma/client"

interface BedriftListeProps {
  bedrifter: (Bedrift & {
    users: User[]
    prosjekter: Prosjekt[]
    supportLogg: SupportLogg[]
  })[]
}

export function BedriftListe({ bedrifter }: BedriftListeProps) {
  const [selectedBedrift, setSelectedBedrift] = useState<Bedrift | null>(null)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Org.nr</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Abonnement</TableHead>
            <TableHead>Brukere</TableHead>
            <TableHead>Prosjekter</TableHead>
            <TableHead className="text-right">Handling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bedrifter.map(bedrift => (
            <TableRow key={bedrift.id}>
              <TableCell>{bedrift.navn}</TableCell>
              <TableCell>{bedrift.orgnr}</TableCell>
              <TableCell>{bedrift.status}</TableCell>
              <TableCell>{bedrift.abonnementType}</TableCell>
              <TableCell>{bedrift.users.length}</TableCell>
              <TableCell>{bedrift.prosjekter.length}</TableCell>
              <TableCell className="text-right p-2 space-x-2">
                <Button onClick={() => setSelectedBedrift(bedrift)}>
                  Se detaljer
                </Button>
                <Button onClick={() => slettBedrift(bedrift.id)}>
                  Slett
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedBedrift && (
        <BedriftDetaljerModal
          bedrift={selectedBedrift}
          onClose={() => setSelectedBedrift(null)}
        />
      )}
    </div>
  )
} 