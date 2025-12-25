import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { ICategory } from './types';

// --- API Functions ---
const getCategories = async (): Promise<ICategory[]> => {
  const response = await apiClient.get('/categories');
  return response.data.data;
};

const getCategoryById = async (id: number): Promise<ICategory> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data.data;
};

const createCategory = async (newCategory: Partial<ICategory>): Promise<ICategory> => {
  const response = await apiClient.post('/categories', newCategory);
  return response.data.data;
};

const updateCategory = async ({ id, data }: { id: number; data: Partial<ICategory> }): Promise<ICategory> => {
  const response = await apiClient.patch(`/categories/${id}`, data);
  return response.data.data;
};

const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};

// --- Hooks ---

export const useCategories = () => useQuery({ 
  queryKey: ['categories'], 
  queryFn: getCategories 
});

export const useCategory = (id: number) => useQuery({ 
  queryKey: ['categories', id], 
  queryFn: () => getCategoryById(id),
  enabled: !!id
});

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate({ to: '/categories' });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.setQueryData(['categories', updatedCategory.id], updatedCategory);
      navigate({ to: '/categories' });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};