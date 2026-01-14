import { createFileRoute, redirect } from '@tanstack/react-router'
import { ReaderListPage } from '@/features/readers/pages/ReaderListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/readers/')({
  component: ReaderListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
