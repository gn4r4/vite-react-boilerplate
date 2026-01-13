import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios'; // Перевір шлях до твого axios
import { ICatalogBook } from './types';

const getCatalog = async (search?: string): Promise<ICatalogBook[]> => {
  const params = search ? { search } : {};
  
  const response = await apiClient.get('/catalog', { params });
  return response.data.data;
};

export const useCatalog = (searchTerm: string) => {
  return useQuery({
    // Ключ залежить від searchTerm. Як тільки зміниться пошук — запит полетить сам!
    queryKey: ['catalog', searchTerm], 
    queryFn: () => getCatalog(searchTerm),
    // Можна додати keepPreviousData: true, щоб список не мигав при наборі тексту
  });
};