import { createFileRoute, redirect } from '@tanstack/react-router';
import { CreateCopybookPage } from '@/features/copybooks/pages/CreateCopybookPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/copybooks/new')({
  component: CreateCopybookPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
});