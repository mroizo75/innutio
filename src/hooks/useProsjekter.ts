import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Prosjekt } from '@prisma/client';

const CACHE_KEY = 'prosjekter';

export const useProsjekter = (bedriftId: string) => {
  return useQuery<Prosjekt[]>({
    queryKey: [CACHE_KEY, bedriftId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/prosjekter?bedriftId=${bedriftId}`);
      return data;
    },
    enabled: !!bedriftId,
  });
};

export const useAddProsjekt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProsjekt: Partial<Prosjekt>) => {
      const { data } = await apiClient.post('/prosjekter', newProsjekt);
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEY] });
    },
  });
};

export const useUpdateProsjekt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedProsjekt: Prosjekt) => {
      const { data } = await apiClient.patch(
        `/prosjekter/${updatedProsjekt.id}`,
        updatedProsjekt
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEY] });
    },
  });
};