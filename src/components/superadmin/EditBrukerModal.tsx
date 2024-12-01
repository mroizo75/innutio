"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { oppdaterBruker } from "@/actions/superadmin-actions"

export function EditBrukerModal({ 
  bruker,
  onClose 
}: { 
  bruker: any
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    navn: bruker.navn,
    email: bruker.email,
    role: bruker.role,
    active: bruker.active
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await oppdaterBruker(bruker.id, formData)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger bruker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Navn</Label>
            <Input 
              value={formData.navn}
              onChange={(e) => setFormData({...formData, navn: e.target.value})}
            />
          </div>

          <div className="grid gap-2">
            <Label>E-post</Label>
            <Input 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid gap-2">
            <Label>Rolle</Label>
            <Select 
              value={formData.role}
              onValueChange={(value) => setFormData({...formData, role: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="LEDER">Leder</SelectItem>
                <SelectItem value="PROSJEKTLEDER">Prosjektleder</SelectItem>
                <SelectItem value="USER">Bruker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Avbryt</Button>
            <Button type="submit">Lagre endringer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}