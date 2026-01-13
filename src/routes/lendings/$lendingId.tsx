import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditLendingPage } from '@/features/lendings/pages/EditLendingPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/lendings/$lendingId')({
  component: EditLendingPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
