import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateBookPage } from '@/features/books/pages/CreateBookPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/books/new')({
  component: CreateBookPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
