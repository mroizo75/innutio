"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { BedriftStatistikk } from "./BedriftStatistikk"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { BedriftDetaljerModal } from "./BedriftDetaljerModal"

export function SuperAdminDashboard({ bedrifter }: { bedrifter: any }) {
  const [selectedBedrift, setSelectedBedrift] = useState(null)

  const aktiveBedrifter = bedrifter.filter(b => b.status === 'AKTIV').length
  const utlopteBedrifter = bedrifter.filter(b => b.status === 'UTLOPT').length
  const proveBedrifter = bedrifter.filter(b => b.status === 'PROVEPERIODE').length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Aktive bedrifter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aktiveBedrifter}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utropte bedrifter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utlopteBedrifter}</div>
          </CardContent>
        </Card> 
        <Card>
          <CardHeader>
            <CardTitle>Prøveperioder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proveBedrifter}</div>
          </CardContent>
        </Card>
        {/* Lignende kort for utløpte og prøveperiode */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bedriftsoversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={bedrifter}
            onRowClick={(bedrift) => setSelectedBedrift(bedrift)}
          />
        </CardContent>
      </Card>

      {selectedBedrift && (
        <BedriftDetaljerModal
          bedrift={selectedBedrift}
          onClose={() => setSelectedBedrift(null)}
        />
      )}
    </div>
  )
}