import { createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { MainLayout } from '../pages/MainLayout';
import { useAuthStore } from '@/store/authStore';

export const Route = createRootRoute({
  component: MainLayout,
  
  beforeLoad: ({ location }) => {

    const { token } = useAuthStore.getState();
    
    const isAuthenticated = !!token;
    
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    
    const isPublicPage = publicRoutes.some(path => location.pathname.startsWith(path));

    if (isAuthenticated && isPublicPage) {
      throw redirect({ to: '/' });
    }
  },
});