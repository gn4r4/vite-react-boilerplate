import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditCabinetPage } from '@/features/cabinets/pages/EditCabinetPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/cabinets/$cabinetId')({
  component: EditCabinetPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'RESTORER') {
      throw redirect({ to: '/' });
    }
  },
})
