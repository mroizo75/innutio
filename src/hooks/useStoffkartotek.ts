import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useStoffkartotek(bedriftId: string, options = {}) {
  const queryClient = useQueryClient();

  const { data: stoffkartotek, isLoading } = useQuery({
    queryKey: ['stoffkartotek', bedriftId],
    queryFn: async () => {
      const response = await fetch('/api/stoffkartotek', {
        headers: {
          'Content-Type': 'application/json',
          'bedrift-id': bedriftId,
        },
      });
      if (!response.ok) {
        throw new Error('Kunne ikke hente stoffkartotek');
      }
      return response.json();
    },
    // Spread additional options
    ...options,
  });

  const { mutate: addStoffkartotek, isLoading: isAdding } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/stoffkartotek', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Kunne ikke legge til stoffkartotek');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalider bare cachen når vi faktisk har lagt til noe nytt
      queryClient.invalidateQueries({ queryKey: ['stoffkartotek', bedriftId] });
    },
  });

  return {
    stoffkartotek,
    isLoading,
    addStoffkartotek,
    isAdding,
  };
}