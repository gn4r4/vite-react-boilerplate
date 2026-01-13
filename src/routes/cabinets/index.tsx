import { createFileRoute, redirect } from '@tanstack/react-router'
import { CabinetsListPage } from '@/features/cabinets/pages/CabinetListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/cabinets/')({
  component: CabinetsListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'RESTORER') {
      throw redirect({ to: '/' });
    }
  },
})
