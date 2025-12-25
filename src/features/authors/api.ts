import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { IAuthor } from './types';

// --- API Functions ---
const getAuthors = async (): Promise<IAuthor[]> => {
  const response = await apiClient.get('/authors');
  return response.data.data;
};

const getAuthorById = async (id: number): Promise<IAuthor> => {
  const response = await apiClient.get(`/authors/${id}`);
  return response.data.data;
};

const createAuthor = async (newAuthor: Partial<IAuthor>): Promise<IAuthor> => {
  const response = await apiClient.post('/authors', newAuthor);
  return response.data.data;
};

const updateAuthor = async ({ id, data }: { id: number; data: Partial<IAuthor> }): Promise<IAuthor> => {
  const response = await apiClient.patch(`/authors/${id}`, data);
  return response.data.data;
};

const deleteAuthor = async (id: number): Promise<void> => {
  await apiClient.delete(`/authors/${id}`);
};

// --- Hooks ---

export const useAuthors = () => useQuery({ 
  queryKey: ['authors'], 
  queryFn: getAuthors 
});

export const useAuthor = (id: number) => useQuery({ 
  queryKey: ['authors', id], 
  queryFn: () => getAuthorById(id),
  enabled: !!id
});

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      navigate({ to: '/authors' });
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateAuthor,
    onSuccess: (updatedAuthor) => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.setQueryData(['authors', updatedAuthor.id], updatedAuthor);
      navigate({ to: '/authors' });
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });
};