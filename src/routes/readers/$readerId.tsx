import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditReaderPage } from '@/features/readers/pages/EditReaderPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/readers/$readerId')({
  component: EditReaderPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
