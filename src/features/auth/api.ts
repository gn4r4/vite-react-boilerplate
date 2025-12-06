import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials, AuthResponse } from './types';

// Запит на сервер
const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);

  const rawToken = response.data.data;

  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error("Токен не знайдено або формат неправильний");
  }

  const cleanToken = rawToken.replace('Bearer ', '');

  return { token: cleanToken };
};

// Хук
export const useLogin = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 1. Зберігаємо токен у Zustand (і localStorage)
      setToken(data.token);
      
      // 2. Перенаправляємо на головну або на книги
      navigate({ to: '/books' });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });
};