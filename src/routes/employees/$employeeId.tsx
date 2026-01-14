import { createFileRoute, redirect } from '@tanstack/react-router'
import { EditEmployeePage } from '@/features/employees/pages/EditEmployeePage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/employees/$employeeId')({
  component: EditEmployeePage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
