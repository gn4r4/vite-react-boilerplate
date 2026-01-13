import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateSupplierPage } from '@/features/suppliers/pages/CreateSupplierPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/suppliers/new')({
  component: CreateSupplierPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})