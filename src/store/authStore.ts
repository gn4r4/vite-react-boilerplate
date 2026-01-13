import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Role } from '@/types';

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null; // Ось поле, якого не вистачало на скріншоті
  isAuthenticated: boolean;
  setAuth: (token: string, email: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null, // Початкове значення
      isAuthenticated: false,

      setAuth: (token, email, role) => {
        console.log("Setting Role to Store:", role); // Лог для перевірки
        set({ 
          token, 
          email, 
          role, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        set({ 
          token: null, 
          email: null, 
          role: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);