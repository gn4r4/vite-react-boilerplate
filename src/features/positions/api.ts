import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IPosition } from './types';

// --- API Functions ---
const getPositions = async (): Promise<IPosition[]> => {
  const response = await apiClient.get('/positions');
  return response.data.data;
};

const getPositionById = async (id: number): Promise<IPosition> => {
  const response = await apiClient.get(`/positions/${id}`);
  return response.data.data;
};

const createPosition = async (newPosition: any): Promise<IPosition> => {
  const response = await apiClient.post('/positions', newPosition);
  return response.data.data;
};

const updatePosition = async ({ id, data }: { id: number; data: Partial<IPosition> }): Promise<IPosition> => {
  const response = await apiClient.patch(`/positions/${id}`, data);
  return response.data.data;
};

const deletePosition = async (id: number): Promise<void> => {
  await apiClient.delete(`/positions/${id}`);
};

// --- Hooks ---

export const usePositions = () => useQuery({ 
  queryKey: ['positions'], 
  queryFn: getPositions 
});

export const usePosition = (id: number) => useQuery({ 
  queryKey: ['positions', id], 
  queryFn: () => getPositionById(id),
  enabled: !!id
});

export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      navigate({ to: '/positions' });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updatePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      navigate({ to: '/positions' });
    },
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};
