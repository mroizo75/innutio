import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { User } from '@prisma/client';

const fetchBrukere = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/brukere');
  return data;
};

export const useBrukere = () => {
  return useQuery<User[], Error>(['brukere'], fetchBrukere);
};