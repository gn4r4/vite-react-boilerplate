import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { ISupplier } from './types';

const getSuppliers = async (): Promise<ISupplier[]> => {
  const response = await apiClient.get('/suppliers');
  return response.data.data;
};

const getSupplierById = async (id: number): Promise<ISupplier> => {
  const response = await apiClient.get(`/suppliers/${id}`);
  return response.data.data;
};

const createSupplier = async (newSupplier: Partial<ISupplier>): Promise<ISupplier> => {
  const response = await apiClient.post('/suppliers', newSupplier);
  return response.data.data;
};

const updateSupplier = async ({ id, data }: { id: number; data: Partial<ISupplier> }): Promise<ISupplier> => {
  const response = await apiClient.patch(`/suppliers/${id}`, data);
  return response.data.data;
};

const deleteSupplier = async (id: number): Promise<void> => {
  await apiClient.delete(`/suppliers/${id}`);
};

export const useSuppliers = () => useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
export const useSupplier = (id: number) => useQuery({ queryKey: ['suppliers', id], queryFn: () => getSupplierById(id), enabled: !!id });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate({ to: '/suppliers' });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: updateSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate({ to: '/suppliers' });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};
