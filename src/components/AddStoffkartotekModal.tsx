import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FareSymbol } from "@prisma/client";
import { toast } from "sonner";

interface AddStoffkartotekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (formData: FormData) => void;
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
];

export function AddStoffkartotekModal({ isOpen, onClose, onAdd }: AddStoffkartotekModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    produktnavn: "",
    produsent: "",
    faresymboler: [] as FareSymbol[],
    datablad: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const form = new FormData();
      form.append("produktnavn", formData.produktnavn);
      form.append("produsent", formData.produsent);
      form.append("faresymboler", formData.faresymboler.join(","));
      if (formData.datablad) {
        form.append("datablad", formData.datablad);
      }

      await onAdd(form);
      
      setFormData({
        produktnavn: "",
        produsent: "",
        faresymboler: [],
        datablad: null,
      });
    } catch (error) {
      console.error("Feil ved oppretting:", error);
      toast.error("Kunne ikke opprette stoffkartotek");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Legg til nytt produkt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="produktnavn">Produktnavn</Label>
            <Input
              id="produktnavn"
              value={formData.produktnavn}
              onChange={(e) => setFormData({ ...formData, produktnavn: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="produsent">Produsent</Label>
            <Input
              id="produsent"
              value={formData.produsent}
              onChange={(e) => setFormData({ ...formData, produsent: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Faresymboler</Label>
            <div className="grid grid-cols-2 gap-2">
              {faresymboler.map((symbol) => (
                <div key={symbol} className="flex items-center space-x-2">
                  <Checkbox
                    id={symbol}
                    checked={formData.faresymboler.includes(symbol)}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        faresymboler: checked
                          ? [...formData.faresymboler, symbol]
                          : formData.faresymboler.filter((s) => s !== symbol),
                      });
                    }}
                  />
                  <Label htmlFor={symbol}>{symbol}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datablad">Datablad (PDF)</Label>
            <Input
              id="datablad"
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({ ...formData, datablad: e.target.files?.[0] || null })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}