import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateEditionPage } from '@/features/editions/pages/CreateEditionPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/editions/new')({
  component: CreateEditionPage,
  beforeLoad: () => {
      const role = useAuthStore.getState().role;
      if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
        throw redirect({ to: '/' });
      }
    },
})
