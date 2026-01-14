import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateLendingPage } from '@/features/lendings/pages/CreateLendingPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/lendings/new')({
  component: CreateLendingPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
