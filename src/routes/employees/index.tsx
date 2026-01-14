import { createFileRoute, redirect } from '@tanstack/react-router'
import { EmployeesListPage } from '@/features/employees/pages/EmployeeListPage';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/employees/')({
  component: EmployeesListPage,
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;
    if (role != 'ADMINISTRATOR') {
      throw redirect({ to: '/' });
    }
  },
})
