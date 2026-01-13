import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditOrderPage } from '@/features/orders/pages/EditOrderPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/orders/$orderId')({
  component: EditOrderPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
