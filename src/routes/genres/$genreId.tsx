import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditGenrePage } from '@/features/genres/pages/EditGenrePage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/genres/$genreId')({
  component: EditGenrePage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
