import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IReader } from './types';

// --- API Functions ---
const getReaders = async (): Promise<IReader[]> => {
  const response = await apiClient.get('/readers');
  return response.data.data;
};

const getReaderById = async (id: number): Promise<IReader> => {
  const response = await apiClient.get(`/readers/${id}`);
  return response.data.data;
};

const createReader = async (newReader: any): Promise<IReader> => {
  const response = await apiClient.post('/readers', newReader);
  return response.data.data;
};

const updateReader = async ({ id, data }: { id: number; data: Partial<IReader> }): Promise<IReader> => {
  const response = await apiClient.patch(`/readers/${id}`, data);
  return response.data.data;
};

const deleteReader = async (id: number): Promise<void> => {
  await apiClient.delete(`/readers/${id}`);
};

// --- Hooks ---

export const useReaders = () => useQuery({ 
  queryKey: ['readers'], 
  queryFn: getReaders 
});

export const useReader = (id: number) => useQuery({ 
  queryKey: ['readers', id], 
  queryFn: () => getReaderById(id),
  enabled: !!id
});

export const useCreateReader = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createReader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readers'] });
      navigate({ to: '/readers' });
    },
  });
};

export const useUpdateReader = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateReader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readers'] });
      navigate({ to: '/readers' });
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Помилка оновлення');
    }
  });
};

export const useDeleteReader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readers'] });
    },
  });
};
