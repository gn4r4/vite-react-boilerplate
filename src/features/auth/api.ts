import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials, AuthResponse, Role } from './types';
import { jwtDecode } from 'jwt-decode'; // Імпортуємо бібліотеку

const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', credentials);
  
  const rawToken = response.data.data;
  
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error("Токен не знайдено");
  }

  const cleanToken = rawToken.replace('Bearer ', '');

  try {
    const decoded: any = jwtDecode(cleanToken);

    const roleFromToken = decoded.role;
    
    const userRole: Role = roleFromToken ? roleFromToken.toUpperCase() as Role : 'READER';

    return { token: cleanToken, role: userRole };
  } catch (e) {
    return { token: cleanToken, role: 'READER' };
  }
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data, variables) => {
      setAuth(data.token, variables.email, data.role);
      navigate({ to: '/' });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });
};