import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { IShelf } from './types';

// --- API Functions ---
const getShelves = async (): Promise<IShelf[]> => {
  const response = await apiClient.get('/shelves');
  return response.data.data;
};

const getShelfById = async (id: number): Promise<IShelf> => {
  const response = await apiClient.get(`/shelves/${id}`);
  return response.data.data;
};

const createShelf = async (newShelf: Partial<IShelf>): Promise<IShelf> => {
  const response = await apiClient.post('/shelves', newShelf);
  return response.data.data;
};

const updateShelf = async ({ id, data }: { id: number; data: Partial<IShelf> }): Promise<IShelf> => {
  const response = await apiClient.patch(`/shelves/${id}`, data);
  return response.data.data;
};

const deleteShelf = async (id: number): Promise<void> => {
  await apiClient.delete(`/shelves/${id}`);
};

// --- Hooks ---

export const useShelves = () => useQuery({ 
  queryKey: ['shelves'], 
  queryFn: getShelves 
});

export const useShelf = (id: number) => useQuery({ 
  queryKey: ['shelves', id], 
  queryFn: () => getShelfById(id),
  enabled: !!id
});

export const useCreateShelf = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] });
      navigate({ to: '/shelves' });
    },
  });
};

export const useUpdateShelf = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] });
      navigate({ to: '/shelves' });
    },
  });
};

export const useDeleteShelf = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelves'] });
    },
  });
};
