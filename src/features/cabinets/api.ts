import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { ICabinet } from './types';

// --- API Functions ---
const getCabinets = async (): Promise<ICabinet[]> => {
  const response = await apiClient.get('/cabinets');
  return response.data.data;
};

const getCabinetById = async (id: number): Promise<ICabinet> => {
  const response = await apiClient.get(`/cabinets/${id}`);
  return response.data.data;
};

const createCabinet = async (newCabinet: any): Promise<ICabinet> => {
  const response = await apiClient.post('/cabinets', newCabinet);
  return response.data.data;
};

const updateCabinet = async ({ id, data }: { id: number; data: Partial<ICabinet> }): Promise<ICabinet> => {
  const response = await apiClient.patch(`/cabinets/${id}`, data);
  return response.data.data;
};

const deleteCabinet = async (id: number): Promise<void> => {
  await apiClient.delete(`/cabinets/${id}`);
};

// --- Hooks ---

export const useCabinets = () => useQuery({ 
  queryKey: ['cabinets'], 
  queryFn: getCabinets 
});

export const useCabinet = (id: number) => useQuery({ 
  queryKey: ['cabinets', id], 
  queryFn: () => getCabinetById(id),
  enabled: !!id
});

export const useCreateCabinet = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createCabinet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinets'] });
      navigate({ to: '/cabinets' });
    },
  });
};

export const useUpdateCabinet = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateCabinet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinets'] });
      navigate({ to: '/cabinets' });
    },
  });
};

export const useDeleteCabinet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCabinet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinets'] });
    },
  });
};
