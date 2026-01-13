import { createFileRoute, redirect } from '@tanstack/react-router'
import { LocationListPage } from '@/features/locations/pages/LocationListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/locations/')({
  component: LocationListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'RESTORER') {
      throw redirect({ to: '/' });
    }
  },
})
