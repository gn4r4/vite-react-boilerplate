import { createFileRoute } from '@tanstack/react-router'
import { CreateSupplierPage } from '@/features/suppliers/pages/CreateSupplierPage';

export const Route = createFileRoute('/suppliers/new')({
  component: CreateSupplierPage,
})