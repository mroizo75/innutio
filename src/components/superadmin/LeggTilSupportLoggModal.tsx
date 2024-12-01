import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface LeggTilSupportLoggModalProps {
  bedriftId: string
  onClose: () => void
  onSubmit: (data: { type: string; beskrivelse: string }) => void
}

export function LeggTilSupportLoggModal({ bedriftId, onClose, onSubmit }: LeggTilSupportLoggModalProps) {
  const [type, setType] = useState("")
  const [beskrivelse, setBeskrivelse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit({ type, beskrivelse })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til support-hendelse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Velg type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEKNISK">Teknisk support</SelectItem>
                <SelectItem value="FAKTURA">Fakturaspørsmål</SelectItem>
                <SelectItem value="OPPLÆRING">Opplæring</SelectItem>
                <SelectItem value="ANNET">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Beskrivelse</Label>
            <Textarea
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}