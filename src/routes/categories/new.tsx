import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateCategoryPage } from '@/features/categories/pages/CreateCategoryPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/categories/new')({
  component: CreateCategoryPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})