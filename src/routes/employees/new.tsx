import { createFileRoute } from '@tanstack/react-router'
import { CreateEmployeePage } from '@/features/employees/pages/CreateEmployeePage';

export const Route = createFileRoute('/employees/new')({
  component: CreateEmployeePage,
})
