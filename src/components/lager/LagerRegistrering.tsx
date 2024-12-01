"use client";

import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLager } from "@/hooks/useLager";

interface LagerRegistreringProps {
  bedriftId: string;
  onClose: () => void;
}

export function LagerRegistrering({ bedriftId, onClose }: LagerRegistreringProps) {
  const { addProdukt } = useLager(bedriftId);
  const initialFormData = {
    produktnavn: "",
    beskrivelse: "",
    antall: 0,
    minAntall: 5,
    plassering: "",
    kategori: "",
    enhet: "stk",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { bedriftId, ...produktData } = formData;
      await addProdukt.mutateAsync(produktData);
      setFormData(initialFormData);
      console.log("Lukker modulen");
      onClose();
    } catch (error) {
      console.error("Feil ved registrering:", error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registrer nytt produkt</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="produktnavn">Produktnavn</Label>
          <Input
            id="produktnavn"
            value={formData.produktnavn}
            onChange={(e) =>
              setFormData({ ...formData, produktnavn: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beskrivelse">Beskrivelse</Label>
          <Textarea
            id="beskrivelse"
            value={formData.beskrivelse}
            onChange={(e) =>
              setFormData({ ...formData, beskrivelse: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="antall">Antall</Label>
            <Input
              id="antall"
              type="number"
              value={formData.antall}
              onChange={(e) =>
                setFormData({ ...formData, antall: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAntall">Minimum antall</Label>
            <Input
              id="minAntall"
              type="number"
              value={formData.minAntall}
              onChange={(e) =>
                setFormData({ ...formData, minAntall: parseInt(e.target.value) })
              }
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Registrer produkt
        </Button>
      </form>
    </DialogContent>
  );
}