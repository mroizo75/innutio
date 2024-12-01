"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OppgaveStatus, Prioritet } from "@prisma/client"
import { useOppgaver } from "@/hooks/useOppgaver"
import toast from 'react-hot-toast'

interface AddOppgaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  prosjektId: string;
  currentUser: any;
}

export function AddOppgaveModal({ isOpen, onClose, prosjektId, currentUser }: AddOppgaveModalProps) {
  const queryClient = useQueryClient();
  const { useAddOppgave } = useOppgaver(prosjektId);
  const addOppgaveMutation = useAddOppgave();

  const { data: brukere = [] } = useQuery({
    queryKey: ['brukere', currentUser?.bedriftId],
    queryFn: async () => {
      const response = await fetch(`/api/get-users?bedriftId=${currentUser.bedriftId}`);
      if (!response.ok) throw new Error('Kunne ikke hente brukere');
      return response.json();
    },
    enabled: !!currentUser?.bedriftId,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tittel: formData.get("tittel") as string,
      beskrivelse: formData.get("beskrivelse") as string,
      startDato: formData.get("startDato") as string,
      sluttDato: formData.get("sluttDato") as string,
      estimertTid: Number(formData.get("estimertTid")) || 0,
      status: formData.get("status") as OppgaveStatus || OppgaveStatus.IKKE_STARTET,
      prioritet: formData.get("prioritet") as Prioritet,
      brukerId: formData.get("brukerId") as string,
      prosjektId: prosjektId,
    };
    
    try {
      await addOppgaveMutation.mutateAsync(data);
      queryClient.invalidateQueries({ queryKey: ['prosjekt', prosjektId] });
      toast.success('Oppgave lagt til');
      onClose();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Feil ved lagring av oppgave:', error);
      toast.error('Kunne ikke legge til oppgave');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny oppgave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input name="tittel" placeholder="Oppgavetittel" required />
          <Textarea name="beskrivelse" placeholder="Beskrivelse" />
          <Input name="startDato" type="date" required />
          <Input name="sluttDato" type="date" required />
          <Input name="estimertTid" type="number" placeholder="Estimert tid (timer)" />
          <Select name="status" defaultValue={OppgaveStatus.IKKE_STARTET}>
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OppgaveStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="prioritet" defaultValue={Prioritet.MEDIUM}>
            <SelectTrigger>
              <SelectValue placeholder="Velg prioritet" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Prioritet).map((prioritet) => (
                <SelectItem key={prioritet} value={prioritet}>{prioritet}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="brukerId" defaultValue={currentUser.bedriftId || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Velg bruker" />
            </SelectTrigger>
            <SelectContent>
              {brukere.length > 0 ? (
                brukere.map((bruker: { id: string; navn: string; etternavn: string }) => (
                  <SelectItem key={bruker.id} value={bruker.id}>
                    {bruker.navn} {bruker.etternavn}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="ingen">Ingen brukere funnet</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Input name="filer" type="file" accept="*" multiple />
          <Button type="submit">Legg til oppgave</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
