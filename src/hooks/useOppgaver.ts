import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Oppgave, OppgaveStatus, Prioritet } from '@prisma/client';

interface AddOppgaveData {
  tittel: string;
  beskrivelse?: string;
  startDato: string;
  sluttDato: string;
  estimertTid?: number;
  status: OppgaveStatus;
  prioritet: Prioritet;
  brukerId?: string;
  prosjektId: string;
}

export const useOppgaver = (prosjektId: string) => {
  const queryClient = useQueryClient();

  const useAddOppgave = () => {
    return useMutation({
      mutationFn: async (data: AddOppgaveData) => {
        const response = await fetch('/api/oppgaver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Kunne ikke opprette oppgave');
        const nyOppgave = await response.json();
        return nyOppgave;
      },
      onMutate: async (newOppgave) => {
        // Avbryt utgående refetch requests
        await queryClient.cancelQueries({ queryKey: ['prosjekt', prosjektId] });

        // Lagre tidligere data
        const previousData = queryClient.getQueryData(['prosjekt', prosjektId]);

        // Optimistisk oppdatering
        queryClient.setQueryData(['prosjekt', prosjektId], (old: any) => ({
          ...old,
          oppgaver: [...(old?.oppgaver || []), { ...newOppgave, id: 'temp-id' }],
        }));

        return { previousData };
      },
      onError: (err, newOppgave, context) => {
        // Ved feil, rull tilbake til tidligere data
        queryClient.setQueryData(['prosjekt', prosjektId], context?.previousData);
      },
      onSettled: () => {
        // Oppdater data én gang etter mutasjon er fullført
        queryClient.invalidateQueries({ queryKey: ['prosjekt', prosjektId] });
      },
    });
  };

  return {
    useAddOppgave,
  };
};