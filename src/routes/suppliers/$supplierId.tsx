import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditSupplierPage } from '@/features/suppliers/pages/EditSupplierPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/suppliers/$supplierId')({
  component: EditSupplierPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR' && role != 'LIBRARIAN') {
      throw redirect({ to: '/' });
    }
  },
})
