import { createFileRoute, redirect } from '@tanstack/react-router'
import { UsersListPage } from '@/features/users/pages/UsersListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/users/')({
  component: UsersListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})