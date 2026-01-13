import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreatePositionPage } from '@/features/positions/pages/CreatePositionPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/positions/new')({
  component: CreatePositionPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
