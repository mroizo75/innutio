"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { oppdaterBedriftStatus } from "@/actions/superadmin-actions"

export function BedriftInfo({ bedrift }: { bedrift: any }) {
  const [status, setStatus] = useState(bedrift.status)
  const [abonnementType, setAbonnementType] = useState(bedrift.abonnementType)
  const [abonnementSlutt, setAbonnementSlutt] = useState(
    bedrift.abonnementSlutt ? new Date(bedrift.abonnementSlutt).toISOString().split('T')[0] : ''
  )

  const handleStatusUpdate = async () => {
    await oppdaterBedriftStatus(
      bedrift.id,
      status,
      abonnementSlutt ? new Date(abonnementSlutt) : undefined
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Organisasjonsnummer</Label>
              <Input value={bedrift.orgnr} disabled />
            </div>
            
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIV">Aktiv</SelectItem>
                  <SelectItem value="INAKTIV">Inaktiv</SelectItem>
                  <SelectItem value="UTLOPT">Utløpt</SelectItem>
                  <SelectItem value="PROVEPERIODE">Prøveperiode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Abonnementstype</Label>
              <Select value={abonnementType} onValueChange={setAbonnementType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Abonnement utløper</Label>
              <Input 
                type="date" 
                value={abonnementSlutt} 
                onChange={(e) => setAbonnementSlutt(e.target.value)}
              />
            </div>

            <Button onClick={handleStatusUpdate}>
              Oppdater bedriftsstatus
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium">Support-logg</h3>
            {bedrift.supportLogg?.map((logg: any) => (
              <div key={logg.id} className="border-b pb-2">
                <p className="text-sm">{logg.beskrivelse}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(logg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}