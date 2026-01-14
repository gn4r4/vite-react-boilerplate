import { createFileRoute, redirect } from '@tanstack/react-router';
import { CopybooksListPage } from '@/features/copybooks/pages/CopybookListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/copybooks/')({
  component: CopybooksListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN' && role != 'RESTORER') {
      throw redirect({ to: '/' });
    }
  },
});