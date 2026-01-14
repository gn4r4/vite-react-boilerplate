import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditBookPage } from '@/features/books/pages/EditBookPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/books/$bookId')({
  component: EditBookPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
