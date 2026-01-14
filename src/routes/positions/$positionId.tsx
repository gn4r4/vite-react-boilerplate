import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditPositionPage } from '@/features/positions/pages/EditPositionPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/positions/$positionId')({
  component: EditPositionPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
