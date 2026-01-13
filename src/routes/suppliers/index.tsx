import { createFileRoute, redirect } from '@tanstack/react-router'
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/suppliers/')({
  component: SupplierListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})