import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { ILending } from './types';

// --- API Functions ---
const getLendings = async (): Promise<ILending[]> => {
  const response = await apiClient.get('/lendings');
  return response.data.data;
};

const getLendingById = async (id: number): Promise<ILending> => {
  const response = await apiClient.get(`/lendings/${id}`);
  return response.data.data;
};

const createLending = async (newLending: any): Promise<ILending> => {
  const response = await apiClient.post('/lendings', newLending);
  return response.data.data;
};

const updateLending = async ({ id, data }: { id: number; data: Partial<ILending> }): Promise<ILending> => {
  const response = await apiClient.patch(`/lendings/${id}`, data);
  return response.data.data;
};

const deleteLending = async (id: number): Promise<void> => {
  await apiClient.delete(`/lendings/${id}`);
};

// --- Hooks ---

export const useLendings = () => useQuery({ 
  queryKey: ['lendings'], 
  queryFn: getLendings 
});

export const useLending = (id: number) => useQuery({ 
  queryKey: ['lendings', id], 
  queryFn: () => getLendingById(id),
  enabled: !!id
});

export const useCreateLending = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createLending,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lendings'] });
      navigate({ to: '/lendings' });
    },
  });
};

export const useUpdateLending = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateLending,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lendings'] });
      navigate({ to: '/lendings' });
    },
  });
};

export const useDeleteLending = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLending,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lendings'] });
    },
  });
};
