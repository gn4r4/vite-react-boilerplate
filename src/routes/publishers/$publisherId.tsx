import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditPublisherPage } from '@/features/publishers/pages/EditPublisherPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/publishers/$publisherId')({
  component: EditPublisherPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
