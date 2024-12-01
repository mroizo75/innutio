"use client";

import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLager } from "@/hooks/useLager";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UttakModalProps {
  produkt: any;
  currentUser: any;
  onClose?: () => void;
}

export function UttakModal({ produkt, currentUser, onClose }: UttakModalProps) {
  const { registrerUttak } = useLager(currentUser.bedriftId);
  const [antall, setAntall] = useState(1);
  const [kommentar, setKommentar] = useState("");
  const [prosjektId, setProsjektId] = useState("");

  const { data: prosjekter = [] } = useQuery({
    queryKey: ['prosjekter', currentUser.bedriftId],
    queryFn: async () => {
      const response = await fetch(`/api/prosjekter?bedriftId=${currentUser.bedriftId}`);
      if (!response.ok) throw new Error('Kunne ikke hente prosjekter');
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrerUttak.mutateAsync({
        produktId: produkt.id,
        antall,
        kommentar,
        prosjektId: prosjektId || undefined,
      });
      onClose?.();
    } catch (error) {
      console.error("Feil ved uttak:", error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ta ut {produkt.produktnavn}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="antall">Antall</Label>
          <Input
            id="antall"
            type="number"
            min="1"
            max={produkt.antall}
            value={antall}
            onChange={(e) => setAntall(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prosjekt">Prosjekt (valgfritt)</Label>
          <Select value={prosjektId} onValueChange={setProsjektId}>
            <SelectTrigger>
              <SelectValue placeholder="Velg prosjekt" />
            </SelectTrigger>
            <SelectContent>
              {prosjekter.map((prosjekt: any) => (
                <SelectItem key={prosjekt.id} value={prosjekt.id}>
                  {prosjekt.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kommentar">Kommentar (valgfritt)</Label>
          <Textarea
            id="kommentar"
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button type="submit" disabled={antall < 1 || antall > produkt.antall}>
            Registrer uttak
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}