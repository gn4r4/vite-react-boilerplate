import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditCategoryPage } from '@/features/categories/pages/EditCategoryPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/categories/$categoryId')({
  component: EditCategoryPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})