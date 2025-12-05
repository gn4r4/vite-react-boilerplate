import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IGenre } from './types';

// --- API Functions ---
const getGenres = async (): Promise<IGenre[]> => {
  const response = await apiClient.get('/genres');
  return response.data.data;
};

const getGenreById = async (id: number): Promise<IGenre> => {
  const response = await apiClient.get(`/genres/${id}`);
  return response.data.data;
};

const createGenre = async (newGenre: any): Promise<IGenre> => {
  const response = await apiClient.post('/genres', newGenre);
  return response.data.data;
};

const updateGenre = async ({ id, data }: { id: number; data: Partial<IGenre> }): Promise<IGenre> => {
  const response = await apiClient.patch(`/genres/${id}`, data);
  return response.data.data;
};

const deleteGenre = async (id: number): Promise<void> => {
  await apiClient.delete(`/genres/${id}`);
};

// --- Hooks ---

export const useGenres = () => useQuery({ 
  queryKey: ['genres'], 
  queryFn: getGenres 
});

export const useGenre = (id: number) => useQuery({ 
  queryKey: ['genres', id], 
  queryFn: () => getGenreById(id),
  enabled: !!id
});

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      navigate({ to: '/genres' });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateGenre,
    onSuccess: (updatedGenre) => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      queryClient.setQueryData(['genres', updatedGenre.id], updatedGenre);
      navigate({ to: '/genres' });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
};