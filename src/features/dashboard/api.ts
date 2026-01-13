import apiClient from '@/lib/axios';
import { IDashboardStats } from './types';

export const getDashboardStats = async (): Promise<IDashboardStats> => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data.data; 
};
