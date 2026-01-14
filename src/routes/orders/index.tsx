import { createFileRoute, redirect } from '@tanstack/react-router'
import { OrdersListPage } from '@/features/orders/pages/OrderListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/orders/')({
  component: OrdersListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
