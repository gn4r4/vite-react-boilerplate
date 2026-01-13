import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShelvesListPage } from '@/features/shelves/pages/ShelfListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/shelves/')({
  component: ShelvesListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
