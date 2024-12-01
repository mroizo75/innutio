"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { opprettBedrift } from "@/actions/superadmin-actions"

interface BedriftData {
  navn: string
  orgnr: string
  status: string
  abonnementType: string
  abonnementStart: string
  abonnementSlutt: string
}

export function AddBedriftModal({ 
  onClose,
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState<BedriftData>({
    navn: '',
    orgnr: '',
    status: 'PROVEPERIODE',
    abonnementType: 'BASIC',
    abonnementStart: new Date().toISOString().split('T')[0],
    abonnementSlutt: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await opprettBedrift(formData)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny bedrift</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Bedriftsnavn</Label>
            <Input 
              value={formData.navn}
              onChange={(e) => setFormData({...formData, navn: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Organisasjonsnummer</Label>
            <Input 
              value={formData.orgnr}
              onChange={(e) => setFormData({...formData, orgnr: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROVEPERIODE">Prøveperiode</SelectItem>
                <SelectItem value="AKTIV">Aktiv</SelectItem>
                <SelectItem value="INAKTIV">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Abonnementstype</Label>
            <Select 
              value={formData.abonnementType}
              onValueChange={(value) => setFormData({...formData, abonnementType: value})}
            >
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
            <Label>Abonnement start</Label>
            <Input 
              type="date"
              value={formData.abonnementStart}
              onChange={(e) => setFormData({...formData, abonnementStart: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Abonnement slutt</Label>
            <Input 
              type="date"
              value={formData.abonnementSlutt}
              onChange={(e) => setFormData({...formData, abonnementSlutt: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Avbryt</Button>
            <Button type="submit">Opprett bedrift</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}