import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateGenrePage } from '@/features/genres/pages/CreateGenrePage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/genres/new')({
  component: CreateGenrePage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
