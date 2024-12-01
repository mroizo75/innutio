"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EditBrukerModal } from "./EditBrukerModal"
import { useState } from "react"

export function BedriftBrukereTable({ brukere }: { brukere: any[] }) {
  const [selectedBruker, setSelectedBruker] = useState<any>(null)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bruker</TableHead>
          <TableHead>E-post</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Handlinger</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brukere.map((bruker) => (
          <TableRow key={bruker.id}>
            <TableCell>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    {bruker.navn?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{bruker.navn}</div>
                  <div className="text-sm text-muted-foreground">
                    {bruker.stilling || 'Ingen stilling'}
                  </div>
                </div>
              </div>
            </TableCell>
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

      {selectedBruker && (
        <EditBrukerModal
          bruker={selectedBruker}
          onClose={() => setSelectedBruker(null)}
        />
      )}
    </Table>
  )
}