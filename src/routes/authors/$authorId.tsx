import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditAuthorPage } from '@/features/authors/pages/EditAuthorPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/authors/$authorId')({
  component: EditAuthorPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})