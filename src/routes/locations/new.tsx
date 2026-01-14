import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateLocationPage } from '@/features/locations/pages/CreateLocationPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/locations/new')({
  component: CreateLocationPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
