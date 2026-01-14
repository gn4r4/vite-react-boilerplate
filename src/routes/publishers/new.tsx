import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreatePublisherPage } from '@/features/publishers/pages/CreatePublisherPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/publishers/new')({
  component: CreatePublisherPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
