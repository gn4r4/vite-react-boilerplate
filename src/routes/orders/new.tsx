import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateOrderPage } from '@/features/orders/pages/CreateOrderPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/orders/new')({
  component: CreateOrderPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
