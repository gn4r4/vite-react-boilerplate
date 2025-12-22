import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import type { IBook } from './types';

// ВИПРАВЛЕНО: Інтерфейс тепер відповідає тому, що чекає бекенд (snake_case)
interface BookPayload {
  title?: string;
  id_category?: number;
  id_genre?: number;
  id_author?: Array<number>;
}

// --- API Functions ---

const getBooks = async (): Promise<Array<IBook>> => {
  const response = await apiClient.get('/books');
  const data = response.data as { data: Array<IBook> };
  return data.data || [];
};

const getBookById = async (id: number): Promise<IBook> => {
  const response = await apiClient.get(`/books/${id}`);
  const data = response.data as { data: IBook };
  return data.data;
};

const createBook = async (newBook: BookPayload): Promise<IBook> => {
  const response = await apiClient.post('/books', newBook);
  const data = response.data as { data: IBook };
  return data.data;
};

const updateBook = async ({ id, data }: { id: number; data: Partial<BookPayload> }): Promise<IBook> => {
  const response = await apiClient.patch(`/books/${id}`, data);
  const responseData = response.data as { data: IBook };
  return responseData.data;
};

const deleteBook = async (id: number): Promise<void> => {
  await apiClient.delete(`/books/${id}`);
};

// --- Hooks ---

export const useBooks = (): UseQueryResult<Array<IBook>> =>
  useQuery<Array<IBook>>({
    queryKey: ['books'],
    queryFn: getBooks,
  });

export const useBook = (id: number): UseQueryResult<IBook> =>
  useQuery<IBook>({
    queryKey: ['books', id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  });

export const useCreateBook = (): UseMutationResult<IBook, unknown, BookPayload> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void navigate({ to: '/books' });
    },
  });
};

export const useUpdateBook = (): UseMutationResult<IBook, unknown, { id: number; data: Partial<BookPayload> }> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateBook,
    onSuccess: (updatedBook) => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.setQueryData(['books', updatedBook.id], updatedBook);
      void navigate({ to: '/books' });
    },
  });
};

export const useDeleteBook = (): UseMutationResult<void, unknown, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};