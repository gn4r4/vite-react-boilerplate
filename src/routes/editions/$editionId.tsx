import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditEditionPage } from '@/features/editions/pages/EditEditionPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/editions/$editionId')({
  component: EditEditionPage,
  beforeLoad: () => {
      const role = useAuthStore.getState().user?.role;
      if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
        throw redirect({ to: '/' });
      }
    },
})
