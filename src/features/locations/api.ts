import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { ILocation, CreateLocationPayload, UpdateLocationPayload } from './types';

// --- API Functions ---

const getLocations = async (): Promise<ILocation[]> => {
  const response = await apiClient.get('/locations');
  return response.data.data;
};

const getLocationById = async (id: number): Promise<ILocation> => {
  const response = await apiClient.get(`/locations/${id}`);
  return response.data.data;
};

const createLocation = async (data: CreateLocationPayload): Promise<ILocation> => {
  const response = await apiClient.post('/locations', data);
  return response.data.data;
};

const updateLocation = async ({ id, data }: { id: number; data: UpdateLocationPayload }): Promise<ILocation> => {
  const response = await apiClient.patch(`/locations/${id}`, data);
  return response.data.data;
};

const deleteLocation = async (id: number): Promise<void> => {
  await apiClient.delete(`/locations/${id}`);
};

// --- Hooks ---

export const useLocations = () => useQuery({ 
  queryKey: ['locations'], 
  queryFn: getLocations 
});

export const useLocation = (id: number) => useQuery({ 
  queryKey: ['locations', id], 
  queryFn: () => getLocationById(id),
  enabled: !!id
});

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      navigate({ to: '/locations' });
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Помилка створення локації');
    }
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      navigate({ to: '/locations' });
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Помилка оновлення локації');
    }
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Помилка видалення');
    }
  });
};