import { createFileRoute } from '@tanstack/react-router'
import { SupplierListPage } from '@/features/suppliers/pages/SupplierListPage';

export const Route = createFileRoute('/suppliers/')({
  component: SupplierListPage,
})