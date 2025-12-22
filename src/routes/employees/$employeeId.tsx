import { createFileRoute } from '@tanstack/react-router'
import { EditEmployeePage } from '@/features/employees/pages/EditEmployeePage';

export const Route = createFileRoute('/employees/$employeeId')({
  component: EditEmployeePage,
})
