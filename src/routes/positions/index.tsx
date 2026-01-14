import { createFileRoute, redirect } from '@tanstack/react-router'
import { PositionsListPage } from '@/features/positions/pages/PositionListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/positions/')({
  component: PositionsListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
