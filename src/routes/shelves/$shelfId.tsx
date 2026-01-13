import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditShelfPage } from '@/features/shelves/pages/EditShelfPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/shelves/$shelfId')({
  component: EditShelfPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
