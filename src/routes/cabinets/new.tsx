import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateCabinetPage } from '@/features/cabinets/pages/CreateCabinetPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/cabinets/new')({
  component: CreateCabinetPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
