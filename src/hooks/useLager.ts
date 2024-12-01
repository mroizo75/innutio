import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface LagerProdukt {
  id: string;
  produktnavn: string;
  beskrivelse?: string;
  antall: number;
  minAntall: number;
  plassering?: string;
  qrKode: string;
  kategori?: string;
  enhet: string;
}

export const useLager = (bedriftId: string) => {
  const queryClient = useQueryClient();

  const { data: produkter, isLoading } = useQuery({
    queryKey: ['lagerProdukter', bedriftId],
    queryFn: async () => {
      const response = await fetch('/api/lager/produkter');
      if (!response.ok) throw new Error('Kunne ikke hente lagerprodukter');
      return response.json();
    },
    enabled: !!bedriftId
  });

  const addProdukt = useMutation({
    mutationFn: async (data: Omit<LagerProdukt, 'id'>) => {
      const response = await fetch('/api/lager/produkter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Kunne ikke legge til produkt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lagerProdukter'] });
      toast.success('Produkt lagt til');
    },
    onError: () => {
      toast.error('Kunne ikke legge til produkt');
    }
  });

  const registrerUttak = useMutation({
    mutationFn: async ({ produktId, antall, kommentar, prosjektId }: {
      produktId: string;
      antall: number;
      kommentar?: string;
      prosjektId?: string;
    }) => {
      const response = await fetch('/api/lager/uttak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produktId, antall, kommentar, prosjektId }),
      });
      if (!response.ok) throw new Error('Kunne ikke registrere uttak');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lagerProdukter'] });
      toast.success('Uttak registrert');
    },
    onError: () => {
      toast.error('Kunne ikke registrere uttak');
    }
  });

  const registrerInntak = useMutation({
    mutationFn: async ({ produktId, antall, kommentar, leverandor, ordrenummer }: {
      produktId: string;
      antall: number;
      kommentar?: string;
      leverandor?: string;
      ordrenummer?: string;
    }) => {
      const response = await fetch('/api/lager/inntak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produktId, antall, kommentar, leverandor, ordrenummer }),
      });
      if (!response.ok) throw new Error('Kunne ikke registrere inntak');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lagerProdukter'] });
      toast.success('Inntak registrert');
    },
    onError: () => {
      toast.error('Kunne ikke registrere inntak');
    }
  });

  return {
    produkter,
    isLoading,
    addProdukt,
    registrerUttak,
    registrerInntak
  };
};