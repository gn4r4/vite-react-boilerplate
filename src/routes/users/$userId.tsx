import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditUserPage } from '@/features/users/pages/EditUserPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/users/$userId')({
  component: EditUserPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})