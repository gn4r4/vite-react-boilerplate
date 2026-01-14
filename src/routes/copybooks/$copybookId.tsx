import { createFileRoute, redirect } from '@tanstack/react-router';
import { EditCopybookPage } from '@/features/copybooks/pages/EditCopybookPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/copybooks/$copybookId')({
  component: EditCopybookPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN' && role != 'RESTORER') {
      throw redirect({ to: '/' });
    }
  },
});