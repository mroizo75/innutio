import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { OppgaveStatus, oppgaveStatusTilTekst } from "@/utils/status-mapper";
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Oppgave } from '@prisma/client';
import { EditOppgaveModal } from '@/components/EditOppgaveModal';

interface ProsjektTabellProps {
  prosjekt: {
    id: string;
    oppgaver: Array<Oppgave & {
      bruker: {
        navn: string;
        etternavn: string;
      };
    }>;
  };
  currentUser: any;
  onEditOppgave: (oppgave: Oppgave) => void;
}

const ProsjektTabell: React.FC<ProsjektTabellProps> = ({
  prosjekt,
  currentUser,
  onEditOppgave,
}) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [oppgaveToDelete, setOppgaveToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentOppgave, setCurrentOppgave] = useState<Oppgave | null>(null);

  const handleDeleteClick = (oppgaveId: string) => {
    setOppgaveToDelete(oppgaveId);
    setIsDeleteDialogOpen(true);
  };

  const handleSlettOppgave = async () => {
    if (!oppgaveToDelete) return;

    try {
      const response = await fetch(`/api/oppgaver/${oppgaveToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke slette oppgaven');
      }

      queryClient.invalidateQueries({ queryKey: ['prosjekt', prosjekt.id] });
      toast.success('Oppgaven ble slettet');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Feil ved sletting av oppgave:', error);
      toast.error(error instanceof Error ? error.message : 'Kunne ikke slette oppgaven');
    }
  };

  const handleEdit = (oppgave: Oppgave) => {
    setCurrentOppgave(oppgave);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (oppgaveData: Oppgave) => {
    try {
      const response = await fetch(`/api/oppgaver/${oppgaveData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppgaveData),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere oppgaven');
      }

      queryClient.invalidateQueries({ queryKey: ['prosjekt', prosjekt.id] });
      toast.success('Oppgaven ble oppdatert');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Feil ved oppdatering av oppgave:', error);
      toast.error('Kunne ikke oppdatere oppgaven');
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tittel</TableHead>
            <TableHead>Beskrivelse</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ansvarlig</TableHead>
            <TableHead>Startdato</TableHead>
            <TableHead>Sluttdato</TableHead>
            <TableHead>Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prosjekt.oppgaver.map((oppgave: any) => (
            <TableRow key={oppgave.id}>
              <TableCell>{oppgave.tittel}</TableCell>
              <TableCell>{oppgave.beskrivelse}</TableCell>
              <TableCell>{oppgaveStatusTilTekst[oppgave.status as keyof typeof oppgaveStatusTilTekst]}</TableCell>
              <TableCell>{`${oppgave.bruker.navn} ${oppgave.bruker.etternavn}`}</TableCell>
              <TableCell>{new Date(oppgave.startDato).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(oppgave.sluttDato).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(oppgave)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Rediger
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(oppgave.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Slett
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen vil permanent slette oppgaven og all tilknyttet data. 
              Dette kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleSlettOppgave} className="bg-destructive text-destructive-foreground">
              Slett oppgave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {currentOppgave && (
        <EditOppgaveModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          oppgave={currentOppgave}
          onEdit={handleEditSave}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default ProsjektTabell;
