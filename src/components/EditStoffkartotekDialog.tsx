"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateStoffkartotek } from "@/actions/stoffkartotek"
import { FareSymbol, Stoffkartotek } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"

interface EditStoffkartotekDialogProps {
  stoffkartotek: Stoffkartotek & {
    FareSymbolMapping: { symbol: FareSymbol }[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const faresymboler: FareSymbol[] = [
  "BRANNFARLIG",
  "ETSENDE",
  "GIFTIG",
  "HELSEFARE",
  "MILJOFARE",
  "OKSIDERENDE",
  "EKSPLOSJONSFARLIG",
  "GASS_UNDER_TRYKK",
]

export function EditStoffkartotekDialog({
  stoffkartotek,
  open,
  onOpenChange,
}: EditStoffkartotekDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSymbols, setSelectedSymbols] = useState<FareSymbol[]>([])

  // Initialiser selectedSymbols når dialogen åpnes
  useEffect(() => {
    if (open && stoffkartotek.FareSymbolMapping) {
      const symbols = stoffkartotek.FareSymbolMapping.map((m) => m.symbol)
      setSelectedSymbols(symbols)
    }
  }, [open, stoffkartotek.FareSymbolMapping])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const formData = new FormData(e.currentTarget)
      formData.set("faresymboler", selectedSymbols.join(","))

      await updateStoffkartotek(stoffkartotek.id, formData)
      toast.success("Stoffkartotek oppdatert")
      onOpenChange(false)
    } catch (_error: any) {
      toast.error("Kunne ikke oppdatere stoffkartotek")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger stoffkartotek</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="produktnavn">Produktnavn</Label>
            <Input
              id="produktnavn"
              name="produktnavn"
              defaultValue={stoffkartotek.produktnavn}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="produsent">Produsent</Label>
            <Input
              id="produsent"
              name="produsent"
              defaultValue={stoffkartotek.produsent || ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Faresymboler</Label>
            <div className="grid grid-cols-2 gap-2">
              {faresymboler.map((symbol) => (
                <div key={symbol} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${stoffkartotek.id}-${symbol}`}
                    checked={selectedSymbols.includes(symbol)}
                    onCheckedChange={(checked) => {
                      setSelectedSymbols(
                        checked
                          ? [...selectedSymbols, symbol]
                          : selectedSymbols.filter((s) => s !== symbol)
                      )
                    }}
                  />
                  <Label htmlFor={`${stoffkartotek.id}-${symbol}`}>{symbol}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datablad">Ny datablad (valgfritt)</Label>
            <Input
              id="datablad"
              name="datablad"
              type="file"
              accept=".pdf"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 