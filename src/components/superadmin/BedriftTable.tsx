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
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { BedriftDetaljerModal } from "./BedriftDetaljerModal"
import { formatDate } from "@/lib/utils"

export function BedriftTable({ bedrifter }: { bedrifter: any[] }) {
  const [selectedBedrift, setSelectedBedrift] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIV':
        return 'bg-green-500'
      case 'INAKTIV':
        return 'bg-red-500'
      case 'UTLOPT':
        return 'bg-yellow-500'
      case 'PROVEPERIODE':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bedriftsnavn</TableHead>
            <TableHead>Org.nr</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Abonnement</TableHead>
            <TableHead>Utløper</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bedrifter.map((bedrift) => (
            <TableRow key={bedrift.id}>
              <TableCell>{bedrift.navn}</TableCell>
              <TableCell>{bedrift.orgnr}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(bedrift.status)}>
                  {bedrift.status}
                </Badge>
              </TableCell>
              <TableCell>{bedrift.abonnementType}</TableCell>
              <TableCell>
                {bedrift.abonnementSlutt 
                  ? formatDate(bedrift.abonnementSlutt)
                  : 'Ikke satt'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost"
                  onClick={() => setSelectedBedrift(bedrift)}
                >
                  Se detaljer
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
    </>
  )
}