import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IEdition, IEditionPayload } from './types';

// --- API Functions ---
const getEditions = async (): Promise<IEdition[]> => {
  const response = await apiClient.get('/editions');
  return response.data.data;
};

const getEditionById = async (id: number): Promise<IEdition> => {
  const response = await apiClient.get(`/editions/${id}`);
  return response.data.data;
};

// Використовуємо IEditionPayload для вхідних даних
const createEdition = async (newEdition: IEditionPayload): Promise<IEdition> => {
  const response = await apiClient.post('/editions', newEdition);
  return response.data.data;
};

// Використовуємо Partial<IEditionPayload>, бо при оновленні деякі поля можуть бути необов'язковими (хоча зазвичай PUT/PATCH тут повний)
const updateEdition = async ({ id, data }: { id: number; data: IEditionPayload }): Promise<IEdition> => {
  const response = await apiClient.patch(`/editions/${id}`, data);
  return response.data.data;
};

const deleteEdition = async (id: number): Promise<void> => {
  await apiClient.delete(`/editions/${id}`);
};

// --- Hooks ---

export const useEditions = () => useQuery({ 
  queryKey: ['editions'], 
  queryFn: getEditions 
});

export const useEdition = (id: number) => useQuery({ 
  queryKey: ['editions', id], 
  queryFn: () => getEditionById(id),
  enabled: !!id
});

export const useCreateEdition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createEdition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      navigate({ to: '/editions' });
    },
  });
};

export const useUpdateEdition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateEdition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      navigate({ to: '/editions' });
    },
  });
};

export const useDeleteEdition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEdition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
    },
  });
};