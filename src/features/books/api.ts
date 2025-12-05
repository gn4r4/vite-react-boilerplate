import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios'; // Переконайтеся, що шлях правильний (зазвичай @/lib/axios)
import { IBook } from './types';

interface BookPayload {
  title?: string;
  categoryId?: number;
  genreId?: number;
  authorIds?: number[];
}

// --- API Functions ---

const getBooks = async (): Promise<IBook[]> => {
  const response = await apiClient.get('/books');
  return response.data.data;
};

const getBookById = async (id: number): Promise<IBook> => {
  const response = await apiClient.get(`/books/${id}`);
  return response.data.data;
};

const createBook = async (newBook: BookPayload): Promise<IBook> => {

  const backendPayload = {
    title: newBook.title,
    id_category: newBook.categoryId, // Ось тут була проблема
    id_genre: newBook.genreId,       // І тут
    authorIds: newBook.authorIds,    // authorIds зазвичай залишається так, або authors
  };

  const response = await apiClient.post('/books', backendPayload);
  return response.data.data;
};

const updateBook = async ({ id, data }: { id: number; data: Partial<BookPayload> }): Promise<IBook> => {
  
  const backendPayload = {
    ...(data.title && { title: data.title }), // Додаємо, тільки якщо є
    ...(data.categoryId && { id_category: data.categoryId }),
    ...(data.genreId && { id_genre: data.genreId }),
    ...(data.authorIds && { authorIds: data.authorIds }),
  };

  const response = await apiClient.patch(`/books/${id}`, backendPayload);
  return response.data.data;
};

const deleteBook = async (id: number): Promise<void> => {
  await apiClient.delete(`/books/${id}`);
};

// --- Hooks ---

export const useBooks = () => useQuery({ 
  queryKey: ['books'], 
  queryFn: getBooks 
});

export const useBook = (id: number) => useQuery({ 
  queryKey: ['books', id], 
  queryFn: () => getBookById(id),
  enabled: !!id 
});

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      navigate({ to: '/books' });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateBook,
    onSuccess: (updatedBook) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      // 👇 Важливо: переконайтеся, що ID називається 'id' (як у JSON бекенду), а не 'id_book'
      queryClient.setQueryData(['books', updatedBook.id], updatedBook);
      navigate({ to: '/books' });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};