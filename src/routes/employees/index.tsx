import { createFileRoute } from '@tanstack/react-router'
import { EmployeesListPage } from '@/features/employees/pages/EmployeeListPage';

export const Route = createFileRoute('/employees/')({
  component: EmployeesListPage,
})
