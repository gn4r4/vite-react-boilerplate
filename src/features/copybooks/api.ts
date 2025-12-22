import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { ICopybook, CopybookPayload } from './types';

// --- API Functions ---

const getCopybooks = async (): Promise<ICopybook[]> => {
  const response = await apiClient.get('/copybooks');
  return response.data.data;
};

const getCopybookById = async (id: number): Promise<ICopybook> => {
  const response = await apiClient.get(`/copybooks/${id}`);
  return response.data.data;
};

const createCopybook = async (data: CopybookPayload): Promise<ICopybook> => {
  const response = await apiClient.post('/copybooks', data);
  return response.data.data;
};

const updateCopybook = async ({ id, data }: { id: number; data: CopybookPayload }): Promise<ICopybook> => {
  const response = await apiClient.patch(`/copybooks/${id}`, data);
  return response.data.data;
};

const deleteCopybook = async (id: number): Promise<void> => {
  await apiClient.delete(`/copybooks/${id}`);
};

// --- Hooks ---

export const useCopybooks = () => useQuery({ 
  queryKey: ['copybooks'], 
  queryFn: getCopybooks 
});

export const useCopybook = (id: number) => useQuery({ 
  queryKey: ['copybooks', id], 
  queryFn: () => getCopybookById(id),
  enabled: !!id
});

export const useCreateCopybook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createCopybook,
    onSuccess: () => {
      // Важливо оновити і список книг, і список локацій (бо одна стала зайнятою)
      queryClient.invalidateQueries({ queryKey: ['copybooks'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      navigate({ to: '/copybooks' });
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Помилка створення');
    }
  });
};

export const useUpdateCopybook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateCopybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copybooks'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      navigate({ to: '/copybooks' });
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Помилка оновлення');
    }
  });
};

export const useDeleteCopybook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCopybook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copybooks'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};