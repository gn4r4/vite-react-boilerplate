import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials, RegisterCredentials, AuthResponse } from './types';

const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data.data;
};

const registerUser = async (credentials: RegisterCredentials): Promise<any> => {
  const response = await apiClient.post('/auth/register', credentials);
  return response.data.data;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {

      const cleanToken = data.token.replace('Bearer ', '');

      setAuth(cleanToken, data.user);

      navigate({ to: '/' });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      alert(error.response?.data?.message || 'Помилка входу');
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      alert('Акаунт створено! Увійдіть, щоб продовжити.');
      navigate({ to: '/login' });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Помилка реєстрації');
    }
  });
};