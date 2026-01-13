import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateEmployeePage } from '@/features/employees/pages/CreateEmployeePage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/employees/new')({
  component: CreateEmployeePage,
  beforeLoad: () => {
    const role = useAuthStore.getState().role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
