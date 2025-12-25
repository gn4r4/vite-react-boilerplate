import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { IPublisher } from './types';

// --- API Functions ---
const getPublishers = async (): Promise<IPublisher[]> => {
  const response = await apiClient.get('/publishers');
  return response.data.data;
};

const getPublisherById = async (id: number): Promise<IPublisher> => {
  const response = await apiClient.get(`/publishers/${id}`);
  return response.data.data;
};

const createPublisher = async (newPublisher: Partial<IPublisher>): Promise<IPublisher> => {
  const response = await apiClient.post('/publishers', newPublisher);
  return response.data.data;
};

const updatePublisher = async ({ id, data }: { id: number; data: Partial<IPublisher> }): Promise<IPublisher> => {
  const response = await apiClient.patch(`/publishers/${id}`, data);
  return response.data.data;
};

const deletePublisher = async (id: number): Promise<void> => {
  await apiClient.delete(`/publishers/${id}`);
};

// --- Hooks ---

export const usePublishers = () => useQuery({ 
  queryKey: ['publishers'], 
  queryFn: getPublishers 
});

export const usePublisher = (id: number) => useQuery({ 
  queryKey: ['publishers', id], 
  queryFn: () => getPublisherById(id),
  enabled: !!id
});

export const useCreatePublisher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createPublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      navigate({ to: '/publishers' });
    },
  });
};

export const useUpdatePublisher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updatePublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      navigate({ to: '/publishers' });
    },
  });
};

export const useDeletePublisher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePublisher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
    },
  });
};
