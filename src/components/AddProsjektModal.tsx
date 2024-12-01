"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface AddProsjektModalProps {
  currentUser: {
    id: string;
    bedriftId: string;
    role: string;
  };
  addProsjektAction: (formData: FormData) => Promise<void>;
}

export function AddProsjektModal({ currentUser, addProsjektAction }: AddProsjektModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('bedriftId', currentUser.bedriftId);
    try {
      await addProsjektAction(formData);
      window.dispatchEvent(new Event('prosjektOpprettet'));
      toast.success('Prosjektet ble opprettet!');
      setIsOpen(false);
      setError(null); // Nullstill feil ved suksess
    } catch (error) {
      console.error('Feil ved opprettelse av prosjekt:', error);
      toast.error('Det oppstod en feil ved opprettelse av prosjektet. Vennligst prøv igjen.');
      setError('Det oppstod en feil ved opprettelse av prosjektet. Vennligst prøv igjen.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Legg til nytt prosjekt</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til nytt prosjekt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <Input name="navn" placeholder="Prosjektnavn" required />
          <Input name="startDato" type="date" required />
          <Input name="sluttDato" type="date" required />
          <Input name="beskrivelse" placeholder="Beskrivelse" required />
          <select name="status" className="w-full p-2 border rounded" required>
            <option value="">Velg status</option>
            <option value="IKKE_STARTET">Ikke startet</option>
            <option value="STARTET">Startet</option>
            <option value="AVSLUTTET">Avsluttet</option>
          </select>
          <Button type="submit">Legg til prosjekt</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

