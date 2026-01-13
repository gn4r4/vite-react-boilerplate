import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateReaderPage } from '@/features/readers/pages/CreateReaderPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/readers/new')({
  component: CreateReaderPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
