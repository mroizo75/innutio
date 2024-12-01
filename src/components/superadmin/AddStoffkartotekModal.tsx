"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface StoffkartotekData {
  produktnavn: string
  beskrivelse: string
  faremerking: string
  bruksomrade: string
  forholdsregler: string
}

export function AddStoffkartotekModal({ 
  onClose,
  onSubmit 
}: { 
  onClose: () => void
  onSubmit: (data: StoffkartotekData) => Promise<void>
}) {
  const [formData, setFormData] = useState<StoffkartotekData>({
    produktnavn: '',
    beskrivelse: '',
    faremerking: '',
    bruksomrade: '',
    forholdsregler: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Legg til nytt stoff</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Produktnavn</Label>
            <Input 
              value={formData.produktnavn}
              onChange={(e) => setFormData({...formData, produktnavn: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Beskrivelse</Label>
            <Textarea 
              value={formData.beskrivelse}
              onChange={(e) => setFormData({...formData, beskrivelse: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Faremerking</Label>
            <Input 
              value={formData.faremerking}
              onChange={(e) => setFormData({...formData, faremerking: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Bruksområde</Label>
            <Textarea 
              value={formData.bruksomrade}
              onChange={(e) => setFormData({...formData, bruksomrade: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Forholdsregler</Label>
            <Textarea 
              value={formData.forholdsregler}
              onChange={(e) => setFormData({...formData, forholdsregler: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Avbryt</Button>
            <Button type="submit">Legg til</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}