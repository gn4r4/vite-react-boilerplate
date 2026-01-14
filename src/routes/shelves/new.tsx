import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateShelfPage } from '@/features/shelves/pages/CreateShelfPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/shelves/new')({
  component: CreateShelfPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
