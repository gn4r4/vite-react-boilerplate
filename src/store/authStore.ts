import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Убедись, что путь к типам правильный!
import { IUser } from '@/features/users/types'; 

// 1. Исправляем интерфейс
interface AuthState {
  token: string | null;
  user: IUser | null;       
  isAuthenticated: boolean; // <--- ДОБАВИЛИ (исправляет ошибку на скрине 2)
  
  // <--- ИСПРАВИЛИ (принимаем 2 аргумента, исправляет ошибку на скрине 1)
  setAuth: (token: string, user: IUser) => void; 
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        console.log("Setting Auth Data:", { token, user }); 
        set({ 
          token, 
          user, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);