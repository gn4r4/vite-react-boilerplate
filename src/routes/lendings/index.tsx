import { createFileRoute, redirect } from '@tanstack/react-router'
import { LendingsListPage } from '@/features/lendings/pages/LendingListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/lendings/')({
  component: LendingsListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
