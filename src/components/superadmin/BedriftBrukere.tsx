"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { EditBrukerModal } from "./EditBrukerModal"
import { Plus } from "lucide-react"
import { LeggTilBrukerModal } from "./LeggTilBrukerModal"

export function BedriftBrukere({ bedrift }: { bedrift: any }) {
  const [selectedBruker, setSelectedBruker] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Brukere</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til bruker
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>E-post</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bedrift.users?.map((bruker: any) => (
            <TableRow key={bruker.id}>
              <TableCell>{bruker.navn}</TableCell>
              <TableCell>{bruker.email}</TableCell>
              <TableCell>
                <Badge>{bruker.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={bruker.active ? "success" : "destructive"}>
                  {bruker.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedBruker(bruker)}
                >
                  Rediger
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedBruker && (
        <EditBrukerModal
          bruker={selectedBruker}
          onClose={() => setSelectedBruker(null)}
        />
      )}

      {isModalOpen && (
        <LeggTilBrukerModal
          bedriftId={bedrift.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}