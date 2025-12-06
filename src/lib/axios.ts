import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // Імпорт стору

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Опціонально: перехоплювач для 401 помилки (якщо токен протух - розлогінити)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      // Можна додати редірект на логін, якщо потрібно
    }
    return Promise.reject(error);
  }
);

export default apiClient;