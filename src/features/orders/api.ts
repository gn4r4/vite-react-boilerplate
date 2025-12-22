import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '../../lib/axios';
import { IOrder } from './types';

// --- API Functions ---
const getOrders = async (): Promise<IOrder[]> => {
  const response = await apiClient.get('/orders');
  return response.data.data;
};

const getOrderById = async (id: number): Promise<IOrder> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data.data;
};

const createOrder = async (newOrder: Partial<IOrder>): Promise<IOrder> => {
  // Трансформація даних для бекенду
  const payload = {
    dateorder: newOrder.dateOrder, // Бекенд чекає dateorder (lowercase)
    status: newOrder.status,
    details: newOrder.items?.map(item => ({
      editionId: item.edition.id,
      quantity: item.quantity
    })) || []
  };

  const response = await apiClient.post('/orders', payload);
  return response.data.data;
};

const updateOrder = async ({ id, data }: { id: number; data: Partial<IOrder> }): Promise<IOrder> => {
  // Трансформація даних для бекенду
  const payload: any = {};

  if (data.dateOrder) payload.dateorder = data.dateOrder;
  if (data.status) payload.status = data.status;
  
  if (data.items) {
    payload.details = data.items.map(item => ({
      editionId: item.edition.id,
      quantity: item.quantity
    }));
  }

  const response = await apiClient.patch(`/orders/${id}`, payload);
  return response.data.data;
};

const deleteOrder = async (id: number): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};

// --- Hooks ---

export const useOrders = () => useQuery({ 
  queryKey: ['orders'], 
  queryFn: getOrders 
});

export const useOrder = (id: number) => useQuery({ 
  queryKey: ['orders', id], 
  queryFn: () => getOrderById(id),
  enabled: !!id
});

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate({ to: '/orders' });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate({ to: '/orders' });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};