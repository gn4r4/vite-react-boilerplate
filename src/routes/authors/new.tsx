import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateAuthorPage } from '@/features/authors/pages/CreateAuthorPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/authors/new')({
  component: CreateAuthorPage,
  beforeLoad: () => {
      const role = useAuthStore.getState().user?.role;
      if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
        throw redirect({ to: '/' });
      }
    },
})