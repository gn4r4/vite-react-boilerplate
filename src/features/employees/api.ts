import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IEmployee } from './types';

// --- API Functions ---
const getEmployees = async (): Promise<IEmployee[]> => {
  const response = await apiClient.get('/employees');
  return response.data.data;
};

const getEmployeeById = async (id: number): Promise<IEmployee> => {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data.data;
};

const createEmployee = async (newEmployee: any): Promise<IEmployee> => {
  const response = await apiClient.post('/employees', newEmployee);
  return response.data.data;
};

const updateEmployee = async ({ id, data }: { id: number; data: Partial<IEmployee> }): Promise<IEmployee> => {
  const response = await apiClient.patch(`/employees/${id}`, data);
  return response.data.data;
};

const deleteEmployee = async (id: number): Promise<void> => {
  await apiClient.delete(`/employees/${id}`);
};

// --- Hooks ---

export const useEmployees = () => useQuery({ 
  queryKey: ['employees'], 
  queryFn: getEmployees 
});

export const useEmployee = (id: number) => useQuery({ 
  queryKey: ['employees', id], 
  queryFn: () => getEmployeeById(id),
  enabled: !!id
});

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate({ to: '/employees' });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate({ to: '/employees' });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
