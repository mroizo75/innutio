"use client";

import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLager } from "@/hooks/useLager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InntakModalProps {
  produkt: any;
  currentUser: any;
  onClose?: () => void;
}

export function InntakModal({ produkt, currentUser, onClose }: InntakModalProps) {
  const { registrerInntak } = useLager(currentUser.bedriftId);
  const [antall, setAntall] = useState(1);
  const [kommentar, setKommentar] = useState("");
  const [plassering, setPlassering] = useState(produkt.plassering || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrerInntak.mutateAsync({
        produktId: produkt.id,
        antall,
        kommentar,
        plassering,
      });
      onClose?.();
    } catch (error) {
      console.error("Feil ved inntak:", error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Legg til {produkt.produktnavn}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="antall">Antall</Label>
          <Input
            id="antall"
            type="number"
            min="1"
            value={antall}
            onChange={(e) => setAntall(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plassering">Lagerplassering</Label>
          <Input
            id="plassering"
            value={plassering}
            onChange={(e) => setPlassering(e.target.value)}
            required
          />
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
          <Button type="submit">
            Registrer inntak
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}