import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateUserPage } from '@/features/users/pages/CreateUserPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/users/new')({
  component: CreateUserPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})